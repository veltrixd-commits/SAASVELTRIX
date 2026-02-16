"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createOrLoginSocialAccount,
  getPostLoginRoute,
  getSelectedPlan,
  normalizePlan,
  rememberDeviceForUser,
  setCurrentUser,
  type AccountUser,
} from '@/lib/auth';
import { generateDeviceFingerprint } from '@/lib/deviceFingerprint';

type OAuthResultResponse = {
  success: boolean;
  result?: {
    provider: 'google' | 'apple';
    mode: 'login' | 'signup';
    profile: {
      email: string;
      emailVerified: boolean;
      fullName?: string | null;
      avatar?: string | null;
      providerUserId: string;
    };
    userContext?: {
      fullName?: string;
      email?: string;
      userType?: 'business' | 'employee' | 'creator' | 'individual';
      businessName?: string;
      employerCode?: string;
      contentNiche?: string;
      plan?: string;
      planType?: 'free_trial' | 'professional' | 'scale' | 'enterprise';
      requestedAt?: string;
    };
    deviceId?: string;
    rememberDevice?: boolean;
    redirectTo?: string;
  };
  message?: string;
};

function OAuthCompletePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Finishing secure sign-in...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      const errorMessage = searchParams.get('error');
      if (errorMessage) {
        if (!isActive) return;
        setStatusMessage(errorMessage);
        setIsError(true);
        return;
      }

      const token = searchParams.get('token');
      if (!token) {
        setStatusMessage('Missing OAuth token. Please restart the sign-in flow.');
        setIsError(true);
        return;
      }

      try {
        const response = await fetch(`/api/auth/oauth/result/${encodeURIComponent(token)}`, {
          method: 'GET',
          cache: 'no-store',
        });
        const data = (await response.json()) as OAuthResultResponse;
        if (!response.ok || !data.success || !data.result) {
          throw new Error(data.message || 'Failed to complete OAuth sign-in.');
        }

        const { result } = data;
        const planLabel = result.userContext?.plan || getSelectedPlan() || 'Free Trial';
        const planType = result.userContext?.planType || normalizePlan(planLabel);
        const userType = result.userContext?.userType || 'individual';
        const fullName = result.profile.fullName || result.userContext?.fullName || result.profile.email.split('@')[0];

        const socialAccount = createOrLoginSocialAccount({
          email: result.profile.email,
          fullName,
          provider: result.provider,
          userType,
          plan: planLabel,
          planType,
          businessName: result.userContext?.businessName,
          employerCode: result.userContext?.employerCode,
          contentNiche: result.userContext?.contentNiche,
          onboardingStep: 'business-details',
        });

        if (!socialAccount.ok || !socialAccount.user) {
          throw new Error(socialAccount.error || 'Unable to finalize your account.');
        }

        let authenticatedUser: AccountUser = socialAccount.user;
        let deviceId = result.deviceId;

        if (!deviceId) {
          try {
            deviceId = generateDeviceFingerprint();
          } catch {
            deviceId = undefined;
          }
        }

        if ((result.rememberDevice ?? true) && deviceId) {
          const updated = rememberDeviceForUser(authenticatedUser.id, deviceId);
          if (updated) {
            authenticatedUser = updated;
          }
        }

        setCurrentUser({ ...authenticatedUser, rememberMe: Boolean(result.rememberDevice ?? true) });
        setStatusMessage('Success! Redirecting you to your workspace...');

        const redirectTarget = result.redirectTo || getPostLoginRoute(authenticatedUser);
        setTimeout(() => {
          if (isActive) {
            router.replace(redirectTarget);
          }
        }, 1200);
      } catch (error) {
        if (!isActive) return;
        const message = error instanceof Error ? error.message : 'Something went wrong while finalizing sign-in.';
        setStatusMessage(message);
        setIsError(true);
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/70 dark:bg-gray-800/70 flex items-center justify-center text-3xl">
            {isError ? '⚠️' : '🔐'}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isError ? 'We hit a snag' : 'Completing sign-in'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{statusMessage}</p>
          {isError && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Back to login
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90"
              >
                Go home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OAuthCompleteFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 text-center">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Finalizing secure sign-in...</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Please wait a moment.</p>
      </div>
    </div>
  );
}

export default function OAuthCompletePage() {
  return (
    <Suspense fallback={<OAuthCompleteFallback />}>
      <OAuthCompletePageContent />
    </Suspense>
  );
}
