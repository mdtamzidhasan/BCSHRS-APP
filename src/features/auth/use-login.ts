import { useMutation } from '@tanstack/react-query';

import { login, type OtpChannel } from '@/api/auth';
import { useFormErrors } from '@/hooks/use-form-errors';
import type { Area } from '@/lib/secure-storage';
import { useSession } from '@/store/session';

export interface OtpStep {
  area: Area;
  challengeId: string;
  channels: OtpChannel[];
}

/**
 * Logic of the login screen (the screen itself is layout only): submits the credentials, hands an OTP challenge to
 * `onOtp`, and exposes per-field errors (422), the general message (401 / 429) and the retry-after seconds.
 */
export function useLoginForm(onOtp: (step: OtpStep) => void) {
  const endedReason = useSession((state) => state.endedReason);

  const mutation = useMutation({
    mutationFn: ({ area, ...credentials }: { area: Area; username: string; password: string; company_code?: string }) => login(area, credentials),
    onSuccess: (result) => {
      if (result.kind === 'otp') {
        onOtp({ area: result.area, challengeId: result.challengeId, channels: result.channels });
      }
      // A session result needs no navigation: the root route guard moves the user to their area.
    },
  });

  return {
    submit: (area: Area, credentials: { username: string; password: string; company_code?: string }) => mutation.mutate({ area, ...credentials }),
    pending: mutation.isPending,
    errors: useFormErrors(mutation.error),
    endedReason,
  };
}
