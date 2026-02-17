export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

type Provider = 'fitbit' | 'oura' | 'whoop';

export async function generateStaticParams() {
  return [
    { provider: 'fitbit' },
    { provider: 'oura' },
    { provider: 'whoop' },
  ];
}

function base64UrlEncode(input: Buffer | string) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function getConfig(provider: Provider) {
  if (provider === 'fitbit') {
    return {
      clientId: process.env.FITBIT_CLIENT_ID,
      clientSecret: process.env.FITBIT_CLIENT_SECRET,
      authBase: 'https://www.fitbit.com/oauth2/authorize',
      scope: 'activity heartrate profile sleep weight',
    };
  }

  if (provider === 'oura') {
    return {
      clientId: process.env.OURA_CLIENT_ID,
      clientSecret: process.env.OURA_CLIENT_SECRET,
      authBase: 'https://cloud.ouraring.com/oauth/authorize',
      scope: 'email personal daily',
    };
  }

  return {
    clientId: process.env.WHOOP_CLIENT_ID,
    clientSecret: process.env.WHOOP_CLIENT_SECRET,
    authBase: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    scope: 'read:profile read:recovery read:sleep read:workout offline',
  };
}

function buildAuthUrl(provider: Provider, req: NextRequest, state: string, codeVerifier: string) {
  const config = getConfig(provider);
  if (!config.clientId || !config.clientSecret) return null;

  const redirectUri = `${req.nextUrl.origin}/api/wearables/${provider}/callback`;
  const codeChallenge = base64UrlEncode(crypto.createHash('sha256').update(codeVerifier).digest());

  const url = new URL(config.authBase);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  return url.toString();
}

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;

  if (!['fitbit', 'oura', 'whoop'].includes(provider)) {
    return NextResponse.json({ error: 'Unsupported wearable provider.' }, { status: 400 });
  }

  const state = crypto.randomBytes(24).toString('hex');
  const codeVerifier = base64UrlEncode(crypto.randomBytes(48));
  const authUrl = buildAuthUrl(provider, req, state, codeVerifier);

  if (!authUrl) {
    return NextResponse.json(
      { error: `${provider.toUpperCase()} integration is not configured in environment variables.` },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ authUrl });

  response.cookies.set(`wearable_oauth_state_${provider}`, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  response.cookies.set(`wearable_oauth_code_verifier_${provider}`, codeVerifier, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}
