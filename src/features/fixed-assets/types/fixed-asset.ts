export const FIXED_ASSET_STATUSES = { ACTIVE: 'ACTIVE', DISPOSED: 'DISPOSED' } as const;
export type FixedAssetStatus = (typeof FIXED_ASSET_STATUSES)[keyof typeof FIXED_ASSET_STATUSES];

export interface FixedAsset {
  id: string;
  name: string;
  category: string | null;
  locationId: string | null;
  location?: { id: string; name: string } | null;
  assetAccountId: string;
  accumulatedDepreciationAccountId: string;
  depreciationExpenseAccountId: string;
  purchaseDate: string;
  purchaseCost: number;
  usefulLifeMonths: number;
  salvageValue: number;
  status: FixedAssetStatus;
  disposedAt: string | null;
  notes: string | null;
  accumulatedDepreciation: number;
  bookValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface FixedAssetDepreciationEntry {
  id: string;
  fixedAssetId: string;
  journalEntryId: string;
  journalEntry?: { id: string; entryNumber: string | null };
  periodDate: string;
  amount: number;
  createdAt: string;
}
