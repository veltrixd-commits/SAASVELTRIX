export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

type Provider = 'fitbit' | 'oura' | 'whoop';

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function generateStaticParams() {
  return [
    { provider: 'fitbit' },
    { provider: 'oura' },
    { provider: 'whoop' },
  ];
}

function form(values: Record<string, string>) {
  const payload = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => payload.set(key, value));
  return payload;
}

function html(payload: Record<string, any>) {
  const serialized = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Wearable Linked</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
      .card{background:#111827;border:1px solid #374151;border-radius:12px;padding:24px;max-width:420px;text-align:center}
    </style>
  </head>
  <body>
    <div class="card">
      <h3>Wearable Connection Complete</h3>
      <p>You can close this window.</p>
    </div>
    <script>
      (function() {
        const payload = ${serialized};
        try {
          if (window.opener) {
            window.opener.postMessage(payload, window.location.origin);
          }
        } catch (e) {}
        setTimeout(() => window.close(), 400);
      })();
    </script>
  </body>
</html>`;
}

function getConfig(provider: Provider) {
  if (provider === 'fitbit') {
    return {
      clientId: process.env.FITBIT_CLIENT_ID,
      clientSecret: process.env.FITBIT_CLIENT_SECRET,
      tokenUrl: 'https://api.fitbit.com/oauth2/token',
      profile: async (token: string) => {
        const response = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return { accountName: 'Fitbit User' };
        const json = await response.json();
        return { accountName: json?.user?.displayName || 'Fitbit User' };
      },
    };
  }

  if (provider === 'oura') {
    return {
      clientId: process.env.OURA_CLIENT_ID,
      clientSecret: process.env.OURA_CLIENT_SECRET,
      tokenUrl: 'https://api.ouraring.com/oauth/token',
      profile: async (token: string) => {
        const response = await fetch('https://api.ouraring.com/v2/usercollection/personal_info', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return { accountName: 'Oura User' };
        const json = await response.json();
        const first = json?.data?.[0]?.first_name || '';
        const last = json?.data?.[0]?.last_name || '';
        const fullName = `${first} ${last}`.trim();
        return { accountName: fullName || 'Oura User' };
      },
    };
  }

  return {
    clientId: process.env.WHOOP_CLIENT_ID,
    clientSecret: process.env.WHOOP_CLIENT_SECRET,
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    profile: async (token: string) => {
      const response = await fetch('https://api.prod.whoop.com/developer/v1/user/profile/basic', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return { accountName: 'WHOOP User' };
      const json = await response.json();
      return { accountName: json?.first_name ? `${json.first_name} ${json.last_name || ''}`.trim() : 'WHOOP User' };
    },
  };
}

async function exchange(provider: Provider, req: NextRequest, code: string, codeVerifier: string) {
  const config = getConfig(provider);
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`${provider.toUpperCase()} credentials are missing.`);
  }

  const redirectUri = `${req.nextUrl.origin}/api/wearables/${provider}/callback`;

  if (provider === 'fitbit') {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      },
      body: form({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) throw new Error('Fitbit token exchange failed.');
    return response.json();
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: form({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) throw new Error(`${provider.toUpperCase()} token exchange failed.`);
  return response.json();
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { provider: providerParam } = await context.params;
  const provider = providerParam as Provider;

  if (!['fitbit', 'oura', 'whoop'].includes(provider)) {
    return new NextResponse(
      html({ type: 'wearable_oauth_result', success: false, provider, error: 'Unsupported provider.' }),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const expectedState = req.cookies.get(`wearable_oauth_state_${provider}`)?.value;
  const codeVerifier = req.cookies.get(`wearable_oauth_code_verifier_${provider}`)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return new NextResponse(
      html({ type: 'wearable_oauth_result', success: false, provider, error: 'Invalid OAuth session.' }),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    const tokenPayload = await exchange(provider, req, code, codeVerifier || '');
    const accessToken = tokenPayload?.access_token;
    if (!accessToken) throw new Error('Access token missing from provider response.');

    const profile = await getConfig(provider).profile(accessToken);

    const response = new NextResponse(
      html({
        type: 'wearable_oauth_result',
        success: true,
        provider,
        accountData: {
          provider,
          connectedAt: new Date().toISOString(),
          accessToken,
          refreshToken: tokenPayload?.refresh_token,
          expiresIn: tokenPayload?.expires_in,
          ...profile,
        },
      }),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

    response.cookies.set(`wearable_oauth_state_${provider}`, '', { maxAge: 0, path: '/' });
    response.cookies.set(`wearable_oauth_code_verifier_${provider}`, '', { maxAge: 0, path: '/' });

    return response;
  } catch (error: any) {
    return new NextResponse(
      html({ type: 'wearable_oauth_result', success: false, provider, error: error?.message || 'Callback failed.' }),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
