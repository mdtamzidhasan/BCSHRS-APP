import { api } from '@/api/client';
import { flowRequest } from '@/api/flow';

export type WizardKind = 'member' | 'admin' | 'verify';
export type Channel = 'Email' | 'Mobile';

export interface StepResult {
  next: string;
  info: string | null;
  requestId?: string;
}

export const wizardBase: Record<WizardKind, string> = {
  member: '/forgot-password',
  admin: '/admin/forgot-password',
  verify: '/verify-account',
};

export const flowName = (kind: WizardKind) => `auth-${kind}`;

export const identify = (kind: WizardKind, userName: string) => flowRequest<StepResult>(flowName(kind), 'POST', `${wizardBase[kind]}/user`, { user_name: userName });
export const sendCode = (kind: WizardKind, channel: Channel) => flowRequest<StepResult>(flowName(kind), 'POST', `${wizardBase[kind]}/send`, { channel });
export const verifyCode = (kind: WizardKind, code: string) => flowRequest<StepResult>(flowName(kind), 'POST', `${wizardBase[kind]}/verify`, { verification_code: code });
export const finishVerify = () => flowRequest<StepResult>(flowName('verify'), 'POST', '/verify-account/finish');
export const restart = (kind: WizardKind) => flowRequest<StepResult>(flowName(kind), 'POST', `${wizardBase[kind]}/restart`);

// ------------------------------------------------------------------ reset password (area member | admin)
export type ResetArea = 'member' | 'admin';

const resetBase = (area: ResetArea) => (area === 'admin' ? '/admin/reset-password' : '/account/reset-password');

export const checkResetToken = (area: ResetArea, id: string) => api.get<{ requestId: string; tokenError: string | null }>(resetBase(area), { ID: id }, { skipAuth: true });

export const resetPassword = (area: ResetArea, body: { ID: string; new_password: string; new_password_confirmation: string }) =>
  api.post<StepResult>(resetBase(area), body, { skipAuth: true });

// ------------------------------------------------------------------ register
export interface RegisterBody {
  username: string;
  employee_id: string;
  company_code: string;
  email: string;
  password: string;
  password_confirmation: string;
  captcha: string;
  terms: boolean;
}

export const fetchCaptcha = () => flowRequest<{ question: string }>('register', 'GET', '/captcha/refresh');
export const register = (body: RegisterBody) => flowRequest<{ next: string }>('register', 'POST', '/register', body);
