import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { SwitchRow } from '@/components/ui/misc';
import { secureStorage } from '@/lib/secure-storage';

/** The privacy lock switch: ask for fingerprint / face when the app is opened again after a short time away. */
export function BiometricSetting() {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    void (async () => {
      const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
      setAvailable(hardware && enrolled);
      setEnabled(await secureStorage.getBiometricLock());
    })();
  }, []);

  return (
    <Card>
      <SwitchRow
        label="Biometric lock"
        description={available ? 'Ask for fingerprint or face when returning to the app.' : 'No fingerprint or face is set up on this device.'}
        value={available && enabled}
        disabled={!available}
        onChange={(value) => {
          setEnabled(value);
          void secureStorage.setBiometricLock(value);
        }}
      />
    </Card>
  );
}
