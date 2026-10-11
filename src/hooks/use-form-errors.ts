import { toApiError } from '@/api/errors';

/**
 * Maps a failed request to per-field messages: `errors.field('username')` goes under that input, `errors.general` is the
 * form-level message when the server named no field (a business-rule failure, a 429 …). Nothing throws on screen.
 */
export function useFormErrors(error: unknown) {
  if (!error) {
    return { field: (_name: string): string | undefined => undefined, general: undefined as string | undefined, retryAfter: null as number | null };
  }

  const failure = toApiError(error);

  return {
    field: (name: string) => failure.fieldErrors[name],
    general: failure.isValidation ? undefined : failure.message,
    retryAfter: failure.retryAfterSeconds,
  };
}
