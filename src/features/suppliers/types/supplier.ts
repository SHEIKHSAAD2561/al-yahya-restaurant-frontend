export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  vatNumber: string | null;
  address: string | null;
  isActive: boolean;
  balance: number;
}

export interface SupplierDetail extends Supplier {
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
