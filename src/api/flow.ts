import type { Method } from 'axios';

import { http, type ApiSuccess } from './client';

const FLOW_HEADER = 'X-Flow-Token';

/** One server-side session token per public flow (memory only, never persisted). */
const tokens = new Map<string, string>();

/**
 * Calls a public multi-step endpoint: sends the flow's `X-Flow-Token` (if one was issued) and keeps the token the
 * server returns in the response header. Unauthenticated (`skipAuth`); the global interceptors are untouched.
 */
export async function flowRequest<T>(flow: string, method: Method, url: string, body?: unknown, params?: Record<string, unknown>): Promise<ApiSuccess<T>> {
  const token = tokens.get(flow);
  const response = await http.request<ApiSuccess<T>>({
    method,
    url,
    data: body,
    params,
    skipAuth: true,
    headers: token ? { [FLOW_HEADER]: token } : undefined,
  });

  const issued = response.headers[FLOW_HEADER.toLowerCase()] as unknown;

  if (typeof issued === 'string' && issued !== '') {
    tokens.set(flow, issued);
  }

  return response.data;
}

/** Forgets a flow's token (start of a fresh run). */
export function resetFlow(flow: string): void {
  tokens.delete(flow);
}
