import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';

import { ADMIN_FEATURES, EXTRA_FEATURES_BY_GROUP, type AdminFeature } from './registry';

interface MenuNode {
  id: number;
  name: string;
  feature: string | null;
  children: { id: number; name: string; feature: string | null }[];
}

export interface MenuGroup {
  /** The server's MenuName ("Role Mgmt", "Salary Sheet" …). */
  name: string;
  features: AdminFeature[];
}

/** GET /admin/menu — the groups and pages this role may open, resolved to the app's screens. */
export function useAdminMenu() {
  return useQuery({
    queryKey: ['admin', 'menu'],
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<MenuGroup[]> => {
      const { data } = await api.get<{ menu: MenuNode[] }>('/admin/menu');

      return data.menu
        .map((group): MenuGroup => {
          const keys = new Set<string>();

          for (const child of group.children) {
            if (child.feature && ADMIN_FEATURES[child.feature]) {
              keys.add(child.feature);
            }
          }

          for (const extra of EXTRA_FEATURES_BY_GROUP[group.name.toLowerCase()] ?? []) {
            keys.add(extra);
          }

          return { name: group.name, features: [...keys].map((key) => ADMIN_FEATURES[key]).filter(Boolean) };
        })
        .filter((group) => group.features.length > 0);
    },
  });
}
