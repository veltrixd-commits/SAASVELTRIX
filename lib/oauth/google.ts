import { createHash, randomBytes } from 'crypto';
import type { OAuthProviderConfig } from './types';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function createPkcePair() {
  const codeVerifier = base64UrlEncode(randomBytes(32));
  const codeChallenge = base64UrlEncode(createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

export function getGoogleConfig(): OAuthProviderConfig {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/oauth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not fully configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.');
  }

  return {
    provider: 'google',
    clientId,
    clientSecret,
    redirectUri,
    scope: ['openid', 'email', 'profile'],
  };
}

export function getGoogleAuthorizationUrl(params: { state: string; codeChallenge: string }) {
  const config = getGoogleConfig();
  const url = new URL(GOOGLE_AUTH_URL);

  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scope.join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('state', params.state);
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  return url.toString();
}

export async function exchangeGoogleCodeForTokens(params: { code: string; codeVerifier: string }) {
  const config = getGoogleConfig();
  const body = new URLSearchParams();
  body.set('client_id', config.clientId);
  body.set('client_secret', config.clientSecret!);
  body.set('code', params.code);
  body.set('code_verifier', params.codeVerifier);
  body.set('grant_type', 'authorization_code');
  body.set('redirect_uri', config.redirectUri);

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code.');
  }

  return (await response.json()) as {
    access_token: string;
    id_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    refresh_token?: string;
  };
}

export async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info.');
  }

  return (await response.json()) as {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };
}
