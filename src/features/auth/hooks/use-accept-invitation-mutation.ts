'use client';

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export function useAcceptInvitationMutation() {
  return useMutation({
    mutationFn: authApi.acceptInvitation,
  });
}
