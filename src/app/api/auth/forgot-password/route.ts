import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/core/api/backend-fetch-server';

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const locale = request.headers.get('x-locale') ?? undefined;

  const result = await callBackend('auth/forgot-password', { method: 'POST', body, locale });
  return NextResponse.json(result.body, { status: result.status });
}
