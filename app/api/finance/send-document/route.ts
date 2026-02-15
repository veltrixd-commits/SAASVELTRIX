import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type SendDocumentPayload = {
  to: string;
  subject: string;
  body: string;
  documentType: 'invoice' | 'quotation';
  documentNumber: string;
};

function getMissingEmailConfig(): string[] {
  return [
    !process.env.SMTP_HOST ? 'SMTP_HOST' : null,
    !process.env.SMTP_PORT ? 'SMTP_PORT' : null,
    !process.env.SMTP_USER ? 'SMTP_USER' : null,
    !process.env.SMTP_PASSWORD ? 'SMTP_PASSWORD' : null,
    !process.env.SMTP_FROM ? 'SMTP_FROM' : null,
  ].filter(Boolean) as string[];
}

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

    const missingConfig = getMissingEmailConfig();
    if (missingConfig.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'SMTP is not fully configured.',
          missingConfig,
        },
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

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
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
