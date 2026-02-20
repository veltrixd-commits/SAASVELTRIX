// Login Page
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { generateDeviceFingerprint } from '@/lib/deviceFingerprint';
import type { AccountUser } from '@/lib/auth';
import { normalizePlan, setCurrentUser } from '@/lib/auth';

const GOOGLE_OAUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';
const APPLE_OAUTH_ENABLED = process.env.NEXT_PUBLIC_APPLE_OAUTH_ENABLED === 'true';
const SOCIAL_LOGIN_ENABLED = GOOGLE_OAUTH_ENABLED || APPLE_OAUTH_ENABLED;
const DEFAULT_PLAN_LABEL = 'Free Trial';

type LoginApiUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  avatar?: string | null;
  userType?: string;
};

type LoginApiTenant = {
  id: string;
  name: string;
  slug: string;
  type: 'AGENCY' | 'BUSINESS';
  plan: string;
  maxUsers: number;
  maxLeads: number;
  maxAutomations: number;
} | null;

type LoginResponseBody = {
  success: boolean;
  message?: string;
  user?: LoginApiUser;
  tenant?: LoginApiTenant;
  nextRoute?: string;
};

function formatPlanLabel(plan?: string | null) {
  if (!plan) return DEFAULT_PLAN_LABEL;
  return plan
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function mapLoginResponseToAccountUser(
  payload: Required<Pick<LoginResponseBody, 'user'>> & { tenant?: LoginApiTenant },
  rememberMe: boolean,
  deviceId?: string | null
): AccountUser {
  const tenant = payload.tenant;
  const safePlan = tenant?.plan || DEFAULT_PLAN_LABEL;
  const userType = payload.user.userType === 'employee'
    ? 'employee'
    : tenant?.type === 'BUSINESS'
      ? 'business'
      : 'individual';

  return {
    id: payload.user.id,
    fullName: [payload.user.firstName, payload.user.lastName].filter(Boolean).join(' ') || payload.user.email,
    email: payload.user.email,
    password: '',
    avatar: payload.user.avatar,
    userType,
    plan: formatPlanLabel(safePlan),
    planType: normalizePlan(safePlan),
    rememberMe,
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
    businessName: tenant?.name,
    companyName: tenant?.name,
    deviceId: deviceId || undefined,
    billingInfo: null,
    billingSkipped: false,
    tourStarted: false,
    tourSkipped: false,
    authProvider: 'password',
    socialEmailVerified: true,
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    trustedDevices: [],
  };
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  useEffect(() => {
    try {
      const fingerprint = generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
    } catch (err) {
      console.warn('Device fingerprint unavailable', err);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
          deviceId: deviceFingerprint,
          redirectTo: searchParams.get('redirectTo') || undefined,
        }),
      });

      const data = (await response.json()) as LoginResponseBody;
      if (!response.ok || !data.success || !data.user) {
        throw new Error(data?.message || 'Invalid email or password');
      }

      const mappedUser = mapLoginResponseToAccountUser(
        { user: data.user, tenant: data.tenant },
        formData.rememberMe,
        deviceFingerprint
      );

      setCurrentUser(mappedUser);

      const target = data.nextRoute || searchParams.get('redirectTo') || '/dashboard';
      router.push(target);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to log in. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerEnabled = (provider: 'google' | 'apple') =>
    provider === 'google' ? GOOGLE_OAUTH_ENABLED : APPLE_OAUTH_ENABLED;

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (!providerEnabled(provider)) {
      setError(
        `${provider === 'google' ? 'Google' : 'Apple'} sign-in is disabled in this environment. Add the provider credentials and set NEXT_PUBLIC_${
          provider === 'google' ? 'GOOGLE' : 'APPLE'
        }_OAUTH_ENABLED=true to enable it.`
      );
      return;
    }

    try {
      setSocialLoading(provider);
      setError('');

      const fingerprint = deviceFingerprint || (() => {
        const nextFingerprint = generateDeviceFingerprint();
        setDeviceFingerprint(nextFingerprint);
        return nextFingerprint;
      })();

      const response = await fetch('/api/auth/oauth/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          mode: 'login',
          deviceId: fingerprint,
          rememberDevice: true,
          redirectTo: searchParams.get('redirectTo') || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.authorizationUrl) {
        throw new Error(data?.message || 'Unable to connect with the provider.');
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Social login failed. Please try again.';
      setError(message);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Log in to your Veltrix account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-xl sm:rounded-2xl p-5 sm:space-y-6 space-y-4 lg:p-8">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3">
            <input
              id="rememberMe"
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Log In'}
          </button>

          {SOCIAL_LOGIN_ENABLED ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOOGLE_OAUTH_ENABLED && (
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={socialLoading !== null}
                    className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                  >
                    {socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                  </button>
                )}

                {APPLE_OAUTH_ENABLED && (
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={socialLoading !== null}
                    className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                  >
                    {socialLoading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Google/Apple sign-in is coming soon. Use email + password for now.
            </p>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </form>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-xl p-6 text-center space-y-3">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Loading sign-in...</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">Preparing secure login options.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
