import { NextRequest, NextResponse } from 'next/server';
import { createSignupVerification, SignupVerificationPayload } from '@/lib/signupVerificationStore';
import { deliverEmail, getEmailTransportState } from '@/lib/emailTransport';

type VerificationRequestPayload = SignupVerificationPayload & {
  origin?: string;
};

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

    if (payload.provider === 'password' && !payload.password) {
      return NextResponse.json({ success: false, message: 'Password is required for password signup.' }, { status: 400 });
    }

    if (!isValidEmail(payload.email)) {
      return NextResponse.json({ success: false, message: 'Invalid email address.' }, { status: 400 });
    }

    const emailState = getEmailTransportState();
    if (!emailState.ready) {
      return NextResponse.json(
        { success: false, message: 'SMTP is not fully configured.', missingConfig: emailState.missing },
        { status: 503 }
      );
    }

    const { token, expiresAt } = createSignupVerification({
      fullName: payload.fullName,
      email: payload.email.trim().toLowerCase(),
      userType: payload.userType,
      plan: payload.plan,
      planType: payload.planType,
      businessName: payload.businessName,
      employerCode: payload.employerCode,
      contentNiche: payload.contentNiche,
      provider: payload.provider,
      password: payload.password,
      deviceId: payload.deviceId,
      requestedAt: payload.requestedAt || new Date().toISOString(),
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
      expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send verification email.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
