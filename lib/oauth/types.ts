import type { PlanType } from '@/lib/auth';

export type OAuthProvider = 'google' | 'apple';
export type OAuthMode = 'login' | 'signup';

export type OAuthUserContext = {
  fullName?: string;
  email?: string;
  userType?: 'business' | 'employee' | 'creator' | 'individual';
  businessName?: string;
  employerCode?: string;
  contentNiche?: string;
  plan?: string;
  planType?: PlanType;
  requestedAt?: string;
};

export type OAuthProviderConfig = {
  provider: OAuthProvider;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string[];
};

export type OAuthStartRequest = {
  provider: OAuthProvider;
  mode: OAuthMode;
  userContext?: OAuthUserContext;
  deviceId?: string;
  rememberDevice?: boolean;
  redirectTo?: string;
};

export type OAuthStateRecord = {
  state: string;
  provider: OAuthProvider;
  mode: OAuthMode;
  createdAt: number;
  codeVerifier?: string;
  nonce?: string;
  deviceId?: string;
  rememberDevice?: boolean;
  redirectTo?: string;
  userContext?: OAuthUserContext;
};

export type OAuthResultRecord = {
  token: string;
  provider: OAuthProvider;
  mode: OAuthMode;
  createdAt: number;
  profile: {
    email: string;
    emailVerified: boolean;
    fullName?: string | null;
    avatar?: string | null;
    providerUserId: string;
  };
  userContext?: OAuthUserContext;
  deviceId?: string;
  rememberDevice?: boolean;
  redirectTo?: string;
};
