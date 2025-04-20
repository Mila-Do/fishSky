## 1. Lista tabel

### users
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **email** CITEXT UNIQUE NOT NULL
- **password_hash** TEXT NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### generations
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **user_id** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **model** VARCHAR NOT NULL
- **generated_count** INT4 NOT NULL DEFAULT 0
- **accepted_unedited_count** INT4 NOT NULL DEFAULT 0
- **accepted_edited_count** INT4 NOT NULL DEFAULT 0
- **source_text_hash** VARCHAR NOT NULL
- **source_text_length** INT4 NOT NULL
- **generation_duration** INT4 NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### generation_error_logs
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **user_id** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **model** VARCHAR NOT NULL
- **source_text_hash** VARCHAR NOT NULL
- **source_text_length** INT4 NOT NULL
- **error_code** VARCHAR NOT NULL
- **error_message** TEXT NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### flashcards
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **user_id** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **generation_id** UUID REFERENCES generations(id) ON DELETE SET NULL
- **front** VARCHAR(200) NOT NULL CHECK (char_length(front) <= 200)
- **back** VARCHAR(500) NOT NULL CHECK (char_length(back) <= 500)
- **status** flashcard_status NOT NULL DEFAULT 'pending'
- **source** flashcard_source NOT NULL
- **ai_metadata** JSONB
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **deleted_at** TIMESTAMPTZ

## 2. Relacje
- **users 1—* flashcards**
- **users 1—* generations**
- **users 1—* generation_error_logs**
- **generations 1—* flashcards**

## 3. Indeksy
- `CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);`
- `CREATE INDEX idx_flashcards_user_status ON flashcards(user_id, status);`
- `CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);`
- `CREATE INDEX idx_generations_user_id ON generations(user_id);`
- `CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);`

## 4. Zasady PostgreSQL (RLS)
- `ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE generations ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;`

Polityki dla każdej tabeli (flashcards, generations, generation_error_logs):
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id` (tylko dla flashcards i generations)
- DELETE: `auth.uid() = user_id` (tylko dla flashcards i generations)

## 5. Dodatkowe uwagi
- Rozszerzenia: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, `CREATE EXTENSION IF NOT EXISTS citext;`
- Definicja ENUM:
  - `CREATE TYPE flashcard_status AS ENUM ('pending', 'accepted', 'rejected', 'custom');`
  - `CREATE TYPE flashcard_source AS ENUM ('ai', 'manual');`
- Trigger `set_updated_at()` wywoływany przed UPDATE na tabele users, flashcards i generations aktualizuje pole `updated_at`.
- Soft-delete w tabeli `flashcards` przez ustawienie `deleted_at` zamiast fizycznego usuwania.
- Śledzenie generowania AI przez tabelę `generations` i logowanie błędów w `generation_error_logs`.
- Backupy i retencja danych zgodnie z wymogami RODO.
- Normalizacja do 3NF.

