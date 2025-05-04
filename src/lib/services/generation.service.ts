import type { SupabaseClient } from '../../db/supabase.client';
import type { Database } from '../../db/database.types';
import type {
  FlashcardProposalDTO,
  GenerationCreateCommandDTO,
  GenerationGetResponseDTO,
  FlashcardStatus,
} from '../../types';
import { createHash } from 'crypto';

const SAMPLE_TOPICS = [
  'historia',
  'nauka',
  'geografia',
  'literatura',
  'medycyna',
  'technologia',
  'programowanie',
  'sztuka',
  'muzyka',
];

enum AIServiceErrorType {
  TIMEOUT = 'timeout',
  CONTENT_POLICY = 'contentPolicy',
  SERVER_OVERLOAD = 'serverOverload',
  INVALID_RESPONSE = 'invalidResponse',
  UNKNOWN = 'unknown',
}

class AIServiceError extends Error {
  type: AIServiceErrorType;

  constructor(message: string, type: AIServiceErrorType = AIServiceErrorType.UNKNOWN) {
    super(message);
    this.name = 'AIServiceError';
    this.type = type;
  }
}

const mockAiService = async (
  text: string,
  model: string,
  status: FlashcardStatus = 'pending'
): Promise<FlashcardProposalDTO[]> => {
  if (Math.random() < 0.1) {
    const errorTypes = Object.values(AIServiceErrorType);
    const randomErrorType = errorTypes[Math.floor(Math.random() * errorTypes.length)] as AIServiceErrorType;

    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    switch (randomErrorType) {
      case AIServiceErrorType.TIMEOUT:
        throw new AIServiceError('AI service request timed out after 60 seconds', AIServiceErrorType.TIMEOUT);
      case AIServiceErrorType.CONTENT_POLICY:
        throw new AIServiceError('Input text violates content policy guidelines', AIServiceErrorType.CONTENT_POLICY);
      case AIServiceErrorType.SERVER_OVERLOAD:
        throw new AIServiceError(
          'AI service is currently overloaded, try again later',
          AIServiceErrorType.SERVER_OVERLOAD
        );
      case AIServiceErrorType.INVALID_RESPONSE:
        throw new AIServiceError('AI service returned invalid response format', AIServiceErrorType.INVALID_RESPONSE);
      default:
        throw new AIServiceError('Unknown error occurred in AI service', AIServiceErrorType.UNKNOWN);
    }
  }

  const processingTime = 1000 + Math.random() * 3000;
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]/)
    .filter((s) => s.trim().length > 10)
    .map((s) => s.trim());

  const count = Math.floor(Math.random() * 6) + 3;
  const proposals: FlashcardProposalDTO[] = [];

  for (let i = 0; i < count; i++) {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    const randomTopic = SAMPLE_TOPICS[Math.floor(Math.random() * SAMPLE_TOPICS.length)];

    let question: string;
    let answer: string;

    const formatType = Math.floor(Math.random() * 3);

    if (formatType === 0) {
      const words = randomSentence.split(' ');
      const keyTerms = words.filter((w) => w.length > 6).slice(0, 2);
      const term = keyTerms.length > 0 ? keyTerms[0] : randomTopic;

      question = `Co to jest ${term}?`;
      answer = randomSentence;
    } else if (formatType === 1) {
      question = `Wyjaśnij kluczowe aspekty tematu: ${randomTopic}`;
      answer = randomSentence;
    } else {
      const words = randomSentence.split(' ');
      const midPoint = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, midPoint).join(' ');
      const secondHalf = words.slice(midPoint).join(' ');

      question = `${firstHalf}...`;
      answer = secondHalf;
    }

    proposals.push({
      flashcardId: crypto.randomUUID(),
      flashcardFront: question,
      flashcardBack: answer,
      flashcardStatus: status,
      flashcardSource: 'ai-full',
    });
  }

  return proposals;
};

// Funkcja do obliczania hasha tekstu używając MD5
const calculateTextHash = (text: string): string => {
  return createHash('md5').update(text).digest('hex');
};

export async function generateFlashcards(
  supabase: SupabaseClient,
  command: GenerationCreateCommandDTO,
  flashcardStatus: FlashcardStatus = 'pending',
  userId: string
): Promise<GenerationGetResponseDTO> {
  const startTime = Date.now();
  let generationId = '';

  try {
    // Przygotowanie danych generacji
    const sourceTextHash = calculateTextHash(command.generationSourceText);
    const sourceTextLength = command.generationSourceText.length;
    const duration = 0;

    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .insert({
        userId: userId,
        model: command.generationModel,
        generatedCount: 0,
        acceptedUneditedCount: 0,
        acceptedEditedCount: 0,
        sourceTextHash,
        sourceTextLength,
        generationDuration: duration,
      })
      .select('id')
      .single();

    if (generationError || !generation) {
      throw new Error(`Failed to create generation record: ${generationError?.message || 'Unknown error'}`);
    }

    generationId = generation.id;

    let proposals;
    try {
      proposals = await mockAiService(command.generationSourceText, command.generationModel, flashcardStatus);
    } catch (aiError) {
      if (aiError instanceof AIServiceError) {
        await supabase.from('generationErrorLogs').insert({
          userId: userId,
          model: command.generationModel,
          sourceTextHash,
          sourceTextLength,
          errorCode: `AI_SERVICE_ERROR.${aiError.type.toUpperCase()}`,
          errorMessage: aiError.message,
        });

        throw new Error(`AI service error: ${aiError.message}`);
      }
      throw aiError;
    }

    const { error: flashcardsError } = await supabase.from('flashcards').insert(
      proposals.map((proposal) => ({
        id: proposal.flashcardId,
        userId: userId,
        generationId: generationId,
        front: proposal.flashcardFront,
        back: proposal.flashcardBack,
        status: flashcardStatus,
        source: 'ai-full' as const,
      }))
    );

    if (flashcardsError) {
      throw new Error(`Failed to insert flashcard proposals: ${flashcardsError.message}`);
    }

    const finalDuration = Date.now() - startTime;
    const { error: updateError } = await supabase
      .from('generations')
      .update({
        generatedCount: proposals.length,
        generationDuration: finalDuration,
      })
      .eq('id', generationId);

    if (updateError) {
      throw new Error(`Failed to update generation status: ${updateError.message}`);
    }

    return {
      generationId,
      generationFlashcardProposals: proposals,
      generationCount: proposals.length,
      generationDuration: finalDuration,
    };
  } catch (error) {
    if (generationId) {
      await supabase.from('generationErrorLogs').insert({
        userId: userId,
        model: command.generationModel,
        sourceTextHash: calculateTextHash(command.generationSourceText),
        sourceTextLength: command.generationSourceText.length,
        errorCode: error instanceof AIServiceError ? `AI_SERVICE_ERROR.${error.type.toUpperCase()}` : 'GENERAL_ERROR',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    throw error;
  }
}
