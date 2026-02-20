export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SignupVerificationStatus, TenantType, UserRole } from '@prisma/client';
import { getPrisma } from '@/lib/server/prisma';
import { deliverEmail } from '@/lib/emailTransport';
import { generateToken, hashPassword } from '@/lib/server-auth';

type CompleteVerificationRequest = {
  token?: string;
};

const PLAN_LIMITS: Record<string, { maxUsers: number; maxLeads: number; maxAutomations: number }> = {
  free_trial: { maxUsers: 5, maxLeads: 1000, maxAutomations: 10 },
  professional: { maxUsers: 25, maxLeads: 10000, maxAutomations: 100 },
  scale: { maxUsers: 100, maxLeads: 100000, maxAutomations: 500 },
  enterprise: { maxUsers: 250, maxLeads: 500000, maxAutomations: 2000 },
};

const AUTH_COOKIE_NAME = 'veltrix_session';
const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 48);

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
  if (userType === 'creator') return UserRole.ADMIN;
  return UserRole.ADMIN;
}

function resolvePlanLimits(planType: string) {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free_trial;
}

function resolveNextRoute(userType: string) {
  return userType === 'employee' ? '/waiting-approval' : '/onboarding/business-details';
}

async function generateTenantSlug(tx: Prisma.TransactionClient, preferred: string) {
  const base = slugify(preferred);
  let attempt = 0;

  while (attempt < 25) {
    const slugCandidate = attempt === 0 ? base : `${base}-${attempt}`;
    const existing = await tx.tenant.findUnique({ where: { slug: slugCandidate } });
    if (!existing) {
      return slugCandidate;
    }
    attempt += 1;
  }

  return `${base}-${Date.now()}`;
}

function randomPassword() {
  return randomBytes(16).toString('base64url');
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CompleteVerificationRequest;
    const token = payload?.token?.trim();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Missing verification token.' }, { status: 400 });
    }

    const prisma = await getPrisma();

    const verification = await prisma.signupVerification.findUnique({ where: { token } });

    if (!verification || verification.status !== SignupVerificationStatus.PENDING) {
      return NextResponse.json(
        { success: false, message: 'This verification link is invalid or has already been used.' },
        { status: 400 }
      );
    }

    if (verification.expiresAt < new Date()) {
      await prisma.signupVerification.update({
        where: { id: verification.id },
        data: { status: SignupVerificationStatus.EXPIRED, consumedAt: new Date() },
      });

      return NextResponse.json(
        { success: false, message: 'This verification link has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: verification.email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const planLimits = resolvePlanLimits(verification.planType);

    const result = await prisma.$transaction(async (tx) => {
      const slug = await generateTenantSlug(tx, verification.businessName || verification.fullName);

      const tenant = await tx.tenant.create({
        data: {
          name: verification.businessName || `${verification.fullName}'s Workspace`,
          slug,
          type: resolveTenantType(verification.userType),
          plan: verification.planType,
          maxUsers: planLimits.maxUsers,
          maxLeads: planLimits.maxLeads,
          maxAutomations: planLimits.maxAutomations,
        },
      });

      const { firstName, lastName } = splitName(verification.fullName);
      const passwordHash = verification.passwordHash || (await hashPassword(randomPassword()));

      const user = await tx.user.create({
        data: {
          email: verification.email,
          password: passwordHash,
          firstName,
          lastName,
          role: resolveUserRole(verification.userType),
          tenantId: tenant.id,
        },
      });

      await tx.signupVerification.update({
        where: { id: verification.id },
        data: {
          status: SignupVerificationStatus.VERIFIED,
          consumedAt: new Date(),
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    const jwt = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      tenantId: result.user.tenantId,
    });

    const nextRoute = resolveNextRoute(verification.userType);

    try {
      await deliverEmail({
        from: process.env.SMTP_FROM || 'UniLife <noreply@unilife.local>',
        to: verification.email,
        subject: 'Welcome to UniLife!',
        text: `Hi ${verification.fullName},\n\nYour workspace is ready. Visit your dashboard to get started: ${DEFAULT_APP_URL}.`,
      });
    } catch (welcomeError) {
      console.warn('Failed to send welcome email:', welcomeError);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signup complete.',
      token: jwt,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        userType: verification.userType,
        plan: verification.plan,
        planType: verification.planType,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        plan: result.tenant.plan,
        maxUsers: result.tenant.maxUsers,
        maxLeads: result.tenant.maxLeads,
        maxAutomations: result.tenant.maxAutomations,
      },
      nextRoute,
    });

    response.cookies.set(AUTH_COOKIE_NAME, jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Complete signup verification error:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify signup token.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
