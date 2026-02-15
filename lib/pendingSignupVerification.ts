export type PendingSignupVerification = {
  fullName: string;
  email: string;
  userType: 'business' | 'employee' | 'creator' | 'individual';
  plan: string;
  planType: 'free_trial' | 'professional' | 'scale' | 'enterprise';
  businessName?: string;
  employerCode?: string;
  contentNiche?: string;
  provider: 'password' | 'google' | 'apple';
  password?: string;
  deviceId: string;
  requestedAt: string;
};

const PENDING_SIGNUP_KEY = 'veltrix_pending_signup_verification';

export function savePendingSignupVerification(payload: PendingSignupVerification): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(payload));
}

export function getPendingSignupVerification(): PendingSignupVerification | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(PENDING_SIGNUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingSignupVerification;
  } catch {
    return null;
  }
}

export function clearPendingSignupVerification(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_SIGNUP_KEY);
}
