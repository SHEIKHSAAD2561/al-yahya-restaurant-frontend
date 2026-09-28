export interface SaleSettings {
  id: string;
  allowSalesman: boolean;
  allowQuotation: boolean;
  activateKitchenTicket: boolean;
  sellWhenQuantityZeroOrBelow: boolean;
  sellBelowCost: boolean;
  taxableInvoiceB2b: boolean;
  numberDialog: boolean;
  enableWhatsappMessages: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SaleSettingsInput = Omit<SaleSettings, 'id' | 'createdAt' | 'updatedAt'>;
