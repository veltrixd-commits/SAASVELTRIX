export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { randomBytes, randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SignupVerificationStatus, TenantType, UserRole } from '@prisma/client';
import { getPrisma } from '@/lib/server/prisma';
import { generateToken, hashPassword } from '@/lib/server-auth';
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

// ── MVP instant-signup helpers ────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, { maxUsers: number; maxLeads: number; maxAutomations: number }> = {
  free_trial:   { maxUsers: 5,   maxLeads: 1_000,   maxAutomations: 10 },
  professional: { maxUsers: 25,  maxLeads: 10_000,  maxAutomations: 100 },
  scale:        { maxUsers: 100, maxLeads: 100_000, maxAutomations: 500 },
  enterprise:   { maxUsers: 250, maxLeads: 500_000, maxAutomations: 2000 },
};

const AUTH_COOKIE_NAME = 'veltrix_session';

function slugify(value: string): string {
  const slug = value.trim().toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').replace(/-{2,}/g, '-').slice(0, 48);
  return slug || `workspace-${Math.random().toString(36).slice(2, 8)}`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() || 'User';
  const lastName = parts.length > 0 ? parts.join(' ') : 'Account';
  return { firstName, lastName };
}

function resolveTenantType(userType: string): TenantType {
  return userType === 'business' ? TenantType.BUSINESS : TenantType.AGENCY;
}

function resolveUserRole(userType: string): UserRole {
  if (userType === 'business') return UserRole.BUSINESS_OWNER;
  if (userType === 'employee') return UserRole.STAFF;
  return UserRole.ADMIN;
}

function resolvePlanLimits(planType: string) {
  return PLAN_LIMITS[planType] ?? PLAN_LIMITS.free_trial;
}

function resolveNextRoute(userType: string) {
  return userType === 'employee' ? '/waiting-approval' : '/onboarding/business-details';
}

async function generateTenantSlug(tx: Prisma.TransactionClient, preferred: string) {
  const base = slugify(preferred);
  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`;
    const existing = await tx.tenant.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function randomPassword() {
  return randomBytes(16).toString('base64url');
}

export async function POST(request: NextRequest) {
  try {
    // ── Public signup guard ───────────────────────────────────────────────────
    const allowPublicSignup = process.env.ALLOW_PUBLIC_SIGNUP === 'true';
    if (!allowPublicSignup) {
      return NextResponse.json(
        { success: false, message: 'Signups are currently closed. Check back soon or contact us.' },
        { status: 403 }
      );
    }

    // ── Rate limiting: 5 signup attempts per IP per minute ───────────────────
    const ip = getClientIp(request);
    const limit = rateLimit({ key: `signup:${ip}`, maxRequests: 5, windowMs: 60_000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many signup attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

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

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // ── MVP bypass: create user immediately when verification is disabled or in console mode ──
    const requireVerification = (process.env.AUTH_EMAIL_VERIFICATION_REQUIRED ?? 'true') === 'true';
    const isConsole = (process.env.EMAIL_TRANSPORT_MODE ?? 'smtp') === 'console';

    if (!requireVerification || isConsole) {
      const passwordHash =
        payload.provider === 'password' && payload.password
          ? await hashPassword(payload.password)
          : await hashPassword(randomPassword());

      const planLimits = resolvePlanLimits(normalizedPlanType);

      const result = await prisma.$transaction(async (tx) => {
        const slug = await generateTenantSlug(tx, payload.businessName || payload.fullName);
        const tenant = await tx.tenant.create({
          data: {
            name: payload.businessName || `${payload.fullName}'s Workspace`,
            slug,
            type: resolveTenantType(payload.userType),
            plan: normalizedPlanType,
            maxUsers: planLimits.maxUsers,
            maxLeads: planLimits.maxLeads,
            maxAutomations: planLimits.maxAutomations,
          },
        });
        const { firstName, lastName } = splitName(payload.fullName.trim());
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            password: passwordHash,
            firstName,
            lastName,
            role: resolveUserRole(payload.userType),
            tenantId: tenant.id,
          },
        });
        return { tenant, user };
      });

      // ── Seed demo data for new tenant (non-blocking) ────────────────────────
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      if (isDemoMode) {
        try {
          const prismaForSeed = await getPrisma();
          await prismaForSeed.$transaction((tx) =>
            seedDemoData(tx, result.tenant.id, result.user.id)
          );
        } catch (seedErr) {
          console.warn('[demo-seed] Seed failed (non-fatal):', seedErr);
        }
      }

      const jwt = generateToken({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.user.tenantId,
      });

      const nextRoute = resolveNextRoute(payload.userType);

      const mvpResponse = NextResponse.json({
        success: true,
        message: 'Account created.',
        token: jwt,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          userType: payload.userType,
          plan: payload.plan,
          planType: normalizedPlanType,
        },
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          type: result.tenant.type,
          plan: result.tenant.plan,
          maxUsers: result.tenant.maxUsers,
          maxLeads: result.tenant.maxLeads,
          maxAutomations: result.tenant.maxAutomations,
        },
        nextRoute,
      });

      mvpResponse.cookies.set(AUTH_COOKIE_NAME, jwt, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return mvpResponse;
    }

    // ── Standard verification flow ────────────────────────────────────────────
    const emailState = getEmailTransportState();
    if (!emailState.ready) {
      return NextResponse.json(
        { success: false, message: 'SMTP is not fully configured.', missingConfig: emailState.missing },
        { status: 503 }
      );
    }

    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const token = randomUUID();
    const passwordHash =
      payload.provider === 'password' && payload.password ? await hashPassword(payload.password) : null;

    await prisma.signupVerification.deleteMany({
      where: { email: normalizedEmail, status: SignupVerificationStatus.PENDING },
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

    console.log('[email-console] verificationUrl:', verificationUrl);

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
