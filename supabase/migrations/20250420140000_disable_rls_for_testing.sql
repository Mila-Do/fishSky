-- Temporarily disable RLS for testing purposes

-- Disable RLS on tables
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
ALTER TABLE generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs DISABLE ROW LEVEL SECURITY;

-- Drop all policies from flashcards
DROP POLICY IF EXISTS flashcards_select_policy ON flashcards;
DROP POLICY IF EXISTS flashcards_insert_policy ON flashcards;
DROP POLICY IF EXISTS flashcards_update_policy ON flashcards;
DROP POLICY IF EXISTS flashcards_delete_policy ON flashcards;

-- Drop all policies from generations
DROP POLICY IF EXISTS generations_select_policy ON generations;
DROP POLICY IF EXISTS generations_insert_policy ON generations;
DROP POLICY IF EXISTS generations_update_policy ON generations;
DROP POLICY IF EXISTS generations_delete_policy ON generations;

-- Drop all policies from generation_error_logs
DROP POLICY IF EXISTS generation_error_logs_select_policy ON generation_error_logs;
DROP POLICY IF EXISTS generation_error_logs_insert_policy ON generation_error_logs; 