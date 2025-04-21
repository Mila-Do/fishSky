# API Endpoint Implementation Plan: POST `/generations`

## 1. Przegląd punktu końcowego

Endpoint `/generations` służy do generowania propozycji fiszek (flashcards) na podstawie podanego tekstu przy użyciu AI. Wygenerowane propozycje wymagają przeglądu i zatwierdzenia przez użytkownika zanim zostaną przekształcone w rzeczywiste fiszki.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/generations`
- **Query Parameters**:
  - Opcjonalne: `flashcardStatus` (domyślnie: "pending") - Możliwe wartości: "pending", "accepted", "rejected"
- **Request Body**:
  ```json
  {
    "generationSourceText": "string" // 1000-10000 znaków
  }
  ```
- **Nagłówki**:
  - `Content-Type`: application/json

## 3. Wykorzystywane typy

- **DTO Request**:
  - `GenerationCreateCommandDTO` - Model wejściowy zawierający pole `generationSourceText`
- **DTO Response**:
  - `GenerationGetResponseDTO` - Model odpowiedzi zawierający:
    - `generationId` (string) - identyfikator generacji
    - `generationFlashcardProposals` (tablica obiektów typu FlashcardProposalDTO)
    - `generationCount` (number) - liczba wygenerowanych propozycji
    - `generationDuration` (number) - czas generacji w milisekundach
- **Encje bazodanowe**:
  - `Generation` - Przechowuje informacje o generacji

## 4. Szczegóły odpowiedzi

- **Kody statusu**:
  - 201 Created - Sukces, pomyślnie wygenerowano propozycje fiszek
  - 400 Bad Request - Nieprawidłowe dane wejściowe
  - 500 Internal Server Error - Błąd serwera

- **Format odpowiedzi (sukces)**:
  ```json
  {
    "apiData": {
      "generationId": "uuid",
      "generationFlashcardProposals": [
        {
          "flashcardFront": "string",
          "flashcardBack": "string",
          "flashcardSource": "ai-full"
        }
      ],
      "generationCount": 5,
      "generationDuration": 1200
    },
    "apiMetadata": {
      "apiTimestamp": "string",
      "apiRequestId": "string"
    }
  }
  ```

- **Format odpowiedzi (błąd)**:
  ```json
  {
    "apiError": {
      "apiErrorCode": "string",
      "apiErrorMessage": "string",
      "apiErrorDetails": "object | null"
    },
    "apiMetadata": {
      "apiTimestamp": "string",
      "apiRequestId": "string"
    }
  }
  ```

## 5. Przepływ danych

1. Żądanie trafia do endpoint `/generations`
2. Middleware dodaje klienta Supabase do `context.locals`
3. Walidacja danych wejściowych za pomocą Zod
4. Serwis generacji wywołuje usługę AI z predefiniowanym modelem
5. Wygenerowane propozycje fiszek są zapisywane w bazie danych
6. Odpowiedź z danymi generacji i propozycjami fiszek jest odsyłana do klienta

## 6. Względy bezpieczeństwa

- **Walidacja danych**: 
  - Weryfikacja długości tekstu (1000-10000 znaków)
  - Sanityzacja wejścia przed wysłaniem do modelu AI
- **Rate limiting**: Ograniczenie liczby żądań do usługi AI
- **Zabezpieczenia przed atakami**: Ochrona przed atakami XSS, CSRF, injections

## 7. Obsługa błędów

- **400 Bad Request**:
  - Tekst zbyt krótki: `apiErrorCode = "INVALID_INPUT.TEXT_TOO_SHORT"`
  - Tekst zbyt długi: `apiErrorCode = "INVALID_INPUT.TEXT_TOO_LONG"`
- **500 Internal Server Error**:
  - Błąd usługi AI: `apiErrorCode = "INTERNAL_ERROR.AI_SERVICE_ERROR"`
  - Błąd bazy danych: `apiErrorCode = "INTERNAL_ERROR.DATABASE_ERROR"`

W przypadku błędów AI, informacje o błędzie będą rejestrowane w tabeli `generation_error_logs`.

## 8. Rozważania dotyczące wydajności

- **Timeout dla wywołania AI**: 60 sekund na czas oczekiwania, inaczej błąd timeout
- **Asynchroniczne przetwarzanie**: Rozważ możliwość przetwarzania asynchronicznego generacji, zwłaszcza w warunkach dużego obciążenia
- **Monitoring**: Implementuj mechanizmy monitorowania wydajności endpointu i serwisu AI

## 9. Etapy wdrożenia

1. **Utworzenie pliku endpointu** w katalogu `/src/pages/api`, np. `generations.ts`.

2. **Implementacja walidacji żądania** przy użyciu `zod` (sprawdzenie długości `generationSourceText`).

3. **Stworzenie serwisu** (`generation.service`), który:
   - Integruje się z zewnętrznym serwisem AI. Na etapie developmentu skorzystamy z mocków zamiast wywoływania serwisu AI.
   - Obsługuje logikę zapisu do tabeli `generations` oraz rejestracji błędów w `generation_error_logs`.

4. **Dodanie mechanizmu uwierzytelniania** poprzez Supabase Auth.

5. **Implementacja logiki endpointu**, wykorzystującej utworzony serwis.

6. **Dodanie szczegółowego logowania** akcji i błędów. 