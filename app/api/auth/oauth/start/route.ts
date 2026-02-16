import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createPkcePair, getGoogleAuthorizationUrl } from '@/lib/oauth/google';
import { getAppleAuthorizationUrl } from '@/lib/oauth/apple';
import { createOAuthStateRecord } from '@/lib/oauth/stateStore';
import type { OAuthStartRequest, OAuthUserContext } from '@/lib/oauth/types';

function validateSignupContext(context?: OAuthUserContext) {
  if (!context) {
    throw new Error('Signup context is required for social signup.');
  }

  if (!context.fullName?.trim()) {
    throw new Error('Full name is required before continuing with social signup.');
  }

  if (!context.email?.trim()) {
    throw new Error('Email is required before continuing with social signup.');
  }

  if (!context.userType) {
    throw new Error('Select your user type before continuing with social signup.');
  }

  if (!context.plan || !context.planType) {
    throw new Error('Plan information is missing. Re-select your plan and try again.');
  }

  return {
    ...context,
    email: context.email.trim().toLowerCase(),
    fullName: context.fullName.trim(),
  };
}

function generateNonce() {
  return randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as OAuthStartRequest;

    if (!payload?.provider || (payload.provider !== 'google' && payload.provider !== 'apple')) {
      return NextResponse.json({ success: false, message: 'Unsupported provider.' }, { status: 400 });
    }

    if (!payload?.mode || (payload.mode !== 'login' && payload.mode !== 'signup')) {
      return NextResponse.json({ success: false, message: 'Invalid OAuth mode.' }, { status: 400 });
    }

    const userContext = payload.mode === 'signup' ? validateSignupContext(payload.userContext) : payload.userContext;

    if (payload.mode === 'signup' && userContext && !userContext.requestedAt) {
      userContext.requestedAt = new Date().toISOString();
    }

    if (payload.mode === 'login' && !payload.deviceId) {
      payload.deviceId = randomBytes(8).toString('hex');
    }

    let authorizationUrl = '';
    let codeVerifier: string | undefined;
    let nonce: string | undefined;
    let codeChallenge: string | undefined;

    if (payload.provider === 'google') {
      const pkce = createPkcePair();
      codeVerifier = pkce.codeVerifier;
      codeChallenge = pkce.codeChallenge;
    } else {
      nonce = generateNonce();
    }

    const stateRecord = createOAuthStateRecord({
      provider: payload.provider,
      mode: payload.mode,
      deviceId: payload.deviceId,
      rememberDevice: payload.rememberDevice,
      redirectTo: payload.redirectTo,
      userContext,
      codeVerifier,
      nonce,
    });

    if (payload.provider === 'google') {
      authorizationUrl = getGoogleAuthorizationUrl({
        state: stateRecord.state,
        codeChallenge: codeChallenge!,
      });
    } else {
      authorizationUrl = getAppleAuthorizationUrl({
        state: stateRecord.state,
        nonce: nonce!,
      });
    }

    return NextResponse.json({ success: true, authorizationUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start OAuth flow.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
