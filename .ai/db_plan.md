# Plan bazy danych dla API Fiszek

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
- **model** VARCHAR(100) NOT NULL
- **generated_count** INT NOT NULL DEFAULT 0
- **accepted_unedited_count** INT NOT NULL DEFAULT 0
- **accepted_edited_count** INT NOT NULL DEFAULT 0
- **source_text_hash** VARCHAR(64) NOT NULL
- **source_text_length** INT NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- **generation_duration** INT NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### generation_error_logs

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **user_id** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **model** VARCHAR(100) NOT NULL
- **source_text_hash** VARCHAR(64) NOT NULL
- **source_text_length** INT NOT NULL
- **error_code** VARCHAR(100) NOT NULL
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

## 2. Enumeracje

```sql
CREATE TYPE flashcard_status AS ENUM ('pending', 'accepted', 'rejected', 'custom');
CREATE TYPE flashcard_source AS ENUM ('manual', 'ai-full', 'ai-edited');
```

## 3. Relacje

- **users 1—\* flashcards**
- **users 1—\* generations**
- **users 1—\* generation_error_logs**
- **generations 1—\* flashcards**

## 4. Indeksy

- `CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);`
- `CREATE INDEX idx_flashcards_user_status ON flashcards(user_id, status);`
- `CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);`
- `CREATE INDEX idx_generations_user_id ON generations(user_id);`
- `CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);`

## 5. Dodatkowe ograniczenia

- **flashcards_manual_source_check**: Fiszki ręczne (source = 'manual') muszą mieć NULL w generation_id
- **flashcards_ai_source_check**: Fiszki AI (source = 'ai-full' lub 'ai-edited') muszą mieć NOT NULL w generation_id
- **Ograniczenia długości**: front max 200 znaków, back max 500 znaków, source_text 1000-10000 znaków

## 6. Funkcje i triggery

```sql
-- Funkcja aktualizująca pole updated_at przy każdej modyfikacji
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery automatycznie aktualizujące updated_at
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
```

## 7. Bezpieczeństwo i Row Level Security

```sql
-- Włączenie RLS dla wszystkich tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla users
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (auth.uid() = id);

-- Polityki RLS dla flashcards
CREATE POLICY flashcards_select_policy ON flashcards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY flashcards_insert_policy ON flashcards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY flashcards_update_policy ON flashcards
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY flashcards_delete_policy ON flashcards
    FOR DELETE USING (auth.uid() = user_id);

-- Polityki RLS dla generations
CREATE POLICY generations_select_policy ON generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY generations_insert_policy ON generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY generations_update_policy ON generations
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Polityki RLS dla generation_error_logs
CREATE POLICY generation_error_logs_select_policy ON generation_error_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY generation_error_logs_insert_policy ON generation_error_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 8. Uwagi implementacyjne

- **Soft delete**: Używamy kolumny deleted_at dla fiszek zamiast fizycznego usuwania
- **Walidacja**: Dodatkowe walidacje wykonywane po stronie API (min/max długości, poprawność danych)
- **Citext**: Używamy rozszerzenia CITEXT dla pól email, aby zapewnić case-insensitive wyszukiwanie
- **Rozszerzenia**: Wymagane rozszerzenia: pgcrypto (generowanie UUID), citext (porównania niewrażliwe na wielkość liter)

## 9. Dodatkowe uwagi

- Rozszerzenia: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, `CREATE EXTENSION IF NOT EXISTS citext;`
- Definicja ENUM:
  - `CREATE TYPE flashcard_status AS ENUM ('pending', 'accepted', 'rejected', 'custom');`
  - `CREATE TYPE flashcard_source AS ENUM ('ai-full', 'ai-edited', 'manual');`
- Trigger `set_updated_at()` wywoływany przed UPDATE na tabele users, flashcards i generations aktualizuje pole `updated_at`.
- Soft-delete w tabeli `flashcards` przez ustawienie `deleted_at` zamiast fizycznego usuwania.
- Śledzenie generowania AI przez tabelę `generations` i logowanie błędów w `generation_error_logs`.
- Backupy i retencja danych zgodnie z wymogami RODO.
- Normalizacja do 3NF.
