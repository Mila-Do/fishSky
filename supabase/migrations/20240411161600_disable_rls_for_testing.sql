-- Migration: disable_rls_for_testing
-- Description: Disables RLS policies temporarily for development and inserts a test user
-- Date: 2024-04-11 16:16:00
-- Author: Automatically generated
--
-- WARNING: This migration is for DEVELOPMENT ONLY and should NEVER be applied to production
-- It disables all RLS policies to make testing easier and creates a test account

-- ======================================
-- Disable RLS on all tables
-- ======================================
-- WARNING: This is a security risk in production - only use for development/testing
alter table users disable row level security;
alter table flashcards disable row level security;
alter table generations disable row level security;
alter table generation_error_logs disable row level security;

-- ======================================
-- Create test user
-- ======================================
-- Password is 'test1234' (for development purposes only)
insert into users (email, password_hash)
values ('test@example.com', '$2a$10$GQH2v0ooL.CzWhwDJxPuB.Kx9ZK1K1yD0pUXz1hWVQwmGS9Jgc1mW');

-- Note: in production, you should:
-- 1. Re-enable RLS with 'ALTER TABLE tablename ENABLE ROW LEVEL SECURITY'
-- 2. Never store hardcoded passwords or test accounts
-- 3. Use proper password hashing with salt 