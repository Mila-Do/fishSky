import type { SupabaseClient } from '../../db/supabase.client';
import type { FlashcardCreateSchema } from '../schemas/flashcard.schema';
import type { FlashcardSource, FlashcardStatus } from '../../types';

/**
 * Validates the consistency between flashcard source and generationId
 */
export function validateFlashcardSource(source: FlashcardSource, generationId: string | null | undefined): boolean {
  if (source === 'manual' && generationId !== null && generationId !== undefined) {
    return false; // Manual flashcards cannot have a generationId
  }
  if ((source === 'ai-full' || source === 'ai-edited') && (generationId === null || generationId === undefined)) {
    return false; // AI flashcards must have a generationId
  }
  return true;
}

/**
 * Creates a new flashcard
 */
export async function createFlashcard(
  supabase: SupabaseClient,
  flashcardData: FlashcardCreateSchema,
  userId: string
) {
  // Validate consistency between source and generationId
  if (!validateFlashcardSource(flashcardData.flashcardSource, flashcardData.flashcardGenerationId)) {
    throw new Error(`Invalid flashcard configuration: Source '${flashcardData.flashcardSource}' is incompatible with the provided generationId`);
  }

  // Map DTO fields to database fields
  const dbData = {
    front: flashcardData.flashcardFront,
    back: flashcardData.flashcardBack,
    source: flashcardData.flashcardSource,
    generationId: flashcardData.flashcardGenerationId || null,
    status: flashcardData.flashcardStatus || 'accepted',
    userId: userId,
  };

  // Insert the flashcard into the database
  const { data, error } = await supabase
    .from('flashcards')
    .insert(dbData)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to insert flashcard: ${error.message}`);
  }

  // Map database response to DTO format
  return {
    flashcardId: data.id,
    flashcardFront: data.front,
    flashcardBack: data.back,
    flashcardStatus: data.status as FlashcardStatus,
    flashcardSource: data.source as FlashcardSource,
    flashcardGenerationId: data.generationId,
    flashcardCreatedAt: data.createdAt,
    flashcardUpdatedAt: data.updatedAt,
    flashcardUserId: data.userId,
    flashcardAiMetadata: data.aiMetadata,
  };
}

/**
 * Creates multiple flashcards in a batch
 */
export async function createFlashcardBatch(
  supabase: SupabaseClient,
  flashcards: FlashcardCreateSchema[],
  userId: string
) {
  // Validate each flashcard
  for (const flashcard of flashcards) {
    if (!validateFlashcardSource(flashcard.flashcardSource, flashcard.flashcardGenerationId)) {
      throw new Error(
        `Invalid flashcard configuration: Source '${flashcard.flashcardSource}' is incompatible with the provided generationId`
      );
    }
  }

  // Map DTO fields to database fields
  const dbData = flashcards.map((flashcard) => ({
    front: flashcard.flashcardFront,
    back: flashcard.flashcardBack,
    source: flashcard.flashcardSource,
    generationId: flashcard.flashcardGenerationId || null,
    status: flashcard.flashcardStatus || 'accepted',
    userId: userId,
  }));

  // Insert all flashcards in a batch
  const { data, error } = await supabase.from('flashcards').insert(dbData).select('*');

  if (error) {
    throw new Error(`Failed to insert flashcard batch: ${error.message}`);
  }

  // Map database response to DTO format
  const mappedData = data.map((record) => ({
    flashcardId: record.id,
    flashcardFront: record.front,
    flashcardBack: record.back,
    flashcardStatus: record.status as FlashcardStatus,
    flashcardSource: record.source as FlashcardSource,
    flashcardGenerationId: record.generationId,
    flashcardCreatedAt: record.createdAt,
    flashcardUpdatedAt: record.updatedAt,
    flashcardUserId: record.userId,
    flashcardAiMetadata: record.aiMetadata,
  }));

  return {
    listItems: mappedData,
    listTotal: mappedData.length,
  };
} 