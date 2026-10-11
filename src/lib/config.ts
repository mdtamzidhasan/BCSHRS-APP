import Constants from 'expo-constants';

/**
 * The Laravel API root (…/api/v1). Set EXPO_PUBLIC_API_URL (e.g. in .env) to point the app at another server;
 * on a real phone this must be the computer's LAN address, never localhost.
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://192.168.25.49:8000/api/v1';

export const REQUEST_TIMEOUT_MS = 30_000;

/** Reports and lists stay fresh for this long before a silent background refetch. */
export const QUERY_STALE_MS = 5 * 60_000;
