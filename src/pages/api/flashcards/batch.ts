import type { APIRoute } from 'astro';
import { flashcardBatchCreateSchema } from '../../../lib/schemas/flashcard.schema';
import type { ApiErrorResponse, ApiResponse } from '../../../lib/schemas/flashcard.schema';
import { createFlashcardBatch } from '../../../lib/services/flashcard.service';
import type { FlashcardBatchResponseSchema } from '../../../lib/schemas/flashcard.schema';
import { defaultUserId } from '../../../db/supabase.client';

export const prerender = false;

/**
 * Creates an error response with standard format
 */
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

/**
 * Creates a success response with standard format
 */
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

export const POST: APIRoute = async ({ request, locals }) => {
  // Generate request ID for tracking
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Processing batch flashcard creation request`);

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

  // 2. Use default user ID (authorization will be implemented later)
  const userId = defaultUserId;

  // 3. Parse and validate request body
  let requestBody;
  try {
    requestBody = await request.json();
    console.log(
      `[${requestId}] Received batch request with body length: ${JSON.stringify(requestBody).length}`
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

  try {
    // 4. Validate batch data
    const validationResult = flashcardBatchCreateSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error(`[${requestId}] Validation failed for batch flashcard data:`, validationResult.error);
      return createErrorResponse(
        400,
        'INVALID_INPUT.VALIDATION_FAILED',
        'Invalid flashcard batch data provided',
        { errors: validationResult.error.format() }
      );
    }

    // 5. Create flashcards in batch
    const result = await createFlashcardBatch(
      supabase, 
      validationResult.data.flashcardList, 
      userId
    );
    
    console.log(`[${requestId}] Successfully created ${result.listTotal} flashcards in batch`);
    
    return createSuccessResponse<FlashcardBatchResponseSchema>(201, result);
  } catch (error) {
    // Determine error type and create appropriate response
    let errorCode = 'INTERNAL_ERROR.UNKNOWN';
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;

    console.error(
      `[${requestId}] Batch flashcard creation failed: ${error instanceof Error ? error.message : String(error)}`
    );

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('invalid flashcard configuration')) {
        errorCode = 'INVALID_INPUT.SOURCE_GENERATION_MISMATCH';
        errorMessage = error.message;
        statusCode = 400;
      } else if (errorMsg.includes('database') || errorMsg.includes('insert')) {
        errorCode = 'INTERNAL_ERROR.DATABASE_ERROR';
        errorMessage = 'Error occurred while storing flashcard data';
      }
    }

    return createErrorResponse(statusCode, errorCode, errorMessage, {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}; 