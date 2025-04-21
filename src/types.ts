import type { Database } from './db/database.types';

// Basic database types
export type Flashcard = Database['public']['Tables']['flashcards']['Row'];
export type FlashcardInsert =
  Database['public']['Tables']['flashcards']['Insert'];
export type FlashcardUpdate =
  Database['public']['Tables']['flashcards']['Update'];
export type Generation = Database['public']['Tables']['generations']['Row'];
export type GenerationInsert =
  Database['public']['Tables']['generations']['Insert'];
export type GenerationErrorLog =
  Database['public']['Tables']['generationErrorLogs']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

// Common types
export interface PaginationMetadata {
  paginationTotal: number;
  paginationPage: number;
  paginationLimit: number;
  paginationHasMore: boolean;
}

export interface ListResponse<T> {
  listItems: T[];
  listMetadata: PaginationMetadata;
}

// Flashcard types
export type FlashcardSource = 'manual' | 'ai-full' | 'ai-edited';
export type FlashcardStatus = Database['public']['Enums']['flashcard_status'];

export interface FlashcardGetResponseDTO {
  flashcardId: string;
  flashcardFront: string;
  flashcardBack: string;
  flashcardStatus: FlashcardStatus;
  flashcardSource: FlashcardSource;
  flashcardGenerationId: string | null;
  flashcardCreatedAt: string;
  flashcardUpdatedAt: string;
  flashcardUserId: string;
  flashcardAiMetadata: object | null;
}

export interface FlashcardCreateCommandDTO {
  flashcardFront: string; // Max 200 chars
  flashcardBack: string; // Max 500 chars
  flashcardSource: FlashcardSource;
  flashcardGenerationId?: string | null;
}

export type FlashcardUpdateCommandDTO = Partial<{
  flashcardFront: string; // Max 200 chars
  flashcardBack: string; // Max 500 chars
  flashcardSource: Exclude<FlashcardSource, 'ai-full'>; // Cannot change to ai-full after creation
  flashcardGenerationId: string | null;
  flashcardStatus: FlashcardStatus;
}>;

export interface FlashcardCreateBatchCommandDTO {
  flashcardList: {
    flashcardFront: string;
    flashcardBack: string;
    flashcardSource: 'manual';
  }[];
}

export type FlashcardListResponseDTO = ListResponse<FlashcardGetResponseDTO>;

// Generation types
export interface FlashcardProposalDTO {
  flashcardId: string;
  flashcardFront: string;
  flashcardBack: string;
  flashcardStatus: 'pending';
  flashcardSource: 'ai-full';
}

export interface GenerationCreateCommandDTO {
  generationSourceText: string; // 1000-10000 chars
  generationModel: string;
}

export interface GenerationGetResponseDTO {
  generationId: string;
  generationFlashcardProposals: FlashcardProposalDTO[];
  generationCount: number;
  generationDuration: number;
}

export interface GenerationStatsResponseDTO {
  generationTotalProposed: number;
  generationAcceptedCount: number;
  generationAcceptedEditedCount: number;
  generationRejectedCount: number;
}

export type GenerationListResponseDTO = ListResponse<{
  generationId: string;
  generationModel: string;
  generationCreatedAt: string;
  generationGeneratedCount: number;
  generationAcceptedUneditedCount: number;
  generationAcceptedEditedCount: number;
  generationDuration: number;
}>;

// API response format
export interface ApiSuccessResponse<T> {
  apiData: T;
  apiMetadata: {
    apiTimestamp: string;
    apiRequestId: string;
  };
}

export interface ApiErrorResponse {
  apiError: {
    apiErrorCode: string;
    apiErrorMessage: string;
    apiErrorDetails: object | null;
  };
  apiMetadata: {
    apiTimestamp: string;
    apiRequestId: string;
  };
}
