import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette } from '@/theme/tokens';

/** The BCSHRS wordmark (navy) with an optional suffix such as "Admin". */
export function BrandMark({ suffix, size = 22, light }: { suffix?: string; size?: number; light?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText style={{ fontSize: size, fontWeight: '800', letterSpacing: 0.5, color: light ? palette.white : palette.navy }}>BCSHRS</AppText>
      {suffix ? <AppText style={{ fontSize: size, color: light ? palette.white : palette.text }}> {suffix}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
});
