export type PlanType = 'free_trial' | 'professional' | 'scale' | 'enterprise';

export type TrustedDevice = {
  id: string;
  rememberedAt: string;
  expiresAt: string;
};

export interface AccountUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  avatar?: string | null;
  userType: 'business' | 'employee' | 'creator' | 'individual';
  plan: string;
  planType: PlanType;
  rememberMe: boolean;
  onboardingComplete: boolean;
  createdAt: string;
  businessName?: string;
  employerCode?: string;
  contentNiche?: string;
  companyApproved?: boolean;
  companyName?: string;
  deviceId?: string;
  businessDetails?: Record<string, any>;
  products?: Array<Record<string, any>>;
  selectedPlatforms?: string[];
  automationPreferences?: Record<string, any>;
  onboardingStep?: string;
  billingInfo?: Record<string, any> | null;
  billingSkipped?: boolean;
  tourStarted?: boolean;
  tourSkipped?: boolean;
  completedAt?: string;
  authProvider?: 'password' | 'google' | 'apple';
  socialEmailVerified?: boolean;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  employeePermissions?: string[];
  pendingEmployeeRequest?: {
    companyName?: string;
    employerCode?: string;
    status: 'pending' | 'approved' | 'denied';
    requestedAt?: string;
    verificationCode?: string;
  };
  trustedDevices?: TrustedDevice[];
}

const USERS_KEY = 'veltrix_users';
const AUTH_KEY = 'isAuthenticated';
const ACTIVE_USER_KEY = 'userData';
const ACTIVE_USER_ID_KEY = 'veltrix_active_user_id';
const SELECTED_PLAN_KEY = 'selectedPlan';
const TRUSTED_DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function normalizePlan(plan?: string): PlanType {
  const value = (plan || '').trim().toLowerCase();
  if (value === 'professional') return 'professional';
  if (value === 'scale') return 'scale';
  if (value === 'enterprise') return 'enterprise';
  if (value === 'free trial' || value === 'free_trial' || value === 'free') return 'free_trial';
  return 'free_trial';
}

export function getSelectedPlan(): string {
  if (typeof window === 'undefined') return 'Free Trial';
  return localStorage.getItem(SELECTED_PLAN_KEY) || 'Free Trial';
}

export function setSelectedPlan(planLabel: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_PLAN_KEY, planLabel);
}

function filterActiveTrustedDevices(devices?: TrustedDevice[]): TrustedDevice[] {
  if (!devices || devices.length === 0) return [];
  const now = Date.now();
  return devices.filter((device) => {
    if (!device?.id || !device.expiresAt) return false;
    const expiresAtMs = new Date(device.expiresAt).getTime();
    return expiresAtMs > now;
  });
}

function readUsers(): AccountUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: AccountUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getAccounts(): AccountUser[] {
  return readUsers();
}

export function findAccountByEmail(email: string): AccountUser | null {
  const target = email.trim().toLowerCase();
  if (!target) return null;

  const users = readUsers();
  return users.find((user) => user.email.trim().toLowerCase() === target) || null;
}

export function createAccount(account: Omit<AccountUser, 'id' | 'createdAt'>): { ok: boolean; error?: string; user?: AccountUser } {
  const existing = findAccountByEmail(account.email);
  if (existing) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const user: AccountUser = {
    ...account,
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  const users = readUsers();
  users.push(user);
  writeUsers(users);

  return { ok: true, user };
}

export function updateAccount(userId: string, updates: Partial<AccountUser>): AccountUser | null {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index === -1) return null;

  const updated = { ...users[index], ...updates };
  users[index] = updated;
  writeUsers(users);

  const activeUser = getCurrentUser();
  if (activeUser && activeUser.id === userId) {
    setCurrentUser(updated);
  }

  return updated;
}

export function authenticate(email: string, password: string): { ok: boolean; error?: string; user?: AccountUser } {
  const user = findAccountByEmail(email);
  if (!user) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  if (user.emailVerified === false) {
    return { ok: false, error: 'Please verify your email first before logging in.' };
  }

  if (user.authProvider === 'google' || user.authProvider === 'apple') {
    return { ok: false, error: `This account uses ${user.authProvider === 'google' ? 'Google' : 'Apple'} sign-in. Use that button instead.` };
  }

  if (user.password !== password) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  return { ok: true, user };
}

export function authenticateSocial(
  email: string,
  provider: 'google' | 'apple'
): { ok: boolean; error?: string; user?: AccountUser } {
  const user = findAccountByEmail(email);
  if (!user) {
    return { ok: false, error: 'No account found for this email. Create your account first.' };
  }

  if (user.emailVerified === false) {
    return { ok: false, error: 'Please verify your email first before logging in.' };
  }

  if (user.authProvider && user.authProvider !== provider && user.authProvider !== 'password') {
    return { ok: false, error: `This account is linked to ${user.authProvider}. Use that provider instead.` };
  }

  if (user.authProvider === 'password') {
    return { ok: false, error: 'This account uses password login. Please log in with your password.' };
  }

  const updated = updateAccount(user.id, {
    authProvider: provider,
    socialEmailVerified: true,
    emailVerified: true,
    emailVerifiedAt: user.emailVerifiedAt || new Date().toISOString(),
  });

  return { ok: true, user: updated || user };
}

export function createOrLoginSocialAccount(params: {
  email: string;
  fullName: string;
  provider: 'google' | 'apple';
  userType: 'business' | 'employee' | 'creator' | 'individual';
  plan?: string;
  planType?: PlanType;
  businessName?: string;
  employerCode?: string;
  contentNiche?: string;
  companyApproved?: boolean;
  companyName?: string;
  onboardingStep?: string;
  pendingEmployeeRequest?: AccountUser['pendingEmployeeRequest'];
}): { ok: boolean; error?: string; user?: AccountUser; created?: boolean } {
  const existing = findAccountByEmail(params.email);
  if (existing) {
    if (existing.authProvider === 'password') {
      return { ok: false, error: 'An account already exists with password login for this email.' };
    }

    const merged = updateAccount(existing.id, {
      fullName: params.fullName || existing.fullName,
      authProvider: params.provider,
      socialEmailVerified: true,
      emailVerified: true,
      emailVerifiedAt: existing.emailVerifiedAt || new Date().toISOString(),
      pendingEmployeeRequest: params.pendingEmployeeRequest || existing.pendingEmployeeRequest,
      companyApproved: typeof params.companyApproved === 'boolean' ? params.companyApproved : existing.companyApproved,
      companyName: params.companyName || existing.companyName,
      employerCode: params.employerCode || existing.employerCode,
    });

    return { ok: true, user: merged || existing, created: false };
  }

  const created = createAccount({
    fullName: params.fullName,
    email: params.email,
    password: `social:${params.provider}:${Math.random().toString(36).slice(2, 10)}`,
    userType: params.userType,
    plan: params.plan || 'Free Trial',
    planType: params.planType || normalizePlan(params.plan || 'Free Trial'),
    rememberMe: true,
    onboardingComplete: false,
    businessName: params.businessName,
    employerCode: params.employerCode,
    contentNiche: params.contentNiche,
    companyApproved: params.companyApproved,
    companyName: params.companyName,
    onboardingStep: params.onboardingStep || 'business-details',
    authProvider: params.provider,
    socialEmailVerified: true,
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    pendingEmployeeRequest: params.pendingEmployeeRequest,
  });

  if (!created.ok || !created.user) {
    return { ok: false, error: created.error || 'Could not create social account.' };
  }

  return { ok: true, user: created.user, created: true };
}

export function setCurrentUser(user: AccountUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACTIVE_USER_ID_KEY, user.id);
  localStorage.setItem(AUTH_KEY, 'true');
}

export function signOut(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_USER_KEY);
  localStorage.removeItem(ACTIVE_USER_ID_KEY);
  localStorage.removeItem(AUTH_KEY);
}

export function updateCurrentUser(updates: Partial<AccountUser>): AccountUser | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const merged = { ...currentUser, ...updates };
  setCurrentUser(merged);

  if (currentUser.id) {
    return updateAccount(currentUser.id, updates) || merged;
  }

  return merged;
}

export function getCurrentUser(): AccountUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function getOnboardingRoute(step?: string): string {
  if (step === 'business-details') return '/onboarding/business-details';
  if (step === 'product-setup') return '/onboarding/product-setup';
  if (step === 'automation-preferences') return '/onboarding/automation-preferences';
  if (step === 'billing') return '/onboarding/billing';
  if (step === 'tour') return '/onboarding/tour';
  return '/onboarding/business-details';
}

export function getPostLoginRoute(user: AccountUser | null | undefined): string {
  if (!user) return '/login';

  const hasPendingEmployeeApproval =
    user.userType === 'employee' &&
    user.companyApproved === false &&
    (user.pendingEmployeeRequest?.status === 'pending' || !!user.employerCode);

  if (hasPendingEmployeeApproval) {
    return '/waiting-approval';
  }

  if (user.onboardingComplete) {
    return '/dashboard';
  }

  return getOnboardingRoute(user.onboardingStep);
}

export function migrateLegacyUserIfNeeded(): void {
  if (typeof window === 'undefined') return;

  const legacyRaw = localStorage.getItem(ACTIVE_USER_KEY);
  if (!legacyRaw) return;

  const users = readUsers();

  try {
    const legacyUser = JSON.parse(legacyRaw);
    if (!legacyUser?.email) return;

    const existing = users.find((user) => user.email.trim().toLowerCase() === String(legacyUser.email).trim().toLowerCase());
    if (existing) return;

    const normalized: AccountUser = {
      id: legacyUser.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fullName: legacyUser.fullName || legacyUser.name || 'User',
      email: legacyUser.email,
      password: legacyUser.password || '',
      userType: legacyUser.userType || 'individual',
      plan: legacyUser.plan || 'Free Trial',
      planType: normalizePlan(legacyUser.planType || legacyUser.plan),
      rememberMe: false,
      onboardingComplete: Boolean(legacyUser.onboardingComplete),
      createdAt: legacyUser.createdAt || new Date().toISOString(),
      businessName: legacyUser.businessName,
      employerCode: legacyUser.employerCode,
      contentNiche: legacyUser.contentNiche,
      companyApproved: legacyUser.companyApproved,
      companyName: legacyUser.companyName,
      deviceId: legacyUser.deviceId,
      businessDetails: legacyUser.businessDetails,
      onboardingStep: legacyUser.onboardingStep,
      authProvider: legacyUser.authProvider || 'password',
      socialEmailVerified: Boolean(legacyUser.socialEmailVerified),
      emailVerified: legacyUser.emailVerified !== false,
      emailVerifiedAt: legacyUser.emailVerifiedAt,
      employeePermissions: legacyUser.employeePermissions,
      pendingEmployeeRequest: legacyUser.pendingEmployeeRequest,
    };

    users.push(normalized);
    writeUsers(users);
  } catch {
  }
}

export function rememberDeviceForUser(userId: string, deviceId: string): AccountUser | null {
  if (typeof window === 'undefined') return null;
  if (!userId || !deviceId) return null;

  const users = readUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) return null;

  const activeDevices = filterActiveTrustedDevices(target.trustedDevices);
  const rememberedAt = new Date();
  const expiresAt = new Date(rememberedAt.getTime() + TRUSTED_DEVICE_TTL_MS).toISOString();

  const nextDevices = activeDevices.filter((device) => device.id !== deviceId);
  nextDevices.push({
    id: deviceId,
    rememberedAt: rememberedAt.toISOString(),
    expiresAt,
  });

  return updateAccount(userId, {
    trustedDevices: nextDevices,
    rememberMe: true,
  });
}

export function findUserByTrustedDevice(deviceId: string): AccountUser | null {
  if (typeof window === 'undefined') return null;
  if (!deviceId) return null;

  const users = readUsers();
  for (const user of users) {
    const activeDevices = filterActiveTrustedDevices(user.trustedDevices);
    if (activeDevices.length !== (user.trustedDevices?.length || 0)) {
      updateAccount(user.id, { trustedDevices: activeDevices });
    }

    if (activeDevices.some((device) => device.id === deviceId)) {
      return { ...user, trustedDevices: activeDevices };
    }
  }

  return null;
}
