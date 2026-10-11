import { useRouter } from 'expo-router';

import { logout as logoutRequest } from '@/api/auth';
import { endSession } from '@/api/client';
import { queryClient } from '@/api/query-client';
import { useSession } from '@/store/session';

/** The auth context for screens: who is logged in, in which area, and the logout action. */
export function useAuth() {
  const status = useSession((state) => state.status);
  const area = useSession((state) => state.area);
  const user = useSession((state) => state.user);
  const router = useRouter();

  const logout = async () => {
    await logoutRequest();
    queryClient.clear();
    await endSession(null);
    router.replace('/login');
  };

  return { status, area, user, isAuthenticated: status === 'authenticated', logout };
}
