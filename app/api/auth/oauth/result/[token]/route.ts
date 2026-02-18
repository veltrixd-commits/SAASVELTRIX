import { NextRequest, NextResponse } from 'next/server';
import { consumeOAuthResult } from '@/lib/oauth/resultStore';

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Missing OAuth result token.' }, { status: 400 });
  }

  const record = consumeOAuthResult(token);
  if (!record) {
    return NextResponse.json({ success: false, message: 'OAuth result has expired or was already used.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, result: record });
}
