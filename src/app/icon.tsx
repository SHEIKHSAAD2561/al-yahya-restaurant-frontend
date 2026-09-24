import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCompanyBranding } from '@/core/company/get-company-branding';

// Uncached — must reflect whatever logo is saved right now, including on a
// browser tab that's never been reloaded since the last change.
export const dynamic = 'force-dynamic';
export const contentType = 'image/png';

const DEFAULT_ICON_PATH = join(process.cwd(), 'src/app/default-favicon.ico');

export default async function Icon(): Promise<Response> {
  const branding = await getCompanyBranding();

  if (branding?.logoUrl) {
    try {
      const response = await fetch(branding.logoUrl, { cache: 'no-store' });
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        return new Response(buffer, {
          headers: { 'Content-Type': response.headers.get('content-type') ?? 'image/png' },
        });
      }
    } catch {
      // Fall through to the default icon below.
    }
  }

  const fallback = await readFile(DEFAULT_ICON_PATH);
  return new Response(fallback, { headers: { 'Content-Type': 'image/x-icon' } });
}
