-- Migration: create_initial_schema
-- Description: Creates the initial database schema for the flashcards application
-- Date: 2024-04-11 16:15:00
-- Author: Automatically generated
--
-- This migration creates:
-- 1. Required extensions: pgcrypto, citext
-- 2. Custom types: flashcard_status, flashcard_source
-- 3. Base tables: users, generations, flashcards, generation_error_logs
-- 4. Indexes, constraints, triggers and RLS policies

-- ======================================
-- Extensions
-- ======================================
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ======================================
-- Custom types (ENUMs)
-- ======================================
create type flashcard_status as enum ('pending', 'accepted', 'rejected', 'custom');
create type flashcard_source as enum ('manual', 'ai-full', 'ai-edited');

-- ======================================
-- Updated_at trigger function
-- ======================================
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ======================================
-- Tables
-- ======================================

-- Users table
create table users (
    id uuid primary key default gen_random_uuid(),
    email citext unique not null,
    password_hash text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Generations table (AI generation tracking)
create table generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    model varchar(100) not null,
    generated_count int not null default 0,
    accepted_unedited_count int not null default 0,
    accepted_edited_count int not null default 0,
    source_text_hash varchar(64) not null,
    source_text_length int not null check (source_text_length between 1000 and 10000),
    generation_duration int not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Generation error logs table
create table generation_error_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    model varchar(100) not null,
    source_text_hash varchar(64) not null,
    source_text_length int not null,
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Flashcards table (primary application data)
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    generation_id uuid references generations(id) on delete set null,
    front varchar(200) not null check (char_length(front) <= 200),
    back varchar(500) not null check (char_length(back) <= 500),
    status flashcard_status not null default 'pending',
    source flashcard_source not null,
    ai_metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz -- soft delete field
);

-- ======================================
-- Additional constraints
-- ======================================

-- For manual source: generation_id must be null
alter table flashcards add constraint flashcards_manual_source_check 
check (source != 'manual' or generation_id is null);

-- For AI sources: generation_id must not be null
alter table flashcards add constraint flashcards_ai_source_check 
check (source not in ('ai-full', 'ai-edited') or generation_id is not null);

-- ======================================
-- Indexes
-- ======================================
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_flashcards_user_status on flashcards(user_id, status);
create index idx_generations_user_id on generations(user_id);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- ======================================
-- Triggers
-- ======================================
create trigger set_users_updated_at
    before update on users
    for each row
    execute function set_updated_at();

create trigger set_flashcards_updated_at
    before update on flashcards
    for each row
    execute function set_updated_at();

create trigger set_generations_updated_at
    before update on generations
    for each row
    execute function set_updated_at();

-- ======================================
-- Row Level Security
-- ======================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- RLS Policies for users table
create policy users_select_policy on users
    for select
    using (auth.uid() = id);

-- RLS Policies for flashcards table
create policy flashcards_select_policy on flashcards
    for select
    using (auth.uid() = user_id);

create policy flashcards_insert_policy on flashcards
    for insert
    with check (auth.uid() = user_id);

create policy flashcards_update_policy on flashcards
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy flashcards_delete_policy on flashcards
    for delete
    using (auth.uid() = user_id);

-- RLS Policies for generations table
create policy generations_select_policy on generations
    for select
    using (auth.uid() = user_id);

create policy generations_insert_policy on generations
    for insert
    with check (auth.uid() = user_id);

create policy generations_update_policy on generations
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- RLS Policies for generation_error_logs table
create policy generation_error_logs_select_policy on generation_error_logs
    for select
    using (auth.uid() = user_id);

create policy generation_error_logs_insert_policy on generation_error_logs
    for insert
    with check (auth.uid() = user_id); 