'use client';

import { useQuery } from '@tanstack/react-query';
import { digitalMenuApi } from '../api/digital-menu.api';

export function useDigitalMenuQuery(locationId?: string) {
  return useQuery({
    queryKey: ['digital-menu', locationId] as const,
    queryFn: () => digitalMenuApi.get(locationId),
  });
}
