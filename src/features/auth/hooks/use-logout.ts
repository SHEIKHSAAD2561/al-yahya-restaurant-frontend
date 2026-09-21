'use client';

import { useRouter } from '@/core/i18n/navigation';
import { authApi } from '../api/auth.api';

export function useLogout() {
  const router = useRouter();

  return async function logout() {
    await authApi.logout().catch(() => undefined);
    router.push('/login');
    router.refresh();
  };
}
