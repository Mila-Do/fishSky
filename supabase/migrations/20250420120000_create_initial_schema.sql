-- Migration: Create initial schema for FishSky application
-- Description: Creates tables, types, extensions, and RLS policies for the flashcard application
-- Tables: users, flashcards, ai_statistics
-- Types: flashcard_status, flashcard_source
-- Extensions: pgcrypto, citext

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Create custom types
CREATE TYPE flashcard_status AS ENUM ('pending', 'accepted', 'rejected', 'custom');
CREATE TYPE flashcard_source AS ENUM ('ai', 'manual');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    front VARCHAR(200) NOT NULL CHECK (char_length(front) <= 200),
    back VARCHAR(500) NOT NULL CHECK (char_length(back) <= 500),
    status flashcard_status NOT NULL DEFAULT 'pending',
    source flashcard_source NOT NULL,
    ai_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Create ai_statistics table
CREATE TABLE ai_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_generated BIGINT NOT NULL DEFAULT 0,
    total_accepted BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_user_status ON flashcards(user_id, status);
CREATE INDEX idx_ai_statistics_user_id ON ai_statistics(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_ai_statistics_updated_at
    BEFORE UPDATE ON ai_statistics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flashcards
-- Policy for SELECT operations
CREATE POLICY flashcards_select_policy ON flashcards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for INSERT operations
CREATE POLICY flashcards_insert_policy ON flashcards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE operations
CREATE POLICY flashcards_update_policy ON flashcards
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE operations
CREATE POLICY flashcards_delete_policy ON flashcards
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for ai_statistics
-- Policy for SELECT operations
CREATE POLICY ai_statistics_select_policy ON ai_statistics
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for INSERT operations
CREATE POLICY ai_statistics_insert_policy ON ai_statistics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE operations
CREATE POLICY ai_statistics_update_policy ON ai_statistics
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE operations
CREATE POLICY ai_statistics_delete_policy ON ai_statistics
    FOR DELETE
    USING (auth.uid() = user_id); 