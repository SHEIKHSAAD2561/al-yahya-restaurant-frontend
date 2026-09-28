import { backendFetch } from '@/core/api/backend-fetch-client';
import type { ReceiptSettings, ReceiptSettingsInput } from '../types/receipt-settings';

export const receiptSettingsApi = {
  get: () => backendFetch<ReceiptSettings>('receipt-settings'),
  update: (input: ReceiptSettingsInput) =>
    backendFetch<ReceiptSettings>('receipt-settings', { method: 'PATCH', body: input }),
  uploadCommentImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return backendFetch<ReceiptSettings>('receipt-settings/comment-image', {
      method: 'POST',
      body: formData,
    });
  },
  removeCommentImage: () =>
    backendFetch<ReceiptSettings>('receipt-settings/comment-image', { method: 'DELETE' }),
};
