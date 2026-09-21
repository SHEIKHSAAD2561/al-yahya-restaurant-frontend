import 'server-only';
import { env } from '@/core/config/env';

export interface BackendResponse {
  status: number;
  body: unknown;
}

interface CallBackendOptions {
  method?: string;
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
  let response: Response;
  try {
    response = await fetch(`${env.backendUrl}/${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(locale ? { 'x-lang': locale } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch {
    // Backend unreachable (down, wrong BACKEND_URL, network blip) — degrade to
    // a normal error response instead of crashing the calling Route Handler.
    return { status: 503, body: { message: 'The server is temporarily unavailable.' } };
  }

  const contentType = response.headers.get('content-type') ?? '';
  const responseBody = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  return { status: response.status, body: responseBody };
}
