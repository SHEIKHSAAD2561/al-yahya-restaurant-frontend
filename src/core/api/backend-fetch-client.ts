'use client';

import { ApiError } from './http-error';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  searchParams?: Record<string, string | undefined>;
}

export function getClientLocale(): string {
  return typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en';
}

/**
 * Every feature's `api/*.api.ts` file calls this — never the NestJS origin
 * directly. It always hits the relative `/api/backend/*` catch-all proxy
 * (see src/app/api/backend/[...path]/route.ts), which is the only place that
 * ever sees the httpOnly access-token cookie.
 */
export async function backendFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, searchParams } = options;
  const isFormData = body instanceof FormData;

  const query = searchParams
    ? `?${new URLSearchParams(
        Object.entries(searchParams).filter(([, value]) => value !== undefined) as [
          string,
          string,
        ][],
      ).toString()}`
    : '';

  const response = await fetch(`/api/backend/${path}${query}`, {
    method,
    headers: {
      // Never set Content-Type for FormData — the browser needs to add its
      // own multipart boundary, which a manual header would override.
      ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      'x-locale': getClientLocale(),
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const raw = (data as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? 'Request failed');
    throw new ApiError(message, response.status);
  }

  return data as T;
}

/**
 * For endpoints that return a downloadable file (e.g. a CSV export) instead
 * of JSON — the catch-all proxy passes those straight through with their
 * real content type (see backend-fetch-server.ts / app/api/backend/[...path]).
 * Not built on top of `backendFetch`, since that always parses the body as JSON.
 */
export async function backendDownload(
  path: string,
  searchParams: Record<string, string | undefined> = {},
): Promise<Blob> {
  const query = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => value !== undefined) as [string, string][],
  ).toString();

  const response = await fetch(`/api/backend/${path}${query ? `?${query}` : ''}`, {
    headers: { 'x-locale': getClientLocale() },
  });

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const raw = (data as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? 'Request failed');
    throw new ApiError(message, response.status);
  }

  return response.blob();
}
