/** Mirrors al-yahya-restaurant-backend's promotion.enums.ts. */
export const PROMOTION_TYPES = {
  DISCOUNT_OFF_PRODUCTS: 'DISCOUNT_OFF_PRODUCTS',
  BUY_X_GET_Y: 'BUY_X_GET_Y',
} as const;
export type PromotionType = (typeof PROMOTION_TYPES)[keyof typeof PROMOTION_TYPES];

export const PROMOTION_TARGET_TYPES = {
  ALL_PRODUCTS: 'ALL_PRODUCTS',
  SPECIFIC_PRODUCTS: 'SPECIFIC_PRODUCTS',
  CATEGORIES: 'CATEGORIES',
} as const;
export type PromotionTargetType = (typeof PROMOTION_TARGET_TYPES)[keyof typeof PROMOTION_TARGET_TYPES];

export const PROMOTION_DISCOUNT_TYPES = { PERCENT: 'PERCENT', AMOUNT: 'AMOUNT' } as const;
export type PromotionDiscountType = (typeof PROMOTION_DISCOUNT_TYPES)[keyof typeof PROMOTION_DISCOUNT_TYPES];

export const PROMOTION_STATUSES = ['SCHEDULED', 'ACTIVE', 'EXPIRED', 'INACTIVE'] as const;
export type PromotionStatus = (typeof PROMOTION_STATUSES)[number];

export interface PromotionListItem {
  id: string;
  name: string;
  type: PromotionType;
  status: PromotionStatus;
  startAt: string;
  endAt: string | null;
}

export interface PromotionListPage {
  items: PromotionListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  status: PromotionStatus;
  isActive: boolean;
  startAt: string;
  endAt: string | null;
  applyToAllLocations: boolean;
  locationIds: string[] | null;
  // Discount off Products
  targetType: PromotionTargetType | null;
  targetVariantIds: string[] | null;
  targetCategoryIds: string[] | null;
  discountType: PromotionDiscountType | null;
  discountValue: number | null;
  // Buy X Get Y
  buyQuantity: number | null;
  buyTargetType: PromotionTargetType | null;
  buyVariantIds: string[] | null;
  buyCategoryIds: string[] | null;
  getQuantity: number | null;
  getTargetType: PromotionTargetType | null;
  getVariantIds: string[] | null;
  getCategoryIds: string[] | null;
  getDiscountType: PromotionDiscountType | null;
  getDiscountValue: number | null;
  createdAt: string;
  updatedAt: string;
}
