export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

type Platform = 'tiktok' | 'instagram' | 'facebook' | 'whatsapp' | 'linkedin' | 'twitter';

const SUPPORTED: Platform[] = ['tiktok', 'instagram', 'facebook', 'whatsapp', 'linkedin', 'twitter'];

type RouteContext = {
  params: Promise<{ platform: string }>;
};

export async function generateStaticParams() {
  return SUPPORTED.map(platform => ({ platform }));
}

function jsonToFormData(values: Record<string, string>) {
  const form = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => form.set(key, value));
  return form;
}

function resultHtml(payload: Record<string, any>) {
  const serialized = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>OAuth Complete</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
      .card{background:#111827;border:1px solid #374151;border-radius:12px;padding:24px;max-width:420px;text-align:center}
      .small{opacity:.8;font-size:13px;margin-top:8px}
    </style>
  </head>
  <body>
    <div class="card">
      <h3>Authentication Complete</h3>
      <p class="small">You can close this window now.</p>
    </div>
    <script>
      (function() {
        const payload = ${serialized};
        try {
          if (window.opener) {
            window.opener.postMessage(payload, window.location.origin);
          }
        } catch (e) {}
        setTimeout(() => window.close(), 300);
      })();
    </script>
  </body>
</html>`;
}

function getPlatformConfig(platform: Platform) {
  const facebookClientId = process.env.FACEBOOK_APP_ID;
  const facebookClientSecret = process.env.FACEBOOK_APP_SECRET;

  const map = {
    tiktok: {
      clientId: process.env.TIKTOK_APP_ID,
      clientSecret: process.env.TIKTOK_APP_SECRET,
    },
    instagram: {
      clientId: process.env.INSTAGRAM_APP_ID || facebookClientId,
      clientSecret: process.env.INSTAGRAM_APP_SECRET || facebookClientSecret,
    },
    facebook: {
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    },
    whatsapp: {
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    },
  } as const;

  return map[platform];
}

async function exchangeToken(platform: Platform, req: NextRequest, code: string, codeVerifier: string | undefined) {
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/oauth/${platform}/callback`;
  const config = getPlatformConfig(platform);

  if (!config?.clientId || !config?.clientSecret) {
    throw new Error(`${platform.toUpperCase()} credentials are not configured.`);
  }

  if (platform === 'linkedin') {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: jsonToFormData({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!tokenRes.ok) throw new Error('LinkedIn token exchange failed.');
    return tokenRes.json();
  }

  if (platform === 'facebook' || platform === 'whatsapp' || platform === 'instagram') {
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', config.clientId);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('client_secret', config.clientSecret);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    if (!tokenRes.ok) throw new Error('Facebook/Instagram token exchange failed.');
    return tokenRes.json();
  }

  if (platform === 'tiktok') {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: jsonToFormData({
        client_key: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || '',
      }),
    });

    if (!tokenRes.ok) throw new Error('TikTok token exchange failed.');
    return tokenRes.json();
  }

  if (platform === 'twitter') {
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      },
      body: jsonToFormData({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || '',
      }),
    });

    if (!tokenRes.ok) throw new Error('Twitter token exchange failed.');
    return tokenRes.json();
  }

  throw new Error('Unsupported platform');
}

async function fetchProfile(platform: Platform, accessToken: string) {
  if (platform === 'linkedin') {
    const meRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meRes.ok) {
      return { username: 'LinkedIn User', profileUrl: 'https://www.linkedin.com/feed/' };
    }

    const me = await meRes.json();
    const firstName = me?.localizedFirstName || '';
    const lastName = me?.localizedLastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'LinkedIn User';
    return { username: fullName, profileUrl: 'https://www.linkedin.com/feed/' };
  }

  if (platform === 'facebook' || platform === 'whatsapp') {
    const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`);
    if (!meRes.ok) return { username: 'Facebook Account', profileUrl: 'https://facebook.com' };
    const me = await meRes.json();

    if (platform === 'whatsapp') {
      return { businessName: me?.name || 'WhatsApp Business', phoneNumber: '', verified: true };
    }

    return { username: me?.name || 'Facebook Account', profileUrl: me?.id ? `https://facebook.com/${me.id}` : 'https://facebook.com' };
  }

  if (platform === 'instagram') {
    const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`);
    if (!meRes.ok) return { username: '@instagram', profileUrl: 'https://instagram.com' };
    const me = await meRes.json();
    return {
      username: me?.username ? `@${me.username}` : '@instagram',
      profileUrl: me?.username ? `https://instagram.com/${me.username}` : 'https://instagram.com',
    };
  }

  if (platform === 'tiktok') {
    const profileRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) return { username: '@tiktok_user', profileUrl: 'https://www.tiktok.com' };
    const json = await profileRes.json();
    const displayName = json?.data?.user?.display_name || 'tiktok_user';
    return { username: `@${displayName.replace(/^@/, '')}`, profileUrl: 'https://www.tiktok.com' };
  }

  if (platform === 'twitter') {
    const meRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meRes.ok) return { username: '@x_user', profileUrl: 'https://x.com' };
    const me = await meRes.json();
    const handle = me?.data?.username || 'x_user';
    return { username: `@${handle}`, profileUrl: `https://x.com/${handle}` };
  }

  return {};
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { platform: platformParam } = await context.params;
  const platform = platformParam as Platform;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  if (!SUPPORTED.includes(platform)) {
    return new NextResponse(resultHtml({
      type: 'oauth_result',
      platform,
      success: false,
      error: 'Unsupported OAuth platform',
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (error) {
    return new NextResponse(resultHtml({
      type: 'oauth_result',
      platform,
      success: false,
      error,
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const expectedState = req.cookies.get(`oauth_state_${platform}`)?.value;
  const codeVerifier = req.cookies.get(`oauth_code_verifier_${platform}`)?.value;

  if (!state || !expectedState || state !== expectedState) {
    return new NextResponse(resultHtml({
      type: 'oauth_result',
      platform,
      success: false,
      error: 'Invalid OAuth state. Please try again.',
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (!code) {
    return new NextResponse(resultHtml({
      type: 'oauth_result',
      platform,
      success: false,
      error: 'Missing authorization code.',
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  try {
    const tokenPayload = await exchangeToken(platform, req, code, codeVerifier);
    const accessToken = tokenPayload?.access_token || tokenPayload?.data?.access_token;

    if (!accessToken) {
      throw new Error('OAuth token missing from provider response.');
    }

    const profile = await fetchProfile(platform, accessToken);

    const response = new NextResponse(resultHtml({
      type: 'oauth_result',
      platform,
      success: true,
      accountData: {
        connected: true,
        accessToken,
        ...profile,
      },
    }), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    response.cookies.set(`oauth_state_${platform}`, '', {
      maxAge: 0,
      path: '/',
    });
    response.cookies.set(`oauth_code_verifier_${platform}`, '', {
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return new NextResponse(resultHtml({
      type: 'oauth_result',
      platform,
      success: false,
      error: err?.message || 'OAuth callback failed',
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}
