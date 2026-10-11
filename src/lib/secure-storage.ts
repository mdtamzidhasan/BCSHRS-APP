import * as SecureStore from 'expo-secure-store';

/** Hardware-backed (Keychain / Keystore) storage of the session tokens and the few user preferences. */
const KEYS = {
  accessToken: 'bcshrs.access_token',
  refreshToken: 'bcshrs.refresh_token',
  area: 'bcshrs.area',
  user: 'bcshrs.user',
  biometricLock: 'bcshrs.biometric_lock',
} as const;

export type Area = 'member' | 'admin';

export interface StoredSession {
  accessToken: string;
  refreshToken: string | null;
  area: Area;
  user: StoredUser | null;
}

export interface StoredUser {
  id: string | number;
  username: string;
  company?: { code: string; name?: string } | null;
  role?: string | null;
}

async function read(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export const secureStorage = {
  async loadSession(): Promise<StoredSession | null> {
    const [accessToken, refreshToken, area, user] = await Promise.all([
      read(KEYS.accessToken),
      read(KEYS.refreshToken),
      read(KEYS.area),
      read(KEYS.user),
    ]);

    if (!accessToken || (area !== 'member' && area !== 'admin')) {
      return null;
    }

    return { accessToken, refreshToken, area, user: user ? (JSON.parse(user) as StoredUser) : null };
  },

  async saveSession(session: StoredSession): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.accessToken, session.accessToken),
      session.refreshToken ? SecureStore.setItemAsync(KEYS.refreshToken, session.refreshToken) : SecureStore.deleteItemAsync(KEYS.refreshToken),
      SecureStore.setItemAsync(KEYS.area, session.area),
      SecureStore.setItemAsync(KEYS.user, JSON.stringify(session.user)),
    ]);
  },

  async saveTokens(accessToken: string, refreshToken: string | null): Promise<void> {
    await SecureStore.setItemAsync(KEYS.accessToken, accessToken);

    if (refreshToken) {
      await SecureStore.setItemAsync(KEYS.refreshToken, refreshToken);
    }
  },

  async clearSession(): Promise<void> {
    await Promise.all([KEYS.accessToken, KEYS.refreshToken, KEYS.area, KEYS.user].map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined)));
  },

  async getBiometricLock(): Promise<boolean> {
    return (await read(KEYS.biometricLock)) !== 'off';
  },

  async setBiometricLock(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(KEYS.biometricLock, enabled ? 'on' : 'off');
  },
};
