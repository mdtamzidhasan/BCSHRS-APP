import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { fetchMe } from '@/api/auth';
import { endSession } from '@/api/client';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/app-text';
import { secureStorage } from '@/lib/secure-storage';
import { useSession } from '@/store/session';
import { spacing } from '@/theme/tokens';

import { BrandMark } from './brand-mark';

/** Away longer than this and the biometric check is required on return. */
const LOCK_AFTER_MS = 20_000;

/**
 * Foreground privacy and session watch, mounted once over the whole app:
 *  - going to the background / app switcher covers the screen with a blur + wordmark so payroll figures are not visible;
 *  - coming back after a while asks for fingerprint / face (when the device has it and the lock is on);
 *  - coming back also pings /auth/me, which proves the token and the company database are still valid (a 401 triggers the
 *    silent token refresh in the HTTP client; an unavailable tenant ends the session).
 */
export function PrivacyGuard() {
  const status = useSession((state) => state.status);
  const locked = useSession((state) => state.locked);
  const [covered, setCovered] = useState(false);
  const leftAt = useRef<number | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  const unlock = useCallback(async () => {
    setAuthenticating(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock BCSHRS', disableDeviceFallback: false });

      if (result.success) {
        useSession.getState().setLocked(false);
      }
    } finally {
      setAuthenticating(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') {
      setCovered(false);
      return;
    }

    const subscription = AppState.addEventListener('change', async (next) => {
      if (next !== 'active') {
        leftAt.current ??= Date.now();
        setCovered(true);

        return;
      }

      setCovered(false);

      const awayMs = leftAt.current ? Date.now() - leftAt.current : 0;
      leftAt.current = null;

      const { area } = useSession.getState();

      if (area) {
        fetchMe(area).catch(() => undefined); // 401 → silent refresh or sign-out happens in the HTTP client
      }

      if (awayMs > LOCK_AFTER_MS && (await secureStorage.getBiometricLock())) {
        const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);

        if (hardware && enrolled) {
          useSession.getState().setLocked(true);
          void unlock();
        }
      }
    });

    return () => subscription.remove();
  }, [status, unlock]);

  if (status !== 'authenticated' || (!covered && !locked)) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <BrandMark size={34} />
        {locked && !covered ? (
          <View style={styles.actions}>
            <AppText tone="muted">BCSHRS is locked</AppText>
            <Button title="Unlock" icon="finger-print" loading={authenticating} block={false} onPress={unlock} />
            <Button title="Log out" variant="ghost" block={false} onPress={() => endSession('You logged out.')} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, backgroundColor: 'rgba(245,245,250,0.6)' },
  actions: { alignItems: 'center', gap: spacing.md },
});

