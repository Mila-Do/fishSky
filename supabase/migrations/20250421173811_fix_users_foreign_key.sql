-- Migration: fix_users_foreign_key
-- Description: Changes foreign key references to point to auth.users instead of public.users
-- Date: 2024-04-21 17:38:11

-- Drop existing foreign key constraints
ALTER TABLE generations
    DROP CONSTRAINT IF EXISTS "generationsUserId_fkey";

ALTER TABLE "generationErrorLogs"
    DROP CONSTRAINT IF EXISTS "generationErrorLogsUserId_fkey";

ALTER TABLE flashcards
    DROP CONSTRAINT IF EXISTS "flashcardsUserId_fkey";

-- Add new foreign key constraints pointing to auth.users
ALTER TABLE generations
    ADD CONSTRAINT "generationsUserId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES auth.users(id);

ALTER TABLE "generationErrorLogs"
    ADD CONSTRAINT "generationErrorLogsUserId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES auth.users(id);

ALTER TABLE flashcards
    ADD CONSTRAINT "flashcardsUserId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES auth.users(id);
