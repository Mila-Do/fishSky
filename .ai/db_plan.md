## 1. Lista tabel

### users
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **email** CITEXT UNIQUE NOT NULL
- **password_hash** TEXT NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### flashcards
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **user_id** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **front** VARCHAR(200) NOT NULL CHECK (char_length(front) <= 200)
- **back** VARCHAR(500) NOT NULL CHECK (char_length(back) <= 500)
- **status** flashcard_status NOT NULL DEFAULT 'pending'
- **source** flashcard_source NOT NULL
- **ai_metadata** JSONB
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **deleted_at** TIMESTAMPTZ

### ai_statistics
- **user_id** UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
- **total_generated** BIGINT NOT NULL DEFAULT 0
- **total_accepted** BIGINT NOT NULL DEFAULT 0
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relacje
- **users 1—* flashcards**
- **users 1—1 ai_statistics**

## 3. Indeksy
- `CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);`
- `CREATE INDEX idx_flashcards_user_status ON flashcards(user_id, status);`
- `CREATE INDEX idx_ai_statistics_user_id ON ai_statistics(user_id);`

## 4. Zasady PostgreSQL (RLS)
- `ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;`
- `CREATE POLICY flashcards_owner_policy ON flashcards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`
- `ALTER TABLE ai_statistics ENABLE ROW LEVEL SECURITY;`
- `CREATE POLICY ai_statistics_owner_policy ON ai_statistics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`

## 5. Dodatkowe uwagi
- Rozszerzenia: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, `CREATE EXTENSION IF NOT EXISTS citext;`
- Definicja ENUM:
  - `CREATE TYPE flashcard_status AS ENUM ('pending', 'accepted', 'rejected', 'custom');`
  - `CREATE TYPE flashcard_source AS ENUM ('ai', 'manual');`
- Trigger `set_updated_at()` wywoływany przed UPDATE na każdą tabelę aktualizuje pole `updated_at`.
- Soft-delete w tabeli `flashcards` przez ustawienie `deleted_at` zamiast fizycznego usuwania.
- Backupy i retencja danych zgodnie z wymogami RODO.
- Normalizacja do 3NF.

