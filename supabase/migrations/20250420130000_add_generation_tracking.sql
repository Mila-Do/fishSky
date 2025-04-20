-- Add generation tracking tables and modify existing schema

-- Create generations table
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model VARCHAR NOT NULL,
    generated_count INT4 NOT NULL DEFAULT 0,
    accepted_unedited_count INT4 NOT NULL DEFAULT 0,
    accepted_edited_count INT4 NOT NULL DEFAULT 0,
    source_text_hash VARCHAR NOT NULL,
    source_text_length INT4 NOT NULL,
    generation_duration INT4 NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create generation error logs table
CREATE TABLE generation_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model VARCHAR NOT NULL,
    source_text_hash VARCHAR NOT NULL,
    source_text_length INT4 NOT NULL,
    error_code VARCHAR NOT NULL,
    error_message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add generation_id to flashcards
ALTER TABLE flashcards 
ADD COLUMN generation_id UUID REFERENCES generations(id) ON DELETE SET NULL;

-- Create indexes for new tables
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);
CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);

-- Enable RLS on new tables
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for generations
CREATE POLICY generations_select_policy ON generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY generations_insert_policy ON generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY generations_update_policy ON generations
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY generations_delete_policy ON generations
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for generation_error_logs
CREATE POLICY generation_error_logs_select_policy ON generation_error_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY generation_error_logs_insert_policy ON generation_error_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER set_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Drop ai_statistics table as it's now redundant
DROP TABLE ai_statistics; 