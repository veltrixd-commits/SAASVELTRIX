import { NextResponse } from 'next/server';

function getMissingEmailConfig(): string[] {
  return [
    !process.env.SMTP_HOST ? 'SMTP_HOST' : null,
    !process.env.SMTP_PORT ? 'SMTP_PORT' : null,
    !process.env.SMTP_USER ? 'SMTP_USER' : null,
    !process.env.SMTP_PASSWORD ? 'SMTP_PASSWORD' : null,
    !process.env.SMTP_FROM ? 'SMTP_FROM' : null,
  ].filter(Boolean) as string[];
}

export async function GET() {
  const missing = getMissingEmailConfig();

  return NextResponse.json({
    configured: missing.length === 0,
    missing,
  });
}
