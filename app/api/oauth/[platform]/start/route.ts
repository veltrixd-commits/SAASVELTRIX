import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

type Platform = 'tiktok' | 'instagram' | 'facebook' | 'whatsapp' | 'linkedin' | 'twitter';

const SUPPORTED: Platform[] = ['tiktok', 'instagram', 'facebook', 'whatsapp', 'linkedin', 'twitter'];

function base64UrlEncode(input: Buffer | string) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function getPlatformConfig(platform: Platform) {
  const facebookClientId = process.env.FACEBOOK_APP_ID;
  const facebookClientSecret = process.env.FACEBOOK_APP_SECRET;

  const map = {
    tiktok: {
      clientId: process.env.TIKTOK_APP_ID,
      clientSecret: process.env.TIKTOK_APP_SECRET,
      scope: 'user.info.basic video.list',
      authBase: 'https://www.tiktok.com/v2/auth/authorize/',
    },
    instagram: {
      clientId: process.env.INSTAGRAM_APP_ID || facebookClientId,
      clientSecret: process.env.INSTAGRAM_APP_SECRET || facebookClientSecret,
      scope: 'instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,business_management',
      authBase: 'https://www.facebook.com/v18.0/dialog/oauth',
    },
    facebook: {
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
      scope: 'pages_show_list,pages_manage_metadata,pages_read_engagement,pages_messaging',
      authBase: 'https://www.facebook.com/v18.0/dialog/oauth',
    },
    whatsapp: {
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
      scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
      authBase: 'https://www.facebook.com/v18.0/dialog/oauth',
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      scope: 'r_liteprofile r_emailaddress w_member_social',
      authBase: 'https://www.linkedin.com/oauth/v2/authorization',
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      scope: 'tweet.read users.read follows.read offline.access',
      authBase: 'https://twitter.com/i/oauth2/authorize',
    },
  } as const;

  return map[platform];
}

function buildAuthUrl(platform: Platform, req: NextRequest, state: string, codeVerifier: string) {
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/oauth/${platform}/callback`;
  const config = getPlatformConfig(platform);

  if (!config?.clientId) {
    return null;
  }

  if (platform === 'linkedin') {
    const url = new URL(config.authBase);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', config.scope);
    url.searchParams.set('state', state);
    return url.toString();
  }

  if (platform === 'twitter') {
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

  if (platform === 'tiktok') {
    const codeChallenge = base64UrlEncode(crypto.createHash('sha256').update(codeVerifier).digest());
    const url = new URL(config.authBase);
    url.searchParams.set('client_key', config.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', config.scope);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    return url.toString();
  }

  const url = new URL(config.authBase);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  return url.toString();
}

export async function POST(req: NextRequest, { params }: { params: { platform: string } }) {
  const platform = params.platform as Platform;

  if (!SUPPORTED.includes(platform)) {
    return NextResponse.json({ error: 'Unsupported OAuth platform.' }, { status: 400 });
  }

  const state = crypto.randomBytes(24).toString('hex');
  const codeVerifier = base64UrlEncode(crypto.randomBytes(48));
  const authUrl = buildAuthUrl(platform, req, state, codeVerifier);

  if (!authUrl) {
    return NextResponse.json(
      { error: `${platform.toUpperCase()} OAuth is not configured. Add client IDs/secrets in environment variables.` },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ authUrl });

  response.cookies.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  response.cookies.set(`oauth_code_verifier_${platform}`, codeVerifier, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}
