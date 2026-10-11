import { create } from 'zustand';

import type { Area, StoredUser } from '@/lib/secure-storage';

export type SessionStatus = 'booting' | 'authenticated' | 'unauthenticated';

interface SessionState {
  status: SessionStatus;
  area: Area | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: StoredUser | null;
  /** The privacy lock: payroll data stays hidden until the biometric check passes. */
  locked: boolean;
  /** Why the session ended (shown once on the login screen), e.g. "Your session has expired." */
  endedReason: string | null;
  setSession: (session: { area: Area; accessToken: string; refreshToken: string | null; user: StoredUser | null }) => void;
  setTokens: (accessToken: string, refreshToken: string | null) => void;
  setUser: (user: StoredUser | null) => void;
  setLocked: (locked: boolean) => void;
  markUnauthenticated: (reason?: string | null) => void;
}

/**
 * The global authentication context. Held in a store (not React state) so the HTTP client can read the token and end the
 * session from outside the component tree; screens subscribe through the hooks in `use-auth`.
 */
export const useSession = create<SessionState>((set) => ({
  status: 'booting',
  area: null,
  accessToken: null,
  refreshToken: null,
  user: null,
  locked: false,
  endedReason: null,
  setSession: ({ area, accessToken, refreshToken, user }) =>
    set({ status: 'authenticated', area, accessToken, refreshToken, user, locked: false, endedReason: null }),
  setTokens: (accessToken, refreshToken) => set((state) => ({ accessToken, refreshToken: refreshToken ?? state.refreshToken })),
  setUser: (user) => set({ user }),
  setLocked: (locked) => set({ locked }),
  markUnauthenticated: (reason = null) =>
    set({ status: 'unauthenticated', area: null, accessToken: null, refreshToken: null, user: null, locked: false, endedReason: reason }),
}));
