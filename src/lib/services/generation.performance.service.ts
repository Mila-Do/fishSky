import type { SupabaseClient } from '../../db/supabase.client';
import type {
  FlashcardProposalDTO,
  GenerationCreateCommandDTO,
  GenerationGetResponseDTO,
  FlashcardStatus,
} from '../../types';
import { createHash } from 'crypto';

/**
 * Symulowana usługa AI dla testów wydajnościowych.
 * Umożliwia testowanie z różnymi parametrami wydajnościowymi.
 */
export class PerformanceTestAIService {
  // Parametry testów wydajnościowych
  private responseDelay = 0; // Dodatkowe opóźnienie w ms
  private failureRate = 0; // Procent niepowodzeń (0-100)
  private cpuIntensity = 0; // Symulowana intensywność CPU (0-10)
  private variableLatency = false; // Czy symulować zmienne opóźnienia

  constructor(options?: {
    responseDelay?: number;
    failureRate?: number;
    cpuIntensity?: number;
    variableLatency?: boolean;
  }) {
    if (options) {
      this.responseDelay = options.responseDelay ?? this.responseDelay;
      this.failureRate = options.failureRate ?? this.failureRate;
      this.cpuIntensity = options.cpuIntensity ?? this.cpuIntensity;
      this.variableLatency = options.variableLatency ?? this.variableLatency;
    }
  }

  /**
   * Symuluje operację intensywną dla CPU
   */
  private simulateCpuIntensiveTask() {
    if (this.cpuIntensity <= 0) return;

    const iterations = this.cpuIntensity * 10000000;
    let result = 0;

    for (let i = 0; i < iterations; i++) {
      result += Math.sin(i) * Math.cos(i);
    }

    return result;
  }

  /**
   * Symuluje zmienne opóźnienia sieciowe
   */
  private async simulateNetworkLatency() {
    let delay = this.responseDelay;

    if (this.variableLatency) {
      // Dodaj losowe wahania ±30%
      const variance = this.responseDelay * 0.3;
      delay += Math.random() * 2 * variance - variance;
    }

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  /**
   * Symuluje generowanie fiszek dla celów testów wydajnościowych
   */
  async generateFlashcards(
    text: string,
    model: string,
    status: FlashcardStatus = 'pending',
    count = 5
  ): Promise<FlashcardProposalDTO[]> {
    // Symulacja niepowodzenia
    if (Math.random() * 100 < this.failureRate) {
      await this.simulateNetworkLatency();
      throw new Error(`Performance test simulated failure (${this.failureRate}% chance)`);
    }

    // Symulacja obciążenia CPU
    this.simulateCpuIntensiveTask();

    // Symulacja opóźnień sieciowych
    await this.simulateNetworkLatency();

    // Generowanie określonej liczby fiszek
    const proposals: FlashcardProposalDTO[] = [];

    for (let i = 0; i < count; i++) {
      proposals.push({
        flashcardId: crypto.randomUUID(),
        flashcardFront: `Test question ${i + 1} under model: ${model}`,
        flashcardBack: `Test answer ${i + 1} for input text of length: ${text.length}`,
        flashcardStatus: status,
        flashcardSource: 'ai-full',
      });
    }

    return proposals;
  }
}

/**
 * Funkcja do przeprowadzenia testu wydajnościowego
 */
export async function runPerformanceTest(
  supabase: SupabaseClient,
  command: GenerationCreateCommandDTO,
  performanceOptions: {
    responseDelay?: number;
    failureRate?: number;
    cpuIntensity?: number;
    variableLatency?: boolean;
    flashcardCount?: number;
    retries?: number;
  },
  userId: string
): Promise<GenerationGetResponseDTO> {
  const startTime = Date.now();
  let generationId = '';

  // Ustawienia domyślne
  const options = {
    responseDelay: 2000,
    failureRate: 10,
    cpuIntensity: 3,
    variableLatency: true,
    flashcardCount: 5,
    retries: 2,
    ...performanceOptions,
  };

  // Inicjalizacja usługi testowej
  const performanceAIService = new PerformanceTestAIService({
    responseDelay: options.responseDelay,
    failureRate: options.failureRate,
    cpuIntensity: options.cpuIntensity,
    variableLatency: options.variableLatency,
  });

  try {
    // Obliczanie hasha tekstu
    const sourceTextHash = createHash('md5').update(command.generationSourceText).digest('hex');
    const sourceTextLength = command.generationSourceText.length;

    // Zapis rekordu generacji w bazie danych
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .insert({
        userId: userId,
        model: `${command.generationModel}-performance-test`,
        generatedCount: 0,
        acceptedUneditedCount: 0,
        acceptedEditedCount: 0,
        sourceTextHash,
        sourceTextLength,
        generationDuration: 0,
      })
      .select('id')
      .single();

    if (generationError || !generation) {
      throw new Error(`Failed to create generation record: ${generationError?.message || 'Unknown error'}`);
    }

    generationId = generation.id;

    // Próba generowania fiszek z ponowieniami
    let proposals: FlashcardProposalDTO[] = [];
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= options.retries) {
      try {
        proposals = await performanceAIService.generateFlashcards(
          command.generationSourceText,
          command.generationModel,
          'pending',
          options.flashcardCount
        );
        break; // Sukces - zakończ pętlę
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;

        if (attempts > options.retries) {
          // Zapisz błąd do logów i rzuć wyjątek
          await supabase.from('generationErrorLogs').insert({
            userId: userId,
            model: `${command.generationModel}-performance-test`,
            sourceTextHash,
            sourceTextLength,
            errorCode: 'PERFORMANCE_TEST_ERROR',
            errorMessage: lastError.message,
          });

          throw new Error(`Performance test failed after ${attempts} attempts: ${lastError.message}`);
        }

        // Krótkie oczekiwanie przed ponowieniem
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Zapisz propozycje do bazy danych
    const { error: flashcardsError } = await supabase.from('flashcards').insert(
      proposals.map((proposal) => ({
        id: proposal.flashcardId,
        userId: userId,
        generationId: generationId,
        front: proposal.flashcardFront,
        back: proposal.flashcardBack,
        status: 'pending' as const,
        source: 'ai-full' as const,
      }))
    );

    if (flashcardsError) {
      throw new Error(`Failed to insert flashcard proposals: ${flashcardsError.message}`);
    }

    // Aktualizacja rekordu generacji z informacjami o czasie i liczbie
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

    // Przygotowanie odpowiedzi
    return {
      generationId,
      generationFlashcardProposals: proposals,
      generationCount: proposals.length,
      generationDuration: finalDuration,
    };
  } catch (error) {
    // Zapisz błąd do logów, jeśli ID generacji zostało już utworzone
    if (generationId) {
      await supabase.from('generationErrorLogs').insert({
        userId: userId,
        model: `${command.generationModel}-performance-test`,
        sourceTextHash: createHash('md5').update(command.generationSourceText).digest('hex'),
        sourceTextLength: command.generationSourceText.length,
        errorCode: 'PERFORMANCE_TEST_ERROR',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    throw error;
  }
}
