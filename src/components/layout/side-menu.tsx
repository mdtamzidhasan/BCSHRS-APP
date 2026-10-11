import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { AppText } from '@/components/ui/app-text';
import { useAuth } from '@/hooks/use-auth';
import { useAdminMenu } from '@/features/admin/use-admin-menu';
import { palette, radius, spacing } from '@/theme/tokens';

import { BrandMark } from './brand-mark';

export const useSideMenu = create<{ visible: boolean; open: () => void; close: () => void }>((set) => ({
  visible: false,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
}));

const GROUP_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'access report': 'folder-outline',
  'component mgmt': 'folder-outline',
  'employee mgmt': 'folder-outline',
  others: 'folder-outline',
  'role mgmt': 'folder-outline',
  'salary sheet': 'folder-outline',
  'user control': 'folder-outline',
};

/** The sidebar of the web app as a slide-in menu: Home, the role's menu groups (expand to see pages), Change Password. */
export function SideMenu() {
  const { visible, close } = useSideMenu();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, area, logout } = useAuth();
  const menu = useAdminMenu();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const go = (href: Href) => {
    close();
    router.push(href);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.root}>
        <View style={[styles.panel, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.welcome}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={palette.white} />
            </View>
            <AppText>
              Welcome <AppText weight="bold" tone="accent">{user?.username?.toUpperCase()}</AppText>!
            </AppText>
          </View>

          <ScrollView contentContainerStyle={styles.items}>
            <Pressable style={[styles.item, styles.itemActive]} onPress={() => go(area === 'admin' ? '/(admin)/(tabs)' : '/(member)/(tabs)')}>
              <Ionicons name="home-outline" size={20} color={palette.white} />
              <AppText weight="medium" tone="inverse">Home</AppText>
            </Pressable>

            {area === 'admin' &&
              menu.data?.map((group) => {
                const expanded = openGroup === group.name;

                return (
                  <View key={group.name}>
                    <Pressable style={[styles.item, expanded && styles.itemExpanded]} onPress={() => setOpenGroup(expanded ? null : group.name)}>
                      <Ionicons name={GROUP_ICONS[group.name.toLowerCase()] ?? 'folder-outline'} size={20} color={palette.textMuted} />
                      <AppText weight="medium" style={styles.itemText}>{group.name}</AppText>
                      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={palette.textMuted} />
                    </Pressable>
                    {expanded
                      ? group.features.map((feature) => (
                          <Pressable key={feature.key} style={styles.subItem} onPress={() => go(feature.href)}>
                            <Ionicons name={feature.icon} size={16} color={palette.primary} />
                            <AppText style={styles.itemText}>{feature.title}</AppText>
                          </Pressable>
                        ))
                      : null}
                  </View>
                );
              })}

            <Pressable style={styles.item} onPress={() => go(area === 'admin' ? '/change-password' : '/member/change-password')}>
              <Ionicons name="key-outline" size={20} color={palette.textMuted} />
              <AppText weight="medium">Change Password</AppText>
            </Pressable>
            <Pressable
              style={styles.item}
              onPress={() => {
                close();
                void logout();
              }}>
              <Ionicons name="log-out-outline" size={20} color={palette.danger} />
              <AppText weight="medium" tone="danger">Log out</AppText>
            </Pressable>
          </ScrollView>
          <View style={styles.brand}>
            <BrandMark suffix={area === 'admin' ? 'Admin' : undefined} size={16} />
          </View>
        </View>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close menu" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  panel: { width: '80%', maxWidth: 340, backgroundColor: palette.surface, paddingHorizontal: spacing.md },
  backdrop: { flex: 1, backgroundColor: palette.overlay },
  welcome: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
  items: { gap: spacing.xs, paddingBottom: spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md },
  itemActive: { backgroundColor: palette.accent },
  itemExpanded: { backgroundColor: palette.accentSoft },
  itemText: { flex: 1 },
  subItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, paddingLeft: spacing.xxl, paddingRight: spacing.md },
  brand: { alignItems: 'center', paddingTop: spacing.md },
});
