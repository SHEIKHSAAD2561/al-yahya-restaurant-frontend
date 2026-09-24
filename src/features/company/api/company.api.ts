import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Company } from '../types/company';

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
  update: (input: UpdateCompanyInput) =>
    backendFetch<Company>('company', { method: 'PATCH', body: input }),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return backendFetch<Company>('company/logo', { method: 'POST', body: formData });
  },
};
