import type { APIRoute } from 'astro';
import { runPerformanceTest } from '../../lib/services/generation.performance.service';
import { generationCreateSchema } from '../../lib/schemas/generation.schema';
import type { ApiErrorResponse, ApiResponse } from '../../lib/schemas/generation.schema';
import type { GenerationGetResponseDTO } from '../../types';
import { default_user_ID } from '../../db/supabase.client';

export const prerender = false;

// Interfejs dla opcji testów wydajnościowych
interface PerformanceOptions {
  responseDelay?: number;
  failureRate?: number;
  cpuIntensity?: number;
  variableLatency?: boolean;
  flashcardCount?: number;
  retries?: number;
}

function createErrorResponse(status: number, code: string, message: string, details: object | null = null): Response {
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

/**
 * Endpoint do testowania wydajności generowania fiszek.
 * Umożliwia symulację różnych scenariuszy obciążenia i opóźnień.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting performance test`);

  // 1. Get supabase client from context
  const supabase = locals.supabase;
  if (!supabase) {
    console.error(`[${requestId}] Database connection not available`);
    return createErrorResponse(500, 'INTERNAL_ERROR.DATABASE_CONNECTION', 'Database connection not available');
  }

  // 2. Używamy domyślnego ID użytkownika
  const userId = default_user_ID;

  // 3. Validate request body
  let requestData: Record<string, unknown>;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error(`[${requestId}] Invalid JSON in request body`);
    return createErrorResponse(400, 'INVALID_INPUT.MALFORMED_JSON', 'Invalid JSON in request body');
  }

  // Ekstrakcja parametrów testu
  const { performanceOptions = {}, ...requestBody } = requestData;

  // 4. Validate core parameters against schema
  const validationResult = generationCreateSchema.safeParse(requestBody);
  if (!validationResult.success) {
    const validationErrors = validationResult.error.format();
    console.error(`[${requestId}] Validation failed:`, validationErrors);

    return createErrorResponse(
      400,
      'INVALID_INPUT.VALIDATION_ERROR',
      'Validation failed for generation parameters',
      validationErrors
    );
  }

  // 5. Walidacja parametrów wydajnościowych
  const performanceSettings = validatePerformanceOptions(performanceOptions as Partial<PerformanceOptions>);

  console.log(`[${requestId}] Running performance test with settings:`, performanceSettings);

  // 6. Uruchomienie testu
  try {
    const generationData = await runPerformanceTest(supabase, validationResult.data, performanceSettings, userId);

    console.log(`[${requestId}] Performance test completed successfully`);

    return createSuccessResponse<GenerationGetResponseDTO>(201, generationData);
  } catch (error) {
    console.error(`[${requestId}] Performance test failed: ${error instanceof Error ? error.message : String(error)}`);

    return createErrorResponse(500, 'PERFORMANCE_TEST_ERROR', 'Performance test execution failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Waliduje i normalizuje parametry testu wydajnościowego
 */
function validatePerformanceOptions(options: Partial<PerformanceOptions> = {}): PerformanceOptions {
  const result = {
    responseDelay: clampNumber(options.responseDelay, 0, 10000, 2000),
    failureRate: clampNumber(options.failureRate, 0, 100, 10),
    cpuIntensity: clampNumber(options.cpuIntensity, 0, 10, 3),
    variableLatency: options.variableLatency !== undefined ? !!options.variableLatency : true,
    flashcardCount: clampNumber(options.flashcardCount, 1, 50, 5),
    retries: clampNumber(options.retries, 0, 5, 2),
  };

  return result;
}

/**
 * Ogranicza wartość liczbową do podanego zakresu
 */
function clampNumber(value: unknown, min: number, max: number, defaultValue: number): number {
  if (typeof value !== 'number' || isNaN(value)) {
    return defaultValue;
  }
  return Math.min(Math.max(value, min), max);
}
