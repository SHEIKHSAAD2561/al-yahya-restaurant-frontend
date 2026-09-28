export const RECEIPT_PRINT_LAYOUTS = { THERMAL: 'THERMAL', A4: 'A4' } as const;
export type ReceiptPrintLayout = (typeof RECEIPT_PRINT_LAYOUTS)[keyof typeof RECEIPT_PRINT_LAYOUTS];

export const RECEIPT_LANGUAGES = { EN: 'EN', AR: 'AR' } as const;
export type ReceiptLanguage = (typeof RECEIPT_LANGUAGES)[keyof typeof RECEIPT_LANGUAGES];

export interface ReceiptSettings {
  id: string;
  showLogo: boolean;
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  showCompanyPhone: boolean;
  showVatNumber: boolean;
  showCrNumber: boolean;
  showSku: boolean;
  showBarcode: boolean;
  showQuantity: boolean;
  showUnitPrice: boolean;
  showDiscount: boolean;
  showTaxPerLine: boolean;
  showSubtotal: boolean;
  showTaxSummary: boolean;
  showTotal: boolean;
  showAmountPaid: boolean;
  showChangeDue: boolean;
  showPaymentMethod: boolean;
  showCashierName: boolean;
  showCustomerName: boolean;
  showQrCode: boolean;
  showThankYouNote: boolean;
  salesNote: string | null;
  commentImageUrl: string | null;
  printLayout: ReceiptPrintLayout;
  language: ReceiptLanguage;
  createdAt: string;
  updatedAt: string;
}

export type ReceiptSettingsInput = Omit<
  ReceiptSettings,
  'id' | 'commentImageUrl' | 'createdAt' | 'updatedAt'
>;

/** The Header / Items Content / Footer sections of the Receipt Content
 * Editor — grouped for rendering, not a backend concept. */
export const RECEIPT_TOGGLE_SECTIONS = {
  header: [
    'showLogo',
    'showCompanyName',
    'showCompanyAddress',
    'showCompanyPhone',
    'showVatNumber',
    'showCrNumber',
  ],
  items: ['showSku', 'showBarcode', 'showQuantity', 'showUnitPrice', 'showDiscount', 'showTaxPerLine'],
  footer: [
    'showSubtotal',
    'showTaxSummary',
    'showTotal',
    'showAmountPaid',
    'showChangeDue',
    'showPaymentMethod',
    'showCashierName',
    'showCustomerName',
    'showQrCode',
    'showThankYouNote',
  ],
} as const satisfies Record<string, readonly (keyof ReceiptSettingsInput)[]>;
