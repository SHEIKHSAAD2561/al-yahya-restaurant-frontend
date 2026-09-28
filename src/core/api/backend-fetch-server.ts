import 'server-only';
import { env } from '@/core/config/env';

export interface BackendResponse {
  status: number;
  body: unknown;
  /** The backend's real Content-Type — 'application/json' unless the route
   * returns a file (e.g. a CSV export). The catch-all proxy uses this to
   * decide whether to JSON-wrap `body` or pass it through as-is. */
  contentType: string;
  /** Forwarded only for a file download (Content-Disposition), so the
   * browser's Save dialog gets the backend's filename. */
  contentDisposition?: string;
}

interface CallBackendOptions {
  method?: string;
  /** A plain object gets JSON-encoded; a `FormData` (file uploads) is passed
   * through as-is — `fetch` sets its own multipart boundary header for that
   * case, so `Content-Type` must NOT be set manually when it's FormData. */
  body?: unknown;
  accessToken?: string;
  locale?: string;
}

/** Used only from inside Route Handlers (`src/app/api/**`) — the one place
 * allowed to talk to the NestJS backend directly, server-to-server. Feature
 * code never imports this; it goes through `backend-fetch-client.ts` instead. */
export async function callBackend(
  path: string,
  { method = 'GET', body, accessToken, locale }: CallBackendOptions = {},
): Promise<BackendResponse> {
  const isFormData = body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${env.backendUrl}/${path}`, {
      method,
      headers: {
        ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(locale ? { 'x-lang': locale } : {}),
      },
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    // Backend unreachable (down, wrong BACKEND_URL, network blip) — degrade to
    // a normal error response instead of crashing the calling Route Handler.
    return {
      status: 503,
      body: { message: 'The server is temporarily unavailable.' },
      contentType: 'application/json',
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const responseBody = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  return {
    status: response.status,
    body: responseBody,
    contentType: isJson ? 'application/json' : contentType || 'text/plain',
    contentDisposition: response.headers.get('content-disposition') ?? undefined,
  };
}
