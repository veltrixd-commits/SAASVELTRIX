"use client";
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import {
  createAccount,
  createOrLoginSocialAccount,
  normalizePlan,
  setCurrentUser,
} from '@/lib/auth';
import {
  checkDeviceRegistered,
  checkEmailRegistered,
  registerDevice,
  registerEmail,
} from '@/lib/deviceFingerprint';
import { requestCompanyAccess } from '@/lib/companyRegistry';
import {
  clearPendingSignupVerification,
  getPendingSignupVerification,
} from '@/lib/pendingSignupVerification';

type VerifiedSignupPayload = {
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
};

function VerifySignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email and completing signup...');
  const [isResending, setIsResending] = useState(false);

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function completeSignupFlow() {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token. Please request a new verification email.');
        return;
      }

      try {
        const completeResponse = await fetch('/api/auth/complete-signup-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const completeData = await completeResponse.json();
        if (!completeResponse.ok || !completeData?.success || !completeData?.signup) {
          throw new Error(completeData?.message || 'Failed to verify this signup link.');
        }

        const signup = completeData.signup as VerifiedSignupPayload;
        const normalizedPlan = normalizePlan(signup.plan || 'Free Trial');
        const isTrial = normalizedPlan === 'free_trial';

        if (isTrial) {
          if (checkDeviceRegistered(signup.deviceId)) {
            throw new Error('This device has already been used for a trial account. Use a paid plan or contact support.');
          }

          if (checkEmailRegistered(signup.email)) {
            throw new Error('This email has already been used for a trial account.');
          }
        }

        let pendingEmployeeRequest: any = undefined;
        let companyName: string | undefined;
        let companyApproved = false;

        if (signup.userType === 'employee' && signup.employerCode) {
          const accessRequest = requestCompanyAccess(signup.employerCode, signup.email, signup.fullName);
          if (!accessRequest.success) {
            throw new Error(accessRequest.error || 'Failed to request company access.');
          }

          companyName = accessRequest.company?.name;
          pendingEmployeeRequest = {
            companyName,
            employerCode: signup.employerCode,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            verificationCode: accessRequest.verificationCode,
          };
        }

        let activeUser: any;

        if (signup.provider === 'password') {
          if (!signup.password) {
            throw new Error('Signup data is missing password. Please register again.');
          }

          const created = createAccount({
            fullName: signup.fullName,
            email: signup.email,
            password: signup.password,
            userType: signup.userType,
            plan: signup.plan,
            planType: normalizedPlan,
            rememberMe: false,
            onboardingComplete: false,
            businessName: signup.businessName,
            employerCode: signup.employerCode,
            contentNiche: signup.contentNiche,
            companyApproved,
            companyName,
            pendingEmployeeRequest,
            deviceId: signup.deviceId,
            onboardingStep: 'business-details',
            authProvider: 'password',
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
          });

          if (!created.ok || !created.user) {
            throw new Error(created.error || 'Failed to complete signup.');
          }

          activeUser = created.user;
        } else {
          const socialResult = createOrLoginSocialAccount({
            email: signup.email,
            fullName: signup.fullName,
            provider: signup.provider,
            userType: signup.userType,
            plan: signup.plan,
            planType: normalizedPlan,
            businessName: signup.businessName,
            employerCode: signup.employerCode,
            contentNiche: signup.contentNiche,
            companyApproved,
            companyName,
            pendingEmployeeRequest,
            onboardingStep: 'business-details',
          });

          if (!socialResult.ok || !socialResult.user) {
            throw new Error(socialResult.error || 'Failed to complete social signup.');
          }

          activeUser = socialResult.user;
        }

        setCurrentUser(activeUser);

        if (isTrial) {
          registerDevice(signup.deviceId);
          registerEmail(signup.email);
        }

        await fetch('/api/auth/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: signup.email,
            fullName: signup.fullName,
            userType: signup.userType,
          }),
        });

        if (cancelled) return;

        clearPendingSignupVerification();

        setStatus('success');
        setMessage('Email verified and signup completed. Redirecting...');

        setTimeout(() => {
          if (signup.userType === 'employee') {
            router.push('/waiting-approval');
          } else {
            router.push('/onboarding/business-details');
          }
        }, 1100);
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unable to complete verification right now.');
      }
    }

    completeSignupFlow();

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  const handleResendVerification = async () => {
    const pendingPayload = getPendingSignupVerification();
    if (!pendingPayload) {
      setMessage('No saved signup request found. Please return to signup and submit your details again.');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/send-signup-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pendingPayload,
          origin: window.location.origin,
          requestedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to resend verification email.');
      }

      setMessage(`A new verification link was sent to ${pendingPayload.email}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Completing your signup</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email verified</h1>
          </>
        )}

        {status === 'error' && (
          <>
            <MailWarning className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification failed</h1>
          </>
        )}

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{message}</p>

        {status === 'error' && (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full py-3 border border-blue-600 text-blue-700 dark:text-blue-300 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-60"
            >
              {isResending ? 'Resending...' : 'Resend verification email'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
            >
              Back to Signup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifySignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preparing verification...</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading your verification details.</p>
          </div>
        </div>
      }
    >
      <VerifySignupContent />
    </Suspense>
  );
}
