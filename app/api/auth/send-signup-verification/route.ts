export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { SignupVerificationStatus } from '@prisma/client';
import { getPrisma } from '@/lib/server/prisma';
import { hashPassword } from '@/lib/server-auth';
import { deliverEmail, getEmailTransportState } from '@/lib/emailTransport';

type VerificationRequestPayload = {
  fullName: string;
  email: string;
  userType: 'business' | 'employee' | 'creator' | 'individual';
  plan: string;
  planType: string;
  businessName?: string;
  employerCode?: string;
  contentNiche?: string;
  provider: 'password' | 'google' | 'apple';
  password?: string;
  deviceId: string;
  requestedAt?: string;
  rememberDevice?: boolean;
  origin?: string;
};

const TOKEN_TTL_MS = Number(process.env.SIGNUP_VERIFICATION_TTL_MS || 30 * 60 * 1000);

function normalizePlanType(value?: string): 'free_trial' | 'professional' | 'scale' | 'enterprise' {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'professional') return 'professional';
  if (normalized === 'scale') return 'scale';
  if (normalized === 'enterprise') return 'enterprise';
  return 'free_trial';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAppOrigin(origin?: string): string {
  if (origin && /^https?:\/\//i.test(origin)) return origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return 'http://localhost:3000';
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as VerificationRequestPayload;

    if (!payload?.email || !payload?.fullName || !payload?.userType || !payload?.provider || !payload?.plan) {
      return NextResponse.json({ success: false, message: 'Missing required signup fields.' }, { status: 400 });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedPlanType = normalizePlanType(payload.planType);

    if (payload.provider === 'password' && !payload.password) {
      return NextResponse.json({ success: false, message: 'Password is required for password signup.' }, { status: 400 });
    }

    if (!isValidEmail(payload.email)) {
      return NextResponse.json({ success: false, message: 'Invalid email address.' }, { status: 400 });
    }

    if (!payload.deviceId) {
      return NextResponse.json({ success: false, message: 'Device fingerprint missing from signup request.' }, { status: 400 });
    }

    const prisma = await getPrisma();

    const emailState = getEmailTransportState();
    if (!emailState.ready) {
      return NextResponse.json(
        { success: false, message: 'SMTP is not fully configured.', missingConfig: emailState.missing },
        { status: 503 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const token = randomUUID();
    const passwordHash =
      payload.provider === 'password' && payload.password ? await hashPassword(payload.password) : null;

    await prisma.signupVerification.deleteMany({
      where: {
        email: normalizedEmail,
        status: SignupVerificationStatus.PENDING,
      },
    });

    await prisma.signupVerification.create({
      data: {
        token,
        email: normalizedEmail,
        fullName: payload.fullName.trim(),
        userType: payload.userType,
        plan: payload.plan,
        planType: normalizedPlanType,
        provider: payload.provider,
        passwordHash,
        businessName: payload.businessName,
        employerCode: payload.employerCode,
        contentNiche: payload.contentNiche,
        deviceId: payload.deviceId,
        rememberDevice: Boolean(payload.rememberDevice),
        metadata: {
          requestedAt: payload.requestedAt || new Date().toISOString(),
          origin: payload.origin,
        },
        expiresAt,
      },
    });

    const baseUrl = getAppOrigin(payload.origin);
    const verificationUrl = `${baseUrl}/verify-signup?token=${encodeURIComponent(token)}`;

    await deliverEmail({
      from: process.env.SMTP_FROM || 'UniLife <noreply@unilife.local>',
      to: payload.email,
      subject: 'Verify your email to complete your UniLife signup',
      text: [
        `Hi ${payload.fullName},`,
        '',
        'Thanks for signing up for UniLife.',
        'Please verify your email address using the link below to complete your signup:',
        verificationUrl,
        '',
        'This link expires in 30 minutes and can be used once.',
        '',
        'If you did not request this, please ignore this email.',
      ].join('\n'),
      html: `
        <p>Hi ${payload.fullName},</p>
        <p>Thanks for signing up for UniLife.</p>
        <p>Please verify your email address using the button below to complete your signup:</p>
        <p><a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Verify Email</a></p>
        <p>Or copy and paste this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 30 minutes and can be used once.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent.',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send verification email.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
