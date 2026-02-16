import { NextRequest, NextResponse } from 'next/server';
import { deliverEmail, getEmailTransportState } from '@/lib/emailTransport';

type SendDocumentPayload = {
  to: string;
  subject: string;
  body: string;
  documentType: 'invoice' | 'quotation';
  documentNumber: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SendDocumentPayload;

    if (!payload?.to || !payload?.subject || !payload?.body || !payload?.documentType || !payload?.documentNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields.',
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(payload.to)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid recipient email address.',
        },
        { status: 400 }
      );
    }

    const emailState = getEmailTransportState();
    if (!emailState.ready) {
      return NextResponse.json(
        {
          success: false,
          message: 'SMTP is not fully configured.',
          missingConfig: emailState.missing,
        },
        { status: 503 }
      );
    }

    await deliverEmail({
      from: process.env.SMTP_FROM || 'UniLife <noreply@unilife.local>',
      to: payload.to,
      subject: payload.subject,
      text: payload.body,
    });

    return NextResponse.json({
      success: true,
      message: `${payload.documentType} ${payload.documentNumber} sent successfully.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send document email.';
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
