import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { toast } from '@/components/ui/toast';
import { useFormErrors } from '@/hooks/use-form-errors';

import { fetchCaptcha, register } from './api';

const empty = { username: '', employee_id: '', company_code: '', email: '', password: '', password_confirmation: '', captcha: '' };

export function useRegister(onDone: () => void) {
  const [form, setForm] = useState(empty);
  const [terms, setTerms] = useState(false);

  const captcha = useQuery({
    queryKey: ['public', 'captcha'],
    queryFn: async () => (await fetchCaptcha()).data.question,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: () => register({ ...form, terms }),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Your account has been created');
      onDone();
    },
    // A captcha answer is single use: ask for a new question after every failed attempt.
    onError: () => {
      setForm((current) => ({ ...current, captcha: '' }));
      void captcha.refetch();
    },
  });

  return {
    form,
    set: (name: keyof typeof empty) => (value: string) => setForm((current) => ({ ...current, [name]: value })),
    terms,
    setTerms,
    captcha,
    submit: () => mutation.mutate(),
    pending: mutation.isPending,
    errors: useFormErrors(mutation.error),
    error: mutation.error,
  };
}
