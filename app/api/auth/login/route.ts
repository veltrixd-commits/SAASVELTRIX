export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/server-auth'

const AUTH_COOKIE_NAME = 'veltrix_session'
const FALLBACK_ROUTE = '/dashboard'
const ONE_DAY_SECONDS = 60 * 60 * 24

interface LoginPayload {
  email?: string
  password?: string
  rememberMe?: boolean
  deviceId?: string
  redirectTo?: string
}

const AUTH_ERRORS = [
  'Invalid credentials',
  'Account is disabled',
  'Tenant account is disabled',
]

function sanitizeRedirect(target?: string | null) {
  if (!target || typeof target !== 'string') return undefined
  if (!target.startsWith('/')) return undefined
  if (target.startsWith('//')) return undefined
  return target
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginPayload
    const email = body.email?.trim().toLowerCase()
    const password = body.password?.trim()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const { user, tenant, token } = await loginUser(email, password)
    const rememberMe = Boolean(body.rememberMe)
    const nextRoute = sanitizeRedirect(body.redirectTo) || FALLBACK_ROUTE

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        avatar: user.avatar,
        userType: tenant?.type === 'BUSINESS' ? 'business' : 'agency',
      },
      tenant: tenant
        ? {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            type: tenant.type,
            plan: tenant.plan,
            maxUsers: tenant.maxUsers,
            maxLeads: tenant.maxLeads,
            maxAutomations: tenant.maxAutomations,
          }
        : null,
      nextRoute,
    })

    const cookieOptions: Parameters<typeof response.cookies.set>[2] = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    }

    if (rememberMe) {
      cookieOptions.maxAge = ONE_DAY_SECONDS * 30
    }

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions)

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to log in. Please try again.'
    const isAuthError = AUTH_ERRORS.some((authError) => message.includes(authError))

    return NextResponse.json(
      { success: false, message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
