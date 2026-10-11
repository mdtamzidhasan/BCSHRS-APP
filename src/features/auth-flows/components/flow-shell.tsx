import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/layout/brand-mark';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { palette, spacing } from '@/theme/tokens';

/** The frame of every public flow screen: brand, one card with a heading, and a way back to the login. */
export function FlowShell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <BrandMark size={32} />
          </View>
          <Card>
            <AppText variant="heading" style={styles.heading}>
              {title}
            </AppText>
            {children}
          </Card>
          <Button title="Back to login" variant="ghost" block={false} size="sm" onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
  brand: { alignItems: 'center' },
  heading: { marginBottom: spacing.md },
});
