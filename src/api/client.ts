import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/lib/config';
import { secureStorage } from '@/lib/secure-storage';
import { useSession } from '@/store/session';

import { ApiError, toApiError } from './errors';

/** The success envelope of the Laravel API. */
export interface ApiSuccess<T> {
  success: true;
  message: string | null;
  data: T;
}

/** A paginator inside `data` arrives as {items, meta}. */
export interface Paginated<T> {
  items: T[];
  meta: { current_page: number; per_page: number; total: number | null; last_page: number | null };
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Do not attach the Bearer token and never try a token refresh (login, OTP, public flows). */
    skipAuth?: boolean;
    _retried?: boolean;
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

// ------------------------------------------------------------------ request: Bearer token
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.skipAuth) {
    const { accessToken } = useSession.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

// ------------------------------------------------------------------ response: refresh on 401, normalise errors
let refreshing: Promise<boolean> | null = null;

/** One refresh at a time: concurrent 401s wait for the same renewal. */
async function renewSession(): Promise<boolean> {
  const { area, refreshToken } = useSession.getState();

  if (!area || !refreshToken) {
    return false;
  }

  try {
    const response = await axios.post<ApiSuccess<{ token: string; refresh_token: string }>>(
      `${API_BASE_URL}${area === 'admin' ? '/admin' : ''}/auth/refresh`,
      null,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${refreshToken}` }, timeout: REQUEST_TIMEOUT_MS },
    );

    const { token, refresh_token } = response.data.data;

    await secureStorage.saveTokens(token, refresh_token);
    useSession.getState().setTokens(token, refresh_token);

    return true;
  } catch {
    return false;
  }
}

/** Ends the session everywhere: memory, secure storage, and (through the route guard) back to the login screen. */
export async function endSession(reason: string | null = null): Promise<void> {
  await secureStorage.clearSession();
  useSession.getState().markUnauthenticated(reason);
}

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const original = axios.isAxiosError(error) ? (error.config as InternalAxiosRequestConfig | undefined) : undefined;

    if (axios.isAxiosError(error) && error.response?.status === 401 && original && !original.skipAuth && !original._retried) {
      original._retried = true;
      refreshing ??= renewSession().finally(() => {
        refreshing = null;
      });

      if (await refreshing) {
        original.headers.Authorization = `Bearer ${useSession.getState().accessToken}`;

        return http.request(original);
      }

      await endSession('Your session has expired. Please log in again.');
    }

    // The account or its company database became unavailable: the session cannot continue.
    if (axios.isAxiosError(error) && error.response && [403, 503].includes(error.response.status)) {
      const body = error.response.data as { code?: string; message?: string } | undefined;

      if (body?.code === 'ACCOUNT_LOCKED' || body?.code === 'TENANT_UNAVAILABLE' || body?.code === 'ADMIN_ACCESS_DENIED') {
        await endSession(body.message ?? null);
      }
    }

    return Promise.reject(toApiError(error));
  },
);

// ------------------------------------------------------------------ typed helpers (return the envelope)
type Params = Record<string, unknown> | undefined;

export const api = {
  async get<T>(url: string, params?: Params, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
    return (await http.get<ApiSuccess<T>>(url, { params, ...config })).data;
  },
  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
    return (await http.post<ApiSuccess<T>>(url, body, config)).data;
  },
  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
    return (await http.put<ApiSuccess<T>>(url, body, config)).data;
  },
  async delete<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
    return (await http.delete<ApiSuccess<T>>(url, { data: body, ...config })).data;
  },
  /** Multipart upload; `file` is a picked document or image. */
  async upload<T>(
    url: string,
    file: { uri: string; name: string; type: string },
    fields: Record<string, string | number | boolean | undefined> = {},
    fileField = 'file',
  ): Promise<ApiSuccess<T>> {
    const form = new FormData();
    form.append(fileField, { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        form.append(key, String(value));
      }
    }

    return (await http.post<ApiSuccess<T>>(url, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};

export { ApiError };
