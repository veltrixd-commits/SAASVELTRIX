import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type WelcomeRequestPayload = {
  fullName?: string;
  email?: string;
  userType?: 'business' | 'employee' | 'creator' | 'individual';
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getMissingEmailConfig(): string[] {
  return [
    !process.env.SMTP_HOST ? 'SMTP_HOST' : null,
    !process.env.SMTP_PORT ? 'SMTP_PORT' : null,
    !process.env.SMTP_USER ? 'SMTP_USER' : null,
    !process.env.SMTP_PASSWORD ? 'SMTP_PASSWORD' : null,
    !process.env.SMTP_FROM ? 'SMTP_FROM' : null,
  ].filter(Boolean) as string[];
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

    const missingConfig = getMissingEmailConfig();
    if (missingConfig.length > 0) {
      return NextResponse.json(
        { success: false, message: 'SMTP is not fully configured.', missingConfig },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const summary = getWelcomeSummary(payload.userType);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
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
