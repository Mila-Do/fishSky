import { z } from 'zod';

// Define valid flashcard sources
const flashcardSourceEnum = z.enum(['manual', 'ai-full', 'ai-edited']);

// Define valid flashcard statuses
const flashcardStatusEnum = z.enum(['pending', 'accepted', 'rejected', 'custom']);

// Schema for single flashcard creation
export const flashcardCreateSchema = z.object({
  flashcardFront: z.string().max(200, 'Front text must be at most 200 characters'),
  flashcardBack: z.string().max(500, 'Back text must be at most 500 characters'),
  flashcardSource: flashcardSourceEnum,
  flashcardGenerationId: z.string().uuid().nullable().optional(),
  flashcardStatus: flashcardStatusEnum.default('accepted'),
});

// Schema for batch flashcard creation
export const flashcardBatchCreateSchema = z.object({
  flashcardList: z.array(
    z.object({
      flashcardFront: z.string().max(200, 'Front text must be at most 200 characters'),
      flashcardBack: z.string().max(500, 'Back text must be at most 500 characters'),
      flashcardSource: flashcardSourceEnum,
      flashcardGenerationId: z.string().uuid().nullable().optional(),
      flashcardStatus: flashcardStatusEnum.default('accepted'),
    })
  ).min(1, 'At least one flashcard must be provided'),
});

// Additional validation for source and generationId rules can be done at runtime:
// - manual source: generationId must be null
// - ai-full/ai-edited source: generationId must not be null

// Type for the response format
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    apiData: dataSchema,
    apiMetadata: z.object({
      apiTimestamp: z.string(),
      apiRequestId: z.string(),
    }),
  });

// Type for error response format
export const apiErrorSchema = z.object({
  apiError: z.object({
    apiErrorCode: z.string(),
    apiErrorMessage: z.string(),
    apiErrorDetails: z.any().nullable(),
  }),
  apiMetadata: z.object({
    apiTimestamp: z.string(),
    apiRequestId: z.string(),
  }),
});

// Schema for flashcard response
export const flashcardResponseSchema = z.object({
  flashcardId: z.string().uuid(),
  flashcardFront: z.string(),
  flashcardBack: z.string(),
  flashcardStatus: flashcardStatusEnum,
  flashcardSource: flashcardSourceEnum,
  flashcardGenerationId: z.string().uuid().nullable(),
  flashcardCreatedAt: z.string(),
  flashcardUpdatedAt: z.string(),
});

// Schema for batch response
export const flashcardBatchResponseSchema = z.object({
  listItems: z.array(flashcardResponseSchema),
  listTotal: z.number().int().nonnegative(),
});

// Export type definitions from the schemas
export type FlashcardCreateSchema = z.infer<typeof flashcardCreateSchema>;
export type FlashcardBatchCreateSchema = z.infer<typeof flashcardBatchCreateSchema>;
export type FlashcardResponseSchema = z.infer<typeof flashcardResponseSchema>;
export type FlashcardBatchResponseSchema = z.infer<typeof flashcardBatchResponseSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema<z.ZodType<T>>>>;
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>; 