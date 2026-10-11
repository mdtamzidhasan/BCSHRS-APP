import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useFormErrors } from '@/hooks/use-form-errors';

import { checkResetToken, resetPassword, type ResetArea } from './api';

/** The reset-password step: validates the request id (30 min, single use) and sets the new password. */
export function useResetPassword(area: ResetArea, id: string) {
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const token = useQuery({
    queryKey: ['public', 'reset-token', area, id],
    queryFn: async () => (await checkResetToken(area, id)).data,
    enabled: id !== '',
    gcTime: 0,
  });

  const mutation = useMutation({
    mutationFn: () => resetPassword(area, { ID: id, new_password: password, new_password_confirmation: confirmation }),
    onSuccess: () => setDone(true),
  });

  return {
    done,
    password,
    setPassword,
    confirmation,
    setConfirmation,
    token,
    tokenError: token.data?.tokenError ?? null,
    submit: () => mutation.mutate(),
    pending: mutation.isPending,
    error: mutation.error,
    errors: useFormErrors(mutation.error),
  };
}
