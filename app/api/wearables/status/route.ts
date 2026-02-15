import { NextResponse } from 'next/server';

type Provider = 'fitbit' | 'oura' | 'whoop';

function providerStatus(provider: Provider) {
  if (provider === 'fitbit') {
    return {
      configured: Boolean(process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET),
      missing: [
        !process.env.FITBIT_CLIENT_ID ? 'FITBIT_CLIENT_ID' : null,
        !process.env.FITBIT_CLIENT_SECRET ? 'FITBIT_CLIENT_SECRET' : null,
      ].filter(Boolean),
    };
  }

  if (provider === 'oura') {
    return {
      configured: Boolean(process.env.OURA_CLIENT_ID && process.env.OURA_CLIENT_SECRET),
      missing: [
        !process.env.OURA_CLIENT_ID ? 'OURA_CLIENT_ID' : null,
        !process.env.OURA_CLIENT_SECRET ? 'OURA_CLIENT_SECRET' : null,
      ].filter(Boolean),
    };
  }

  return {
    configured: Boolean(process.env.WHOOP_CLIENT_ID && process.env.WHOOP_CLIENT_SECRET),
    missing: [
      !process.env.WHOOP_CLIENT_ID ? 'WHOOP_CLIENT_ID' : null,
      !process.env.WHOOP_CLIENT_SECRET ? 'WHOOP_CLIENT_SECRET' : null,
    ].filter(Boolean),
  };
}

export async function GET() {
  const status = {
    fitbit: providerStatus('fitbit'),
    oura: providerStatus('oura'),
    whoop: providerStatus('whoop'),
    apple_health: {
      configured: true,
      missing: [],
      mode: 'import_bridge',
    },
    samsung_health: {
      configured: true,
      missing: [],
      mode: 'import_bridge',
    },
  };

  const configuredCount = Object.values(status).filter((item) => item.configured).length;

  return NextResponse.json({
    status,
    configuredCount,
    total: Object.keys(status).length,
  });
}
