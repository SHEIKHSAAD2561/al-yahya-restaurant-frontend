import { backendFetch } from '@/core/api/backend-fetch-client';
import type {
  Promotion,
  PromotionDiscountType,
  PromotionListPage,
  PromotionStatus,
  PromotionTargetType,
  PromotionType,
} from '../types/promotion';

export interface PromotionsQuery {
  search?: string;
  status?: PromotionStatus;
  page?: number;
  pageSize?: number;
}

export interface PromotionInput {
  name: string;
  type: PromotionType;
  isActive?: boolean;
  startAt: string;
  endAt?: string | null;
  applyToAllLocations: boolean;
  locationIds?: string[];
  targetType?: PromotionTargetType;
  targetVariantIds?: string[];
  targetCategoryIds?: string[];
  discountType?: PromotionDiscountType;
  discountValue?: number;
  buyQuantity?: number;
  buyTargetType?: PromotionTargetType;
  buyVariantIds?: string[];
  buyCategoryIds?: string[];
  getQuantity?: number;
  getTargetType?: PromotionTargetType;
  getVariantIds?: string[];
  getCategoryIds?: string[];
  getDiscountType?: PromotionDiscountType;
  getDiscountValue?: number;
}

export const promotionsApi = {
  list: (query: PromotionsQuery = {}) =>
    backendFetch<PromotionListPage>('promotions', {
      searchParams: {
        search: query.search || undefined,
        status: query.status,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<Promotion>(`promotions/${id}`),
  create: (input: PromotionInput) => backendFetch<Promotion>('promotions', { method: 'POST', body: input }),
  update: (id: string, input: PromotionInput) =>
    backendFetch<Promotion>(`promotions/${id}`, { method: 'PATCH', body: input }),
  updateStatus: (id: string, isActive: boolean) =>
    backendFetch<Promotion>(`promotions/${id}/status`, { method: 'PATCH', body: { isActive } }),
  remove: (id: string) => backendFetch<void>(`promotions/${id}`, { method: 'DELETE' }),
};
