import jwt from 'jsonwebtoken';
import type { OAuthProviderConfig } from './types';

const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';

function normalizePrivateKey(key: string) {
  if (key.includes('BEGIN PRIVATE KEY')) {
    return key.replace(/\\n/g, '\n');
  }
  // Allow setting without PEM markers for convenience
  const cleaned = key.replace(/\s+/g, '');
  return `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
}

type AppleConfig = OAuthProviderConfig & {
  teamId: string;
  keyId: string;
  privateKey: string;
};

export function getAppleConfig(): AppleConfig {
  const clientId = process.env.APPLE_OAUTH_CLIENT_ID || '';
  const teamId = process.env.APPLE_OAUTH_TEAM_ID || '';
  const keyId = process.env.APPLE_OAUTH_KEY_ID || '';
  const privateKey = process.env.APPLE_OAUTH_PRIVATE_KEY ? normalizePrivateKey(process.env.APPLE_OAUTH_PRIVATE_KEY) : '';
  const redirectUri =
    process.env.APPLE_OAUTH_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/oauth/apple/callback`;

  if (!clientId || !teamId || !keyId || !privateKey) {
    throw new Error('Apple OAuth is not fully configured. Set APPLE_OAUTH_CLIENT_ID, APPLE_OAUTH_TEAM_ID, APPLE_OAUTH_KEY_ID, and APPLE_OAUTH_PRIVATE_KEY.');
  }

  return {
    provider: 'apple',
    clientId,
    clientSecret: undefined,
    redirectUri,
    scope: ['name', 'email'],
    teamId,
    keyId,
    privateKey,
  };
}

export function createAppleClientSecret() {
  const config = getAppleConfig();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: config.teamId,
    iat: now,
    exp: now + 60 * 10,
    aud: 'https://appleid.apple.com',
    sub: config.clientId,
  };

  return jwt.sign(payload, config.privateKey, {
    algorithm: 'ES256',
    keyid: config.keyId,
  });
}

export function getAppleAuthorizationUrl(params: { state: string; nonce: string }) {
  const config = getAppleConfig();
  const url = new URL(APPLE_AUTH_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('response_mode', 'form_post');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scope.join(' '));
  url.searchParams.set('state', params.state);
  url.searchParams.set('nonce', params.nonce);
  return url.toString();
}

export async function exchangeAppleCodeForTokens(code: string) {
  const config = getAppleConfig();
  const clientSecret = createAppleClientSecret();

  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('code', code);
  body.set('client_id', config.clientId);
  body.set('client_secret', clientSecret);
  body.set('redirect_uri', config.redirectUri);

  const response = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Apple authorization code.');
  }

  return (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token: string;
    refresh_token?: string;
  };
}

export function parseAppleIdentity(idToken: string) {
  const decoded = jwt.decode(idToken) as
    | {
        sub: string;
        email?: string;
        email_verified?: string | boolean;
      }
    | null;

  if (!decoded) {
    throw new Error('Unable to decode Apple identity token.');
  }

  return {
    sub: decoded.sub,
    email: decoded.email || '',
    emailVerified: decoded.email_verified === true || decoded.email_verified === 'true',
  };
}
