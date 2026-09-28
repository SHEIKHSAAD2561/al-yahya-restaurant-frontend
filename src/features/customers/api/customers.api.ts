import { backendDownload, backendFetch } from '@/core/api/backend-fetch-client';
import type { Customer, CustomerGender, CustomerListItem, CustomerListPage } from '../types/customer';

export interface CustomersQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerInput {
  name: string;
  code: string;
  phone: string;
  email?: string;
  gender?: CustomerGender;
  birthday?: string;
  vatNumber?: string;
  commercialRegisterNumber?: string;
  nationalId?: string;
  country?: string;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  additionalNumber?: string;
  postalCode?: string;
  notes?: string;
}

export const customersApi = {
  list: (query: CustomersQuery = {}) =>
    backendFetch<CustomerListPage>('customers', {
      searchParams: {
        search: query.search || undefined,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<CustomerListItem>(`customers/${id}`),
  search: (term: string) => backendFetch<Customer[]>('customers/search', { searchParams: { q: term } }),
  receivablesSummary: () =>
    backendFetch<{ totalOutstanding: number }>('customers/receivables-summary'),
  generateCode: () => backendFetch<{ code: string }>('customers/generate-code'),
  create: (input: CustomerInput) => backendFetch<Customer>('customers', { method: 'POST', body: input }),
  quickCreate: (name: string, phone: string) =>
    backendFetch<Customer>('customers/quick', { method: 'POST', body: { name, phone } }),
  update: (id: string, input: Partial<CustomerInput>) =>
    backendFetch<Customer>(`customers/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => backendFetch<void>(`customers/${id}`, { method: 'DELETE' }),
  exportCsv: (query: CustomersQuery = {}) => backendDownload('customers/export', { search: query.search || undefined }),
};
