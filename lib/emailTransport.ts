import nodemailer, { SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// Centralized helpers for sending email with either SMTP or console fallback modes.

export type EmailTransportMode = 'smtp' | 'console';

const REQUIRED_ENV_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'] as const;

export type EmailTransportState = {
  mode: EmailTransportMode;
  missing: string[];
  ready: boolean;
  fallback: boolean;
  fallbackReason?: string;
};

export function getMissingEmailConfig(): string[] {
  return REQUIRED_ENV_VARS.map((key) => ({ key, value: process.env[key as keyof NodeJS.ProcessEnv] }))
    .filter((entry) => !entry.value)
    .map((entry) => entry.key);
}

function resolvePreferredMode(): EmailTransportMode | undefined {
  const explicit = process.env.EMAIL_TRANSPORT_MODE?.toLowerCase();
  if (explicit === 'smtp' || explicit === 'console') {
    return explicit;
  }
  return undefined;
}

export function getEmailTransportState(): EmailTransportState {
  const preferredMode = resolvePreferredMode();
  const missing = getMissingEmailConfig();
  let mode: EmailTransportMode = preferredMode === 'console' ? 'console' : 'smtp';
  let fallback = false;
  let fallbackReason: string | undefined;

  if (mode === 'smtp' && missing.length > 0) {
    if (preferredMode === 'smtp') {
      return {
        mode,
        missing,
        ready: false,
        fallback: false,
      };
    }

    mode = 'console';
    fallback = true;
    fallbackReason = 'Missing SMTP configuration detected. Falling back to console logger.';
  }

  return {
    mode,
    missing,
    ready: true,
    fallback,
    fallbackReason,
  };
}

function createSmtpTransport() {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = typeof process.env.SMTP_SECURE !== 'undefined'
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 12000);
  const allowInvalidCerts = process.env.SMTP_ALLOW_INVALID_CERTS === 'true';

  const baseConfig: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout,
    socketTimeout: connectionTimeout,
  };

  if (allowInvalidCerts) {
    baseConfig.tls = {
      rejectUnauthorized: false,
    };
  }

  return nodemailer.createTransport(baseConfig);
}

export async function deliverEmail(options: SendMailOptions) {
  const state = getEmailTransportState();

  if (state.mode === 'console') {
    console.info('[email-console] Email delivery mocked', {
      to: options.to,
      subject: options.subject,
      fallback: state.fallback,
      reason: state.fallbackReason,
    });
    if (options.text) {
      console.info('[email-console] Email body (text):', String(options.text).slice(0, 1000));
    }
    if (options.html) {
      console.info('[email-console] Email body (html):', String(options.html).slice(0, 1000));
    }
    return { mocked: true };
  }

  const transporter = createSmtpTransport();
  return transporter.sendMail(options);
}
