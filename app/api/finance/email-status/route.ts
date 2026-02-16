import { NextResponse } from 'next/server';
import { getEmailTransportState } from '@/lib/emailTransport';

export async function GET() {
  const emailState = getEmailTransportState();
  const configured = emailState.mode === 'console' || emailState.missing.length === 0;

  return NextResponse.json({
    mode: emailState.mode,
    ready: emailState.ready,
    configured,
    missing: emailState.missing,
    fallback: emailState.fallback,
    fallbackReason: emailState.fallbackReason,
  });
}
