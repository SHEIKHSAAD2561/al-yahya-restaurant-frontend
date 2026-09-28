'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { journalEntriesApi, type JournalEntryInput } from '../api/journal-entries.api';
import { journalEntriesKeys } from '../api/journal-entries.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSaveJournalEntryMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('journalEntries');

  return useMutation({
    mutationFn: (input: JournalEntryInput) => (id ? journalEntriesApi.update(id, input) : journalEntriesApi.create(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: journalEntriesKeys.lists() });
      if (id) void queryClient.invalidateQueries({ queryKey: journalEntriesKeys.detail(id) });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function usePostJournalEntryMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('journalEntries');

  return useMutation({
    mutationFn: (id: string) => journalEntriesApi.post(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: journalEntriesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: journalEntriesKeys.detail(id) });
      toast.success(t('posted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useReverseJournalEntryMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('journalEntries');

  return useMutation({
    mutationFn: (id: string) => journalEntriesApi.reverse(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: journalEntriesKeys.lists() });
      toast.success(t('reversed'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteJournalEntryMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('journalEntries');

  return useMutation({
    mutationFn: (id: string) => journalEntriesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: journalEntriesKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
