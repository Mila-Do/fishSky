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
- `status`: flashcard_status (optional)
- `source`: flashcard_source (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `sort`: string (default: "-created_at")
- `search`: string (optional)
**Response JSON**: 
```json
{
  "items": [Flashcard],
  "metadata": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "has_more": "boolean"
  }
}
```
**Errors**: 401 Unauthorized.

#### GET `/flashcards/{id}`
**Description**: Get a single flashcard.
**Response JSON**: Flashcard object.
**Errors**: 404 if flashcard not found, 401 Unauthorized.

#### POST `/flashcards`
**Description**: Create flashcard(s), manually or via AI.
**Query Parameters**:
- `source`: "manual" | "ai-full" | "ai-edited"
- `model`: string (required if source starts with "ai-")
**Request JSON**: Flashcard data or text for AI generation.
**Response JSON**: Created flashcard(s).
**Errors**: 400 for invalid input, 401 Unauthorized.
**Validations**:
- `front`: Maximum length: 200 characters.
- `back`: Maximum length: 500 characters.
- `text`: Required for AI generation, 1000-10000 characters.
- `generation_id`: Must match source type rules.

#### POST `/flashcards/batch`
**Description**: Create multiple flashcards at once.
**Request JSON**:
```json
{
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "source": "manual"
    }
  ]
}
```
**Response JSON**:
```json
{
  "items": [
    {
      "id": "uuid",
      "front": "string",
      "back": "string",
      "status": "pending",
      "source": "manual",
      "created_at": "timestamp"
    }
  ],
  "total": "number"
}
```

### AI Generation

#### POST `/generations`
**Description**: Generate flashcards from text.
**Query Parameters**:
- `status`: "pending" | "accepted_unedited" | "accepted_edited" (default: "pending")
**Request JSON**:
```json
{
  "text": "string",
  "model": "string"
}
```
**Response JSON**:
```json
{
  "id": "uuid",
  "flashcards": [
    {
      "id": "uuid",
      "front": "string",
      "back": "string",
      "status": "string",
      "source": "ai",
      "model": "string"
    }
  ],
  "generation_stats": {
    "duration": "number",
    "generated_count": "number"
  }
}
```

#### PATCH `/flashcards/{id}`
**Description**: Edit an existing flashcard.
**Request JSON**: Fields to update.
**Response JSON**: Updated flashcard object.
**Errors**: 400 for invalid input, 404 if flashcard not found, 401 Unauthorized.
**Validations**:
- `front`: Maximum length: 200 characters.
- `back`: Maximum length: 500 characters.
- `source`: Must be one of `ai-edited` or `manual`.
- `generation_id`: Required for `ai-edited`, must be null for `manual`.

#### DELETE `/flashcards/{id}`
**Description**: Delete a flashcard.
**Response JSON**: Success message.
**Errors**: 404 if flashcard not found, 401 Unauthorized.

#### GET `/generations/stats`
**Description**: Get generation statistics.
**Response JSON**:
```json
{
  "total_generated": "number",
  "accepted_unedited": "number",
  "accepted_edited": "number",
  "rejected": "number"
}
```

#### GET `/generations`
**Description**: List generation history.
**Query Parameters**: 
- `page`: number (default: 1)
- `limit`: number (default: 20)
**Response JSON**: 
```json
{
  "items": [Generation],
  "metadata": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "has_more": "boolean"
  }
}
```

### Learning Session

#### GET `/learning/session`
**Description**: Get flashcards for learning session.
**Query Parameters**: 
- `limit`: number (default: 20)
**Response JSON**:
```json
{
  "session_id": "string",
  "flashcards": [
    {
      "id": "uuid",
      "front": "string",
      "back": "string",
      "status": "string",
      "source": "string"
    }
  ],
  "total": "number"
}
```
**Errors**: 401 Unauthorized.

#### POST `/learning/session/{session_id}/answer`
**Description**: Submit answer for a flashcard.
**Request JSON**:
```json
{
  "flashcard_id": "uuid",
  "answer": "string",
  "confidence": "number" // 1-5 scale
}
```
**Response JSON**:
```json
{
  "next_flashcard": {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "status": "string",
    "source": "string"
  } | null,
  "session_complete": "boolean"
}
```
**Errors**: 400 for invalid input, 404 if session not found, 401 Unauthorized.

## 3. Authentication and Authorization

- JWT-based authentication
- Token in Authorization header: `Bearer <token>`
- All endpoints require authentication except /auth/register and /auth/login
- Row Level Security (RLS) ensures users can only access their own data
- Rate limiting on AI generation endpoints

## 4. Validation and Business Logic

### Input Validation
- Email: valid format, unique
- Password: minimum 8 characters, complexity requirements
- Flashcard front: max 200 characters
- Flashcard back: max 500 characters
- Generation text: 1000-10000 characters
- Status: enum values (pending, accepted, rejected, custom)
- Source: enum values (ai, manual)

### Response Format
All responses follow the format:
```json
{
  "data": <response_data>,
  "metadata": {
    "timestamp": "string",
    "request_id": "string"
  }
}
```

For errors:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": object | null
  },
  "metadata": {
    "timestamp": "string",
    "request_id": "string"
  }
}
```

### Business Logic
- Flashcard generation uses AI model through OpenRouter
- Learning session uses spaced repetition algorithm
- Soft delete for flashcards (sets deleted_at)
- Generation statistics tracking
- Error logging for failed generations
- Source validation:
  - "manual": generation_id must be null
  - "ai-full": generation_id required, matches the AI generation
  - "ai-edited": generation_id required, matches the original AI generation 