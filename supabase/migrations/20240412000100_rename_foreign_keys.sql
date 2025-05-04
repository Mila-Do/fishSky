-- Rename foreign key constraints
ALTER TABLE generations 
    RENAME CONSTRAINT generations_user_id_fkey TO "generationsUserId_fkey";

ALTER TABLE "generationErrorLogs"
    RENAME CONSTRAINT generation_error_logs_user_id_fkey TO "generationErrorLogsUserId_fkey";

ALTER TABLE flashcards
    RENAME CONSTRAINT flashcards_user_id_fkey TO "flashcardsUserId_fkey";

ALTER TABLE flashcards
    RENAME CONSTRAINT flashcards_generation_id_fkey TO "flashcardsGenerationId_fkey"; 