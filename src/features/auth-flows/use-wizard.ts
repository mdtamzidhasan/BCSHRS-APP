import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { useFormErrors } from '@/hooks/use-form-errors';

import { finishVerify, identify, restart, sendCode, verifyCode, type Channel, type StepResult, type WizardKind } from './api';

export type WizardStep = 'user' | 'choose' | 'code' | 'done';

type Action =
  | { type: 'identify'; userName: string }
  | { type: 'send'; channel: Channel }
  | { type: 'verify'; code: string }
  | { type: 'finish' }
  | { type: 'restart' };

/**
 * The identify -> choose channel -> verify code wizard shared by forgot-password (member/admin) and account activation.
 * The server keeps the state; this hook mirrors the step locally. `onReset` gets the reset request id (member recovery).
 */
export function useWizard(kind: WizardKind, callbacks: { onReset?: (requestId: string) => void; onFinished?: () => void } = {}) {
  const [step, setStep] = useState<WizardStep>('user');
  const [info, setInfo] = useState<string | null>(null);

  const mutation = useMutation<StepResult, Error, Action>({
    mutationFn: async (action) => {
      switch (action.type) {
        case 'identify':
          return (await identify(kind, action.userName)).data;
        case 'send':
          return (await sendCode(kind, action.channel)).data;
        case 'verify':
          return (await verifyCode(kind, action.code)).data;
        case 'finish':
          return (await finishVerify()).data;
        case 'restart':
          return (await restart(kind)).data;
      }
    },
    onSuccess: (data, action) => {
      setInfo(data.info);

      switch (action.type) {
        case 'identify':
          setStep('choose');
          break;
        case 'send':
          setStep('code');
          break;
        case 'verify':
          if (kind === 'member' && data.requestId) {
            callbacks.onReset?.(data.requestId);
          } else {
            setStep('done');
          }
          break;
        case 'finish':
          callbacks.onFinished?.();
          break;
        case 'restart':
          setStep('user');
          setInfo(null);
          break;
      }
    },
  });

  return {
    step,
    info,
    pending: mutation.isPending,
    error: mutation.error,
    errors: useFormErrors(mutation.error),
    identify: (name: string) => mutation.mutate({ type: 'identify', userName: name }),
    send: (channel: Channel) => mutation.mutate({ type: 'send', channel }),
    verify: (code: string) => mutation.mutate({ type: 'verify', code }),
    finish: () => mutation.mutate({ type: 'finish' }),
    /** Back to the first step without asking the server (identify always starts over there). */
    backToStart: () => {
      mutation.reset();
      setStep('user');
      setInfo(null);
    },
  };
}
