# Plan bazy danych dla API Fiszek

## 1. Lista tabel

### users
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **email** CITEXT UNIQUE NOT NULL
- **passwordHash** TEXT NOT NULL
- **createdAt** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updatedAt** TIMESTAMPTZ NOT NULL DEFAULT now()

### flashcards
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **aiMetadata** JSONB NULL
- **back** VARCHAR(500) NOT NULL CHECK (char_length(back) <= 500)
- **createdAt** TIMESTAMPTZ NOT NULL DEFAULT now()
- **deletedAt** TIMESTAMPTZ NULL
- **front** VARCHAR(200) NOT NULL CHECK (char_length(front) <= 200)
- **generationId** UUID REFERENCES generations(id) ON DELETE SET NULL
- **source** flashcardSource NOT NULL
- **status** flashcardStatus NOT NULL DEFAULT 'pending'
- **updatedAt** TIMESTAMPTZ NOT NULL DEFAULT now()
- **userId** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE

### generationErrorLogs
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **createdAt** TIMESTAMPTZ NOT NULL DEFAULT now()
- **errorCode** VARCHAR(100) NOT NULL
- **errorMessage** TEXT NOT NULL
- **model** VARCHAR(100) NOT NULL
- **sourceTextHash** VARCHAR(64) NOT NULL
- **sourceTextLength** INT NOT NULL
- **userId** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE

### generations
- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **acceptedEditedCount** INT NOT NULL DEFAULT 0
- **acceptedUneditedCount** INT NOT NULL DEFAULT 0
- **createdAt** TIMESTAMPTZ NOT NULL DEFAULT now()
- **generatedCount** INT NOT NULL DEFAULT 0
- **generationDuration** INT NOT NULL
- **model** VARCHAR(100) NOT NULL
- **sourceTextHash** VARCHAR(64) NOT NULL
- **sourceTextLength** INT NOT NULL CHECK (sourceTextLength BETWEEN 1000 AND 10000)
- **updatedAt** TIMESTAMPTZ NOT NULL DEFAULT now()
- **userId** UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE

## 2. Enumeracje

```sql
CREATE TYPE "flashcardSource" AS ENUM ('manual', 'ai-full', 'ai-edited');
CREATE TYPE "flashcardStatus" AS ENUM ('pending', 'accepted', 'rejected', 'custom');
```

## 3. Relacje i klucze obce

### flashcards
- **flashcardsGenerationId_fkey**: "generationId" → generations("id")
- **flashcardsUserId_fkey**: "userId" → users("id")

### generationErrorLogs
- **generationErrorLogsUserId_fkey**: "userId" → users("id")

### generations
- **generationsUserId_fkey**: "userId" → users("id")

## 4. Indeksy

- `CREATE INDEX "idxFlashcardsUserId" ON flashcards("userId");`
- `CREATE INDEX "idxFlashcardsUserStatus" ON flashcards("userId", status);`
- `CREATE INDEX "idxFlashcardsGenerationId" ON flashcards("generationId");`
- `CREATE INDEX "idxGenerationsUserId" ON generations("userId");`
- `CREATE INDEX "idxGenerationErrorLogsUserId" ON "generationErrorLogs"("userId");`

## 5. Dodatkowe ograniczenia

- **flashcardsManualSourceCheck**: Fiszki ręczne (source = 'manual') muszą mieć NULL w generationId
- **flashcardsAiSourceCheck**: Fiszki AI (source = 'ai-full' lub 'ai-edited') muszą mieć NOT NULL w generationId
- **Ograniczenia długości**: 
  - front: max 200 znaków
  - back: max 500 znaków
  - sourceText: 1000-10000 znaków

## 6. Funkcje i triggery

```sql
-- Funkcja aktualizująca pole updatedAt przy każdej modyfikacji
CREATE OR REPLACE FUNCTION "setUpdatedAt"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery automatycznie aktualizujące updatedAt
CREATE TRIGGER "setUsersUpdatedAt"
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION "setUpdatedAt"();

CREATE TRIGGER "setFlashcardsUpdatedAt"
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION "setUpdatedAt"();

CREATE TRIGGER "setGenerationsUpdatedAt"
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION "setUpdatedAt"();
```

## 7. Bezpieczeństwo i Row Level Security

```sql
-- Włączenie RLS dla wszystkich tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE "generationErrorLogs" ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla users
CREATE POLICY "usersSelectPolicy" ON users
    FOR SELECT USING (auth.uid() = id);

-- Polityki RLS dla flashcards
CREATE POLICY "flashcardsSelectPolicy" ON flashcards
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "flashcardsInsertPolicy" ON flashcards
    FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "flashcardsUpdatePolicy" ON flashcards
    FOR UPDATE USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "flashcardsDeletePolicy" ON flashcards
    FOR DELETE USING (auth.uid() = "userId");

-- Polityki RLS dla generations
CREATE POLICY "generationsSelectPolicy" ON generations
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "generationsInsertPolicy" ON generations
    FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "generationsUpdatePolicy" ON generations
    FOR UPDATE USING (auth.uid() = "userId")
    WITH CHECK (auth.uid() = "userId");

-- Polityki RLS dla generationErrorLogs
CREATE POLICY "generationErrorLogsSelectPolicy" ON "generationErrorLogs"
    FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "generationErrorLogsInsertPolicy" ON "generationErrorLogs"
    FOR INSERT WITH CHECK (auth.uid() = "userId");
```

## 8. Uwagi implementacyjne

- **Soft delete**: Używamy kolumny deletedAt dla fiszek zamiast fizycznego usuwania
- **Walidacja**: Dodatkowe walidacje wykonywane po stronie API (min/max długości, poprawność danych)
- **Citext**: Używamy rozszerzenia CITEXT dla pól email, aby zapewnić case-insensitive wyszukiwanie
- **Rozszerzenia**: Wymagane rozszerzenia: pgcrypto (generowanie UUID), citext (porównania niewrażliwe na wielkość liter)

## 9. Dodatkowe uwagi

- Rozszerzenia: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, `CREATE EXTENSION IF NOT EXISTS citext;`
- Definicja ENUM:
  - `CREATE TYPE "flashcardSource" AS ENUM ('manual', 'ai-full', 'ai-edited');`
  - `CREATE TYPE "flashcardStatus" AS ENUM ('pending', 'accepted', 'rejected', 'custom');`
- Trigger `setUpdatedAt()` wywoływany przed UPDATE na tabele users, flashcards i generations aktualizuje pole `updatedAt`
- Soft-delete w tabeli `flashcards` przez ustawienie `deletedAt` zamiast fizycznego usuwania
- Śledzenie generowania AI przez tabelę `generations` i logowanie błędów w `generationErrorLogs`
- Backupy i retencja danych zgodnie z wymogami RODO
- Normalizacja do 3NF
