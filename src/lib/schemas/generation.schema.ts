import { z } from 'zod';

// Schema for generationCreateCommand
export const generationCreateSchema = z.object({
  generationSourceText: z
    .string()
    .min(1000, 'Text must be at least 1000 characters long')
    .max(10000, 'Text cannot exceed 10000 characters'),
  generationModel: z.string().min(1, 'Model name is required'),
});

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

// Define valid flashcard statuses
const flashcardStatusEnum = z.enum(['pending', 'accepted', 'rejected']);

// Schema for the generation response
export const generationResponseSchema = z.object({
  generationId: z.string().uuid(),
  generationFlashcardProposals: z.array(
    z.object({
      flashcardId: z.string().uuid(),
      flashcardFront: z.string(),
      flashcardBack: z.string(),
      flashcardStatus: flashcardStatusEnum,
      flashcardSource: z.literal('ai-full'),
    })
  ),
  generationCount: z.number().int().positive(),
  generationDuration: z.number().int().positive(),
});

// Export type definitions from the schemas
export type GenerationCreateSchema = z.infer<typeof generationCreateSchema>;
export type GenerationResponseSchema = z.infer<typeof generationResponseSchema>;
export type ApiResponse<T> = z.infer<
  ReturnType<typeof apiResponseSchema<z.ZodType<T>>>
>;
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
