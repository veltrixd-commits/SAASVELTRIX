// Authentication & Authorization System
// JWT-based with role-based access control

import jwt, { type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { db } from './db'

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-super-secure-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
  tenantId: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantId: string
  avatar?: string | null
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign(payload as JwtPayload, JWT_SECRET, options)
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

// Register new user
export async function registerUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  tenantId: string
  role?: UserRole
}) {
  // Check if user exists
  const existing = await db.user.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    throw new Error('User already exists')
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user
  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      tenantId: data.tenantId,
      role: data.role || UserRole.STAFF,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
      avatar: true,
    },
  })

  return user
}

// Login user
export async function loginUser(email: string, password: string) {
  // Find user
  const user = await db.user.findUnique({
    where: { email },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          plan: true,
          maxUsers: true,
          maxLeads: true,
          maxAutomations: true,
          active: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  if (!user.active) {
    throw new Error('Account is disabled')
  }

  if (!user.tenant.active) {
    throw new Error('Tenant account is disabled')
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    throw new Error('Invalid credentials')
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      avatar: user.avatar,
    },
    tenant: user.tenant,
    token,
  }
}

// Get user from token
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
      avatar: true,
      active: true,
    },
  })

  if (!user || !user.active) return null

  return user
}

// Check permissions
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 6,
    [UserRole.AGENCY_OWNER]: 5,
    [UserRole.BUSINESS_OWNER]: 4,
    [UserRole.ADMIN]: 3,
    [UserRole.STAFF]: 2,
    [UserRole.VIEWER]: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Check if user can access tenant
export function canAccessTenant(userTenantId: string, targetTenantId: string, userRole: UserRole): boolean {
  // Super admin can access all tenants
  if (userRole === UserRole.SUPER_ADMIN) return true
  
  // Others can only access their own tenant
  return userTenantId === targetTenantId
}
