import type { Denomination } from '@/features/registers/types/register';

/** A closed session's status is derived (not stored) — see the backend's
 * `RegistersService.sessionStatus()`: OPEN while the session is open,
 * otherwise BALANCED/UNBALANCED based on whether |difference| is under a
 * small epsilon. */
export type SessionStatus = 'OPEN' | 'BALANCED' | 'UNBALANCED';

export interface SessionListItem {
  id: string;
  registerId: string;
  registerName: string;
  locationId: string;
  locationName: string;
  openedByName: string;
  closedByName: string | null;
  openedAt: string;
  closedAt: string | null;
  status: SessionStatus;
}

export interface SessionListPage {
  items: SessionListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaymentMethodSummary {
  paymentMethodId: string;
  paymentMethodName: string;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  denominations: Denomination[] | null;
}

export interface SessionDetail {
  id: string;
  registerId: string;
  registerName: string;
  locationId: string;
  locationName: string;
  openedByName: string;
  closedByName: string | null;
  openedAt: string;
  closedAt: string | null;
  status: SessionStatus;
  openingAmount: number;
  openingDenominations: Denomination[] | null;
  totalExpected: number | null;
  totalCounted: number | null;
  totalDifference: number | null;
  paymentSummaries: PaymentMethodSummary[];
}
