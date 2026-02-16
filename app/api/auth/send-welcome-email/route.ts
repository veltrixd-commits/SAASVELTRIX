import { NextRequest, NextResponse } from 'next/server';
import { deliverEmail, getEmailTransportState } from '@/lib/emailTransport';

type WelcomeRequestPayload = {
  fullName?: string;
  email?: string;
  userType?: 'business' | 'employee' | 'creator' | 'individual';
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getWelcomeSummary(userType: WelcomeRequestPayload['userType']) {
  if (userType === 'business') return 'Start by setting up your business profile, products, and automation workflows.';
  if (userType === 'employee') return 'Your account is ready and your company admin can now approve your employee access.';
  if (userType === 'creator') return 'Start by setting up your creator niche, workflow automations, and monetization dashboard.';
  return 'Start by completing onboarding and activating your personal productivity workflows.';
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as WelcomeRequestPayload;

    if (!payload?.email || !payload?.fullName) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
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

    const summary = getWelcomeSummary(payload.userType);

    await deliverEmail({
      from: process.env.SMTP_FROM || 'UniLife <noreply@unilife.local>',
      to: payload.email,
      subject: 'Welcome to UniLife 🎉',
      text: [
        `Hi ${payload.fullName},`,
        '',
        'Welcome to UniLife — your all-in-one operating system.',
        summary,
        '',
        'You can now continue onboarding in your dashboard.',
      ].join('\n'),
      html: `
        <p>Hi ${payload.fullName},</p>
        <p>Welcome to <strong>UniLife</strong> — your all-in-one operating system.</p>
        <p>${summary}</p>
        <p>You can now continue onboarding in your dashboard.</p>
      `,
    });

    return NextResponse.json({ success: true, message: 'Welcome email sent.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send welcome email.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
