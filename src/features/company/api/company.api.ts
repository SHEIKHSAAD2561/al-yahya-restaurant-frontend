import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Company, CompanyBranding } from '../types/company';

export interface UpdateCompanyInput {
  name?: string;
  vatNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  businessType?: string;
  address?: string;
  commercialRegister?: string;
}

export const companyApi = {
  get: () => backendFetch<Company>('company'),
  /** Public branding projection — safe for a cashier with no `settings.*`
   * permission at all, e.g. to print a receipt. */
  getBranding: () => backendFetch<CompanyBranding>('company/branding'),
  update: (input: UpdateCompanyInput) =>
    backendFetch<Company>('company', { method: 'PATCH', body: input }),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return backendFetch<Company>('company/logo', { method: 'POST', body: formData });
  },
};
