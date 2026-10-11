import { isAxiosError } from 'axios';

/** The failure envelope of the Laravel API: {success:false, message, code, errors?}. */
export interface ApiFailureBody {
  success: false;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
}

/** Every failure the UI sees — normalised once, in the HTTP client, so screens never parse axios errors. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors: Record<string, string> = {},
    readonly data: unknown = undefined,
    readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isValidation(): boolean {
    return this.status === 422 && Object.keys(this.fieldErrors).length > 0;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  /** The first message of a field, if the server named one. */
  field(name: string): string | undefined {
    return this.fieldErrors[name];
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError<ApiFailureBody>(error)) {
    if (!error.response) {
      return new ApiError('Cannot reach the server. Check your connection and try again.', 0, 'NETWORK_ERROR');
    }

    const body = error.response.data;
    const status = error.response.status;
    const fieldErrors: Record<string, string> = {};

    for (const [field, messages] of Object.entries(body?.errors ?? {})) {
      if (messages?.length) {
        fieldErrors[field] = messages[0];
      }
    }

    const retryAfter = Number(error.response.headers?.['retry-after']);

    return new ApiError(
      body?.message ?? (status === 429 ? 'Too many requests. Please try again later.' : 'Something went wrong. Please try again.'),
      status,
      body?.code ?? 'REQUEST_FAILED',
      fieldErrors,
      body?.data,
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
    );
  }

  return new ApiError(error instanceof Error ? error.message : 'Unexpected error.', 0, 'UNKNOWN');
}
