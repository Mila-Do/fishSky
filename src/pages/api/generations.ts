import type { APIRoute } from 'astro';
import { generateFlashcards } from '../../lib/services/generation.service';
import { generationCreateSchema } from '../../lib/schemas/generation.schema';
import type {
  ApiErrorResponse,
  ApiResponse,
} from '../../lib/schemas/generation.schema';
import type { GenerationGetResponseDTO, FlashcardStatus } from '../../types';
import { default_user_ID } from '../../db/supabase.client';

export const prerender = false;

// Stałe dla limitów czasowych i ponawiania prób
const AI_SERVICE_TIMEOUT_MS = 60000; // 60 sekund
const MAX_RETRIES = 2; // Maksymalna liczba ponownych prób

function createErrorResponse(
  status: number,
  code: string,
  message: string,
  details: object | null = null
): Response {
  const errorResponse: ApiErrorResponse = {
    apiError: {
      apiErrorCode: code,
      apiErrorMessage: message,
      apiErrorDetails: details,
    },
    apiMetadata: {
      apiTimestamp: new Date().toISOString(),
      apiRequestId: crypto.randomUUID(),
    },
  };

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createSuccessResponse<T>(status: number, data: T): Response {
  const response: ApiResponse<T> = {
    apiData: data,
    apiMetadata: {
      apiTimestamp: new Date().toISOString(),
      apiRequestId: crypto.randomUUID(),
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Helper to validate and parse flashcardStatus query parameter
function parseFlashcardStatus(
  status: string | null
): FlashcardStatus | undefined {
  if (!status) return undefined;

  const validStatuses: FlashcardStatus[] = ['pending', 'accepted', 'rejected'];
  return validStatuses.includes(status as FlashcardStatus)
    ? (status as FlashcardStatus)
    : undefined;
}

// Funkcja pomocnicza do sanityzacji tekstu wejściowego
function sanitizeInputText(text: string): string {
  // Usuwanie potencjalnie niebezpiecznych fragmentów
  return text
    .replace(/[<>]/g, '') // Usuwanie znaczników HTML
    .trim();
}

// Funkcja pomocnicza do wykonania z limitem czasu
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((result) => {
      clearTimeout(timeoutId);
      return result;
    }),
    timeoutPromise,
  ]);
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  // Request ID do śledzenia
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Processing generation request`);

  // Extract query parameters
  const flashcardStatus =
    parseFlashcardStatus(url.searchParams.get('flashcardStatus')) || 'pending';

  // 1. Get supabase client from context
  const supabase = locals.supabase;
  if (!supabase) {
    console.error(`[${requestId}] Database connection not available`);
    return createErrorResponse(
      500,
      'INTERNAL_ERROR.DATABASE_CONNECTION',
      'Database connection not available'
    );
  }

  // 2. Używamy domyślnego ID użytkownika - autoryzacja zostanie wdrożona później
  const userId = default_user_ID;

  // 3. Validate request body
  let requestBody;
  try {
    requestBody = await request.json();
    console.log(
      `[${requestId}] Received request with body length: ${JSON.stringify(requestBody).length}`
    );
  } catch (error) {
    console.error(
      `[${requestId}] Invalid JSON in request body: ${error instanceof Error ? error.message : String(error)}`
    );
    return createErrorResponse(
      400,
      'INVALID_INPUT.MALFORMED_JSON',
      'Invalid JSON in request body'
    );
  }

  // 4. Validate request against schema
  const validationResult = generationCreateSchema.safeParse(requestBody);
  if (!validationResult.success) {
    const validationErrors = validationResult.error.format();
    console.error(`[${requestId}] Validation failed:`, validationErrors);

    // Determine specific error code based on validation issues
    let errorCode = 'INVALID_INPUT.VALIDATION_ERROR';
    let errorMessage = 'Validation failed';

    if (
      validationErrors.generationSourceText?._errors?.includes(
        'Text must be at least 1000 characters long'
      )
    ) {
      errorCode = 'INVALID_INPUT.TEXT_TOO_SHORT';
      errorMessage = 'Text must be at least 1000 characters long';
    } else if (
      validationErrors.generationSourceText?._errors?.includes(
        'Text cannot exceed 10000 characters'
      )
    ) {
      errorCode = 'INVALID_INPUT.TEXT_TOO_LONG';
      errorMessage = 'Text cannot exceed 10000 characters';
    } else if (validationErrors.generationModel?._errors?.length) {
      errorCode = 'INVALID_INPUT.MODEL_REQUIRED';
      errorMessage = 'Model name is required';
    }

    return createErrorResponse(400, errorCode, errorMessage, validationErrors);
  }

  // Sanityzacja danych wejściowych
  const sanitizedCommand = {
    ...validationResult.data,
    generationSourceText: sanitizeInputText(
      validationResult.data.generationSourceText
    ),
  };

  // 5. Process the generation request
  try {
    console.log(
      `[${requestId}] Generating flashcards with model: ${sanitizedCommand.generationModel}`
    );
    console.log(
      `[${requestId}] Text length: ${sanitizedCommand.generationSourceText.length} characters`
    );

    // Wywołanie z timeout i możliwością ponowienia
    let retries = 0;
    let generationData: GenerationGetResponseDTO | null = null;
    let lastError: Error | null = null;

    while (retries <= MAX_RETRIES && !generationData) {
      try {
        if (retries > 0) {
          console.log(`[${requestId}] Retry attempt ${retries}/${MAX_RETRIES}`);
        }

        // Wywołanie z timeoutem
        generationData = await withTimeout(
          generateFlashcards(
            supabase,
            sanitizedCommand,
            flashcardStatus,
            userId
          ),
          AI_SERVICE_TIMEOUT_MS
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(
          `[${requestId}] Attempt ${retries + 1} failed: ${lastError.message}`
        );

        // Czy ponawiać tylko dla niektórych błędów
        if (
          lastError.message.includes('overloaded') ||
          lastError.message.includes('timed out')
        ) {
          retries++;
          // Krótkie opóźnienie przed ponowieniem
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Dla innych błędów nie ponawiamy
          break;
        }
      }
    }

    // Jeśli wszystkie próby zawiodły
    if (!generationData) {
      if (!lastError) {
        lastError = new Error('Unknown error during generation');
      }
      throw lastError;
    }

    console.log(
      `[${requestId}] Successfully generated ${generationData.generationCount} flashcards`
    );
    console.log(
      `[${requestId}] Generation took ${generationData.generationDuration}ms`
    );

    // 6. Return successful response
    return createSuccessResponse<GenerationGetResponseDTO>(201, generationData);
  } catch (error) {
    // Determine error type
    let errorCode = 'INTERNAL_ERROR.UNKNOWN';
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;

    console.error(
      `[${requestId}] Generation failed: ${error instanceof Error ? error.message : String(error)}`
    );

    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        errorCode = 'INTERNAL_ERROR.AI_SERVICE_TIMEOUT';
        errorMessage = 'The AI service took too long to respond';
      } else if (error.message.includes('content policy')) {
        errorCode = 'INVALID_INPUT.CONTENT_POLICY_VIOLATION';
        errorMessage = 'The input text violates content policy guidelines';
        statusCode = 400;
      } else if (error.message.includes('AI service')) {
        errorCode = 'INTERNAL_ERROR.AI_SERVICE_ERROR';
        errorMessage = 'Error occurred while generating flashcards with AI';
      } else if (
        error.message.includes('database') ||
        error.message.includes('insert') ||
        error.message.includes('update')
      ) {
        errorCode = 'INTERNAL_ERROR.DATABASE_ERROR';
        errorMessage = 'Error occurred while storing data';
      } else if (error.message.includes('overloaded')) {
        errorCode = 'INTERNAL_ERROR.AI_SERVICE_OVERLOADED';
        errorMessage =
          'AI service is currently overloaded, please try again later';
        statusCode = 503; // Service Unavailable
      }
    }

    return createErrorResponse(statusCode, errorCode, errorMessage, {
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
