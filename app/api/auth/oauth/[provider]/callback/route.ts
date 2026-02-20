export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCodeForTokens, fetchGoogleProfile } from '@/lib/oauth/google';
import { exchangeAppleCodeForTokens, parseAppleIdentity } from '@/lib/oauth/apple';
import { consumeOAuthState } from '@/lib/oauth/stateStore';
import { createOAuthResultRecord } from '@/lib/oauth/resultStore';
import type { OAuthProvider } from '@/lib/oauth/types';

type RouteContext = {
  params: Promise<{ provider: string }>;
};

function getBaseUrl(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return request.nextUrl.origin;
}

async function parseCallbackPayload(request: NextRequest) {
  if (request.method === 'POST') {
    const formData = await request.formData();
    return {
      code: String(formData.get('code') || ''),
      state: String(formData.get('state') || ''),
      error: formData.get('error') ? String(formData.get('error')) : undefined,
      errorDescription: formData.get('error_description') ? String(formData.get('error_description')) : undefined,
    };
  }

  const params = request.nextUrl.searchParams;
  return {
    code: params.get('code') || '',
    state: params.get('state') || '',
    error: params.get('error') || undefined,
    errorDescription: params.get('error_description') || undefined,
  };
}

function redirectWithError(request: NextRequest, message: string) {
  const url = new URL('/oauth/complete', getBaseUrl(request));
  url.searchParams.set('error', message);
  return NextResponse.redirect(url);
}

async function handleCallback(request: NextRequest, provider: OAuthProvider) {
  const payload = await parseCallbackPayload(request);

  if (payload.error) {
    const detail = payload.errorDescription ? `${payload.error}: ${payload.errorDescription}` : payload.error;
    return redirectWithError(request, detail);
  }

  if (!payload.code || !payload.state) {
    return redirectWithError(request, 'Invalid OAuth response.');
  }

  const stateRecord = consumeOAuthState(payload.state);
  if (!stateRecord || stateRecord.provider !== provider) {
    return redirectWithError(request, 'OAuth state is invalid or has expired.');
  }

  try {
    if (provider === 'google') {
      if (!stateRecord.codeVerifier) {
        return redirectWithError(request, 'Missing Google PKCE verifier.');
      }

      const tokens = await exchangeGoogleCodeForTokens({ code: payload.code, codeVerifier: stateRecord.codeVerifier });
      const googleProfile = await fetchGoogleProfile(tokens.access_token);

      if (!googleProfile.email) {
        return redirectWithError(request, 'Google account has no email address.');
      }

      const result = createOAuthResultRecord({
        provider,
        mode: stateRecord.mode,
        profile: {
          email: googleProfile.email,
          emailVerified: googleProfile.email_verified,
          fullName: googleProfile.name || stateRecord.userContext?.fullName || null,
          avatar: googleProfile.picture || null,
          providerUserId: googleProfile.sub,
        },
        userContext: stateRecord.userContext,
        deviceId: stateRecord.deviceId,
        rememberDevice: stateRecord.rememberDevice,
        redirectTo: stateRecord.redirectTo,
      });

      const url = new URL('/oauth/complete', getBaseUrl(request));
      url.searchParams.set('token', result.token);
      return NextResponse.redirect(url);
    }

    const tokens = await exchangeAppleCodeForTokens(payload.code);
    const identity = parseAppleIdentity(tokens.id_token);

    if (!identity.email) {
      return redirectWithError(request, 'Apple account did not provide an email address.');
    }

    const result = createOAuthResultRecord({
      provider,
      mode: stateRecord.mode,
      profile: {
        email: identity.email,
        emailVerified: identity.emailVerified,
        fullName: stateRecord.userContext?.fullName || null,
        avatar: null,
        providerUserId: identity.sub,
      },
      userContext: stateRecord.userContext,
      deviceId: stateRecord.deviceId,
      rememberDevice: stateRecord.rememberDevice,
      redirectTo: stateRecord.redirectTo,
    });

    const url = new URL('/oauth/complete', getBaseUrl(request));
    url.searchParams.set('token', result.token);
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth callback failed.';
    return redirectWithError(request, message);
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;
  return handleCallback(request, provider as OAuthProvider);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;
  return handleCallback(request, provider as OAuthProvider);
}
