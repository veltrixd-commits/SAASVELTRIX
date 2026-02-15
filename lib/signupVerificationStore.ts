import { randomUUID } from 'crypto';

export type SignupVerificationPayload = {
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

type PendingSignupRecord = {
  token: string;
  payload: SignupVerificationPayload;
  expiresAt: number;
  usedAt?: number;
};

const TOKEN_TTL_MS = 30 * 60 * 1000;

const globalStore = globalThis as typeof globalThis & {
  __signupVerificationStore?: Map<string, PendingSignupRecord>;
};

function getStore(): Map<string, PendingSignupRecord> {
  if (!globalStore.__signupVerificationStore) {
    globalStore.__signupVerificationStore = new Map<string, PendingSignupRecord>();
  }
  return globalStore.__signupVerificationStore;
}

function cleanupExpiredRecords(store: Map<string, PendingSignupRecord>) {
  const now = Date.now();
  for (const [token, record] of store.entries()) {
    if (record.expiresAt <= now || record.usedAt) {
      store.delete(token);
    }
  }
}

export function createSignupVerification(payload: SignupVerificationPayload): { token: string; expiresAt: number } {
  const store = getStore();
  cleanupExpiredRecords(store);

  const token = randomUUID();
  const expiresAt = Date.now() + TOKEN_TTL_MS;

  store.set(token, {
    token,
    payload,
    expiresAt,
  });

  return { token, expiresAt };
}

export function consumeSignupVerification(token: string):
  | { ok: true; payload: SignupVerificationPayload }
  | { ok: false; error: string } {
  if (!token) {
    return { ok: false, error: 'Missing verification token.' };
  }

  const store = getStore();
  cleanupExpiredRecords(store);

  const record = store.get(token);
  if (!record) {
    return { ok: false, error: 'This verification link is invalid or has expired.' };
  }

  if (record.usedAt) {
    store.delete(token);
    return { ok: false, error: 'This verification link has already been used.' };
  }

  if (record.expiresAt <= Date.now()) {
    store.delete(token);
    return { ok: false, error: 'This verification link has expired. Please request a new one.' };
  }

  record.usedAt = Date.now();
  store.delete(token);

  return {
    ok: true,
    payload: record.payload,
  };
}
