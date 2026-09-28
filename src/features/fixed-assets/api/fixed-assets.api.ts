import { backendFetch } from '@/core/api/backend-fetch-client';
import type { FixedAsset, FixedAssetDepreciationEntry, FixedAssetStatus } from '../types/fixed-asset';

export interface FixedAssetsQuery {
  status?: FixedAssetStatus;
  locationId?: string;
}

export interface CreateFixedAssetInput {
  name: string;
  category?: string;
  locationId?: string | null;
  assetAccountId: string;
  accumulatedDepreciationAccountId: string;
  depreciationExpenseAccountId: string;
  purchaseDate: string;
  purchaseCost: number;
  usefulLifeMonths: number;
  salvageValue?: number;
  paymentAccountId?: string;
  notes?: string;
}

export type UpdateFixedAssetInput = Partial<
  Omit<CreateFixedAssetInput, 'purchaseCost' | 'purchaseDate' | 'paymentAccountId'>
>;

export const fixedAssetsApi = {
  list: (query: FixedAssetsQuery = {}) =>
    backendFetch<FixedAsset[]>('fixed-assets', { searchParams: { status: query.status, locationId: query.locationId } }),
  get: (id: string) => backendFetch<FixedAsset>(`fixed-assets/${id}`),
  create: (input: CreateFixedAssetInput) => backendFetch<FixedAsset>('fixed-assets', { method: 'POST', body: input }),
  update: (id: string, input: UpdateFixedAssetInput) =>
    backendFetch<FixedAsset>(`fixed-assets/${id}`, { method: 'PATCH', body: input }),
  recordDepreciation: (id: string, input: { periodDate: string; amount?: number }) =>
    backendFetch<FixedAsset>(`fixed-assets/${id}/depreciation-entries`, { method: 'POST', body: input }),
  listDepreciationEntries: (id: string) =>
    backendFetch<FixedAssetDepreciationEntry[]>(`fixed-assets/${id}/depreciation-entries`),
  dispose: (id: string, disposalDate: string) =>
    backendFetch<FixedAsset>(`fixed-assets/${id}/dispose`, { method: 'POST', body: { disposalDate } }),
  remove: (id: string) => backendFetch<void>(`fixed-assets/${id}`, { method: 'DELETE' }),
};
