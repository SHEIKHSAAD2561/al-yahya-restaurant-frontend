import 'server-only';
import { callBackend } from '@/core/api/backend-fetch-server';

export interface DigitalMenuVariant {
  id: string;
  optionValues: string[] | null;
  price: number;
  inStock: boolean;
}

export interface DigitalMenuProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  minPrice: number;
  maxPrice: number;
  variants: DigitalMenuVariant[];
}

export interface DigitalMenuCategory {
  id: string;
  name: string;
  parentId: string | null;
}

export interface DigitalMenuBranding {
  name: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
}

export interface DigitalMenuData {
  branding: DigitalMenuBranding;
  location: { id: string; name: string };
  categories: DigitalMenuCategory[];
  products: DigitalMenuProduct[];
}

export interface DigitalMenuLocation {
  id: string;
  name: string;
}

/**
 * Same narrow, cookie-free exception as `getCompanyBranding()` — a customer
 * scanning a table QR code has no session, so this hits the backend's public
 * `GET /digital-menu` directly (no permission gate, no cookies) rather than
 * going through the authenticated catch-all proxy every other feature uses.
 * Server-rendered (not a client-side TanStack Query fetch like the rest of
 * this app) so the menu paints immediately on a phone's browser with no
 * loading spinner — the one place in this codebase where that trade-off is
 * worth it, since this page is public-facing and has no session to seed.
 */
export async function getDigitalMenu(locale: string, locationId?: string): Promise<DigitalMenuData | null> {
  const path = locationId ? `digital-menu?locationId=${encodeURIComponent(locationId)}` : 'digital-menu';
  const result = await callBackend(path, { locale });
  if (result.status !== 200) return null;
  return result.body as DigitalMenuData;
}

export async function getDigitalMenuLocations(locale: string): Promise<DigitalMenuLocation[]> {
  const result = await callBackend('digital-menu/locations', { locale });
  if (result.status !== 200) return [];
  return result.body as DigitalMenuLocation[];
}
