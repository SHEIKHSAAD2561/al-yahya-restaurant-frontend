import 'server-only';
import { callBackend } from '@/core/api/backend-fetch-server';

export interface CompanyBranding {
  name: string | null;
  logoUrl: string | null;
}

/**
 * Backs the sidebar logo and the dynamic favicon — both need to show the
 * saved company logo, including on the pre-login screen, so this hits the
 * backend's public `GET /company/branding` (no permission gate, no cookies)
 * rather than the full authenticated `GET /company` the Settings page uses.
 */
export async function getCompanyBranding(): Promise<CompanyBranding | null> {
  const result = await callBackend('company/branding');
  if (result.status !== 200) return null;
  return result.body as CompanyBranding;
}
