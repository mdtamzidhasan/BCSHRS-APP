import { useMutation } from '@tanstack/react-query';

import { sendOtp, verifyOtp, type OtpChannel } from '@/api/auth';
import { useFormErrors } from '@/hooks/use-form-errors';
import type { Area } from '@/lib/secure-storage';

/** Logic of the OTP screen: send the code through a channel, then verify it (success starts the session). */
export function useOtpVerification(area: Area, challengeId: string) {
  const send = useMutation({ mutationFn: (channel: OtpChannel) => sendOtp(area, challengeId, channel) });
  const verify = useMutation({ mutationFn: (code: string) => verifyOtp(area, challengeId, code) });

  return {
    /** Resolves to the server message (or null) on success, undefined when it failed (see `sendError`). */
    send: async (channel: OtpChannel): Promise<string | null | undefined> => send.mutateAsync(channel).catch(() => undefined),
    verify: (code: string) => verify.mutate(code),
    sending: send.isPending,
    verifying: verify.isPending,
    sendError: send.error,
    verifyError: verify.error,
    errors: useFormErrors(verify.error),
  };
}
