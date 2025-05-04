-- Rename enums
alter type flashcard_status rename to "flashcardStatus";
alter type flashcard_source rename to "flashcardSource";

-- Rename columns in users table
alter table users rename column password_hash to "passwordHash";
alter table users rename column created_at to "createdAt";
alter table users rename column updated_at to "updatedAt";

-- Rename columns in generations table
alter table generations rename column user_id to "userId";
alter table generations rename column generated_count to "generatedCount";
alter table generations rename column accepted_unedited_count to "acceptedUneditedCount";
alter table generations rename column accepted_edited_count to "acceptedEditedCount";
alter table generations rename column source_text_hash to "sourceTextHash";
alter table generations rename column source_text_length to "sourceTextLength";
alter table generations rename column generation_duration to "generationDuration";
alter table generations rename column created_at to "createdAt";
alter table generations rename column updated_at to "updatedAt";

-- Rename generation_error_logs table and its columns
alter table generation_error_logs rename to "generationErrorLogs";
alter table "generationErrorLogs" rename column user_id to "userId";
alter table "generationErrorLogs" rename column source_text_hash to "sourceTextHash";
alter table "generationErrorLogs" rename column source_text_length to "sourceTextLength";
alter table "generationErrorLogs" rename column error_code to "errorCode";
alter table "generationErrorLogs" rename column error_message to "errorMessage";
alter table "generationErrorLogs" rename column created_at to "createdAt";

-- Rename columns in flashcards table
alter table flashcards rename column user_id to "userId";
alter table flashcards rename column generation_id to "generationId";
alter table flashcards rename column ai_metadata to "aiMetadata";
alter table flashcards rename column created_at to "createdAt";
alter table flashcards rename column updated_at to "updatedAt";
alter table flashcards rename column deleted_at to "deletedAt";

-- Rename constraints
alter table flashcards rename constraint flashcards_manual_source_check to "flashcardsManualSourceCheck";
alter table flashcards rename constraint flashcards_ai_source_check to "flashcardsAiSourceCheck";

-- Rename indexes
alter index idx_flashcards_user_id rename to "idxFlashcardsUserId";
alter index idx_flashcards_generation_id rename to "idxFlashcardsGenerationId";
alter index idx_flashcards_user_status rename to "idxFlashcardsUserStatus";
alter index idx_generations_user_id rename to "idxGenerationsUserId";
alter index idx_generation_error_logs_user_id rename to "idxGenerationErrorLogsUserId";

-- Rename triggers and functions
alter trigger set_users_updated_at on users rename to "setUsersUpdatedAt";
alter trigger set_flashcards_updated_at on flashcards rename to "setFlashcardsUpdatedAt";
alter trigger set_generations_updated_at on generations rename to "setGenerationsUpdatedAt";

drop function if exists set_updated_at() cascade;
create or replace function "setUpdatedAt"()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

-- Recreate triggers with new function
create trigger "setUsersUpdatedAt"
    before update on users
    for each row
    execute function "setUpdatedAt"();

create trigger "setFlashcardsUpdatedAt"
    before update on flashcards
    for each row
    execute function "setUpdatedAt"();

create trigger "setGenerationsUpdatedAt"
    before update on generations
    for each row
    execute function "setUpdatedAt"();

-- Rename RLS policies
alter policy users_select_policy on users rename to "usersSelectPolicy";
alter policy flashcards_select_policy on flashcards rename to "flashcardsSelectPolicy";
alter policy flashcards_insert_policy on flashcards rename to "flashcardsInsertPolicy";
alter policy flashcards_update_policy on flashcards rename to "flashcardsUpdatePolicy";
alter policy flashcards_delete_policy on flashcards rename to "flashcardsDeletePolicy";
alter policy generations_select_policy on generations rename to "generationsSelectPolicy";
alter policy generations_insert_policy on generations rename to "generationsInsertPolicy";
alter policy generations_update_policy on generations rename to "generationsUpdatePolicy";
alter policy generation_error_logs_select_policy on "generationErrorLogs" rename to "generationErrorLogsSelectPolicy";
alter policy generation_error_logs_insert_policy on "generationErrorLogs" rename to "generationErrorLogsInsertPolicy"; 