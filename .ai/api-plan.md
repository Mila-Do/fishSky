# REST API Plan

## 1. Resources

### Users

- Table: users
- Primary operations: authentication only

### Flashcards

- Table: flashcards
- Primary operations: CRUD, learning session

### Generations

- Table: generations
- Primary operations: create, read stats

### Generation Error Logs

- Table: generation_error_logs
- Primary operations: read (admin only)

## 2. Endpoints

### Flashcards

#### GET `/flashcards`

**Description**: List user's flashcards.
**Query Parameters**:

- `flashcardStatus`: flashcard_status (optional)
- `flashcardSource`: flashcard_source (optional)
- `paginationPage`: number (default: 1)
- `paginationLimit`: number (default: 20)
- `listSort`: string (default: "-createdAt")
- `flashcardSearch`: string (optional)
  **Response JSON**:

```json
{
  "listItems": [Flashcard],
  "listMetadata": {
    "paginationTotal": "number",
    "paginationPage": "number",
    "paginationLimit": "number",
    "paginationHasMore": "boolean"
  }
}
```

**Errors**: 401 Unauthorized.

#### GET `/flashcards/{flashcardId}`

**Description**: Get a single flashcard.
**Response JSON**: Flashcard object.
**Errors**: 404 if flashcard not found, 401 Unauthorized.

#### POST `/flashcards`

**Description**: Create flashcard(s), manually or via AI.
**Query Parameters**:

- `flashcardSource`: "manual" | "ai-full" | "ai-edited"
  **Request JSON**: Flashcard data or text for AI generation.
  **Response JSON**: Created flashcard(s).
  **Errors**: 400 for invalid input, 401 Unauthorized.
  **Validations**:
- `flashcardFront`: Maximum length: 200 characters.
- `flashcardBack`: Maximum length: 500 characters.
- `generationSourceText`: Required for AI generation, 1000-10000 characters.
- `flashcardGenerationId`: Must match source type rules.

#### POST `/flashcards/batch`

**Description**: Create multiple flashcards at once.
**Request JSON**:

```json
{
  "flashcardList": [
    {
      "flashcardFront": "string",
      "flashcardBack": "string",
      "flashcardSource": "manual"
    }
  ]
}
```

**Response JSON**:

```json
{
  "listItems": [
    {
      "flashcardId": "uuid",
      "flashcardFront": "string",
      "flashcardBack": "string",
      "flashcardStatus": "pending",
      "flashcardSource": "manual",
      "flashcardCreatedAt": "timestamp"
    }
  ],
  "listTotal": "number"
}
```

### AI Generation

#### POST `/generations`

**Description**: Generate flashcard proposals from text. These are suggestions that require user review and approval before becoming actual flashcards.
**Query Parameters**:

- `flashcardStatus`: "pending" | "accepted" | "rejected" (default: "pending")
  **Request JSON**:

```json
{
  "generationSourceText": "string"
}
```

**Response JSON**:

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

#### PATCH `/flashcards/{flashcardId}`

**Description**: Edit an existing flashcard.
**Request JSON**: Fields to update.
**Response JSON**: Updated flashcard object.
**Errors**: 400 for invalid input, 404 if flashcard not found, 401 Unauthorized.
**Validations**:

- `flashcardFront`: Maximum length: 200 characters.
- `flashcardBack`: Maximum length: 500 characters.
- `flashcardSource`: Must be one of `ai-edited` or `manual`.
- `flashcardGenerationId`: Required for `ai-edited`, must be null for `manual`.

#### DELETE `/flashcards/{flashcardId}`

**Description**: Delete a flashcard.
**Response JSON**: Success message.
**Errors**: 404 if flashcard not found, 401 Unauthorized.

#### GET `/generations/stats`

**Description**: Get statistics about AI-generated flashcard proposals and their acceptance rates.
**Response JSON**:

```json
{
  "generationTotalProposed": "number",
  "generationAcceptedCount": "number",
  "generationAcceptedEditedCount": "number",
  "generationRejectedCount": "number"
}
```

#### GET `/generations`

**Description**: List generation history.
**Query Parameters**:

- `paginationPage`: number (default: 1)
- `paginationLimit`: number (default: 20)
  **Response JSON**:

```json
{
  "listItems": [Generation],
  "listMetadata": {
    "paginationTotal": "number",
    "paginationPage": "number",
    "paginationLimit": "number",
    "paginationHasMore": "boolean"
  }
}
```

## 3. Authentication and Authorization

- JWT-based authentication
- Token in Authorization header: `Bearer <token>`
- All endpoints require authentication except /auth/register and /auth/login
- Row Level Security (RLS) ensures users can only access their own data
- Rate limiting on AI generation endpoints

## 4. Validation and Business Logic

### Input Validation

- userEmail: valid format, unique
- userPassword: minimum 8 characters, complexity requirements
- flashcardFront: max 200 characters
- flashcardBack: max 500 characters
- generationSourceText: 1000-10000 characters
- flashcardStatus: enum values (pending, accepted, rejected, custom)
- flashcardSource: enum values (ai-full, manual, ai-edited)

### Response Format

All responses follow the format:

```json
{
  "apiData": <response_data>,
  "apiMetadata": {
    "apiTimestamp": "string",
    "apiRequestId": "string"
  }
}
```

For errors:

```json
{
  "apiError": {
    "apiErrorCode": "string",
    "apiErrorMessage": "string",
    "apiErrorDetails": object | null
  },
  "apiMetadata": {
    "apiTimestamp": "string",
    "apiRequestId": "string"
  }
}
```

### Business Logic

- AI generates flashcard proposals using a predefined model
- Proposals require user review and approval
- Soft delete for flashcards (sets flashcardDeletedAt)
- Generation proposal statistics tracking
- Error logging for failed generations
- Source validation:
  - "manual": flashcardGenerationId must be null
  - "ai-full": flashcardGenerationId required, matches the AI generation that was accepted without edits
  - "ai-edited": flashcardGenerationId required, matches the original AI generation proposal that was edited before acceptance
