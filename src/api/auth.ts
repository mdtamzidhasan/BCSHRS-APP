import { api, http } from './client';
import { secureStorage, type Area, type StoredUser } from '@/lib/secure-storage';
import { useSession } from '@/store/session';

/** The names the API uses (OtpService::CHANNEL_EMAIL / CHANNEL_MOBILE) — capitalised, and sent back as they are. */
export type OtpChannel = 'Email' | 'Mobile';

export interface LoginTokens {
  token: string;
  refresh_token: string;
  user: { id: string | number; username: string };
  company?: { code: string; name?: string };
}

export interface OtpChallenge {
  otp_required: true;
  challenge_id: string;
  channels: OtpChannel[];
}

export type LoginResult = { kind: 'session' } | { kind: 'otp'; area: Area; challengeId: string; channels: OtpChannel[] };

const base = (area: Area) => (area === 'admin' ? '/admin/auth' : '/auth');

/** Stores the tokens (secure storage first, then the in-memory session the route guard watches). */
async function startSession(area: Area, data: LoginTokens): Promise<void> {
  const user: StoredUser = { id: data.user.id, username: data.user.username, company: data.company ?? null };

  await secureStorage.saveSession({ accessToken: data.token, refreshToken: data.refresh_token ?? null, area, user });
  useSession.getState().setSession({ area, accessToken: data.token, refreshToken: data.refresh_token ?? null, user });
}

/** Login for a member (username + password) or an admin (company code + username + password), with or without OTP. */
export async function login(area: Area, credentials: { username: string; password: string; company_code?: string }): Promise<LoginResult> {
  const response = await api.post<LoginTokens | OtpChallenge>(`${base(area)}/login`, credentials, { skipAuth: true });
  const data = response.data;

  if ('otp_required' in data) {
    return { kind: 'otp', area, challengeId: data.challenge_id, channels: data.channels };
  }

  await startSession(area, data);

  return { kind: 'session' };
}

export async function sendOtp(area: Area, challengeId: string, channel: OtpChannel): Promise<string | null> {
  return (await api.post<null>(`${base(area)}/otp/send`, { challenge_id: challengeId, channel }, { skipAuth: true })).message;
}

export async function verifyOtp(area: Area, challengeId: string, code: string): Promise<void> {
  const response = await api.post<LoginTokens>(`${base(area)}/otp/verify`, { challenge_id: challengeId, verification_code: code }, { skipAuth: true });

  await startSession(area, response.data);
}

/** The identity check the app runs when it returns to the foreground (also proves the tenant database is reachable). */
export async function fetchMe(area: Area) {
  return api.get<{ user: { id: string | number; username: string }; company?: { code: string }; role?: string | null }>(`${base(area)}/me`);
}

export async function logout(): Promise<void> {
  const { area, refreshToken } = useSession.getState();

  try {
    if (area) {
      await http.post(`${base(area)}/logout`, { refresh_token: refreshToken });
    }
  } catch {
    // The session ends locally either way.
  }
}
