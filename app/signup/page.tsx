// Sign Up Page - Complete Operating System for Everyone
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building2, Eye, EyeOff, Briefcase, Users, Video, Heart } from 'lucide-react';
import { generateDeviceFingerprint, checkDeviceRegistered, checkEmailRegistered } from '@/lib/deviceFingerprint';
import { validateEmployerCode } from '@/lib/companyRegistry';
import { getSelectedPlan, normalizePlan, migrateLegacyUserIfNeeded } from '@/lib/auth';
import {
  PendingSignupVerification,
  savePendingSignupVerification,
} from '@/lib/pendingSignupVerification';

const GOOGLE_OAUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';
const APPLE_OAUTH_ENABLED = process.env.NEXT_PUBLIC_APPLE_OAUTH_ENABLED === 'true';
const SOCIAL_LOGIN_ENABLED = GOOGLE_OAUTH_ENABLED || APPLE_OAUTH_ENABLED;

type UserType = 'business' | 'employee' | 'creator' | 'individual';

export default function SignUpPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType | ''>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    employerCode: '',
    contentNiche: '',
    agreeToTerms: false,
    rememberDevice: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  const [pendingVerificationPayload, setPendingVerificationPayload] = useState<PendingSignupVerification | null>(null);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    migrateLegacyUserIfNeeded();

    // Get selected plan from localStorage
    const plan = getSelectedPlan();
    if (plan) {
      setSelectedPlan(plan);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (options?: { requirePassword?: boolean }) => {
    const newErrors: Record<string, string> = {};
    const requirePassword = options?.requirePassword !== false;

    if (!userType) {
      newErrors.userType = 'Please select your user type';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (requirePassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Conditional validation based on user type
    if (userType === 'business' && !formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    // Employer code is MANDATORY for employees
    if (userType === 'employee') {
      if (!formData.employerCode.trim()) {
        newErrors.employerCode = 'Employer code is required';
      } else {
        // Validate employer code
        const company = validateEmployerCode(formData.employerCode);
        if (!company) {
          newErrors.employerCode = 'Invalid employer code or company subscription expired. Contact your company administrator.';
        }
      }
    }

    if (userType === 'creator' && !formData.contentNiche.trim()) {
      newErrors.contentNiche = 'Content niche is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendSignupVerificationEmail = async (payload: Record<string, unknown>) => {
    const response = await fetch('/api/auth/send-signup-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        origin: window.location.origin,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || 'Failed to send verification email.');
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationPayload) {
      setErrors({ general: 'No pending verification request found. Please submit signup again.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await sendSignupVerificationEmail(pendingVerificationPayload as unknown as Record<string, unknown>);
      setVerificationSentTo(pendingVerificationPayload.email);
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to resend verification email.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generate device fingerprint
    const deviceId = generateDeviceFingerprint();

    // Check if device is already registered (for trial accounts)
    if (selectedPlan === 'Free Trial' || !selectedPlan) {
      if (checkDeviceRegistered(deviceId)) {
        setErrors({ general: 'This device has already been used to create a trial account. Please upgrade to a paid plan or contact support.' });
        return;
      }

      // Check if email is already registered
      if (checkEmailRegistered(formData.email)) {
        setErrors({ email: 'This email has already been used to create a trial account.' });
        return;
      }
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const normalizedPlan = normalizePlan(selectedPlan || 'Free Trial');

      const verificationPayload: PendingSignupVerification = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        userType: userType as UserType,
        businessName: userType === 'business' ? formData.businessName.trim() : undefined,
        employerCode: userType === 'employee' ? formData.employerCode.trim() : undefined,
        contentNiche: userType === 'creator' ? formData.contentNiche.trim() : undefined,
        plan: selectedPlan || 'Free Trial',
        planType: normalizedPlan,
        provider: 'password',
        password: formData.password,
        deviceId,
        requestedAt: new Date().toISOString(),
        rememberDevice: formData.rememberDevice,
      };

      await sendSignupVerificationEmail(verificationPayload as unknown as Record<string, unknown>);
      savePendingSignupVerification(verificationPayload);
      setPendingVerificationPayload(verificationPayload);

      setVerificationSentTo(formData.email.trim().toLowerCase());
      setErrors({});
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to send verification email.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    const providerEnabled = provider === 'google' ? GOOGLE_OAUTH_ENABLED : APPLE_OAUTH_ENABLED;
    if (!providerEnabled) {
      setErrors({
        general: `${provider === 'google' ? 'Google' : 'Apple'} signup is disabled. Add the provider credentials and set NEXT_PUBLIC_${
          provider === 'google' ? 'GOOGLE' : 'APPLE'
        }_OAUTH_ENABLED=true in your .env file.`,
      });
      return;
    }

    if (!validateForm({ requirePassword: false })) {
      return;
    }

    const deviceId = generateDeviceFingerprint();

    if (selectedPlan === 'Free Trial' || !selectedPlan) {
      if (checkDeviceRegistered(deviceId)) {
        setErrors({ general: 'This device has already been used to create a trial account. Please upgrade to a paid plan or contact support.' });
        return;
      }

      if (checkEmailRegistered(formData.email)) {
        setErrors({ email: 'This email has already been used to create a trial account.' });
        return;
      }
    }

    setSocialLoading(provider);
    setErrors({});

    try {
      const normalizedPlan = normalizePlan(selectedPlan || 'Free Trial');
      const userContext = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        userType: userType as UserType,
        businessName: userType === 'business' ? formData.businessName.trim() : undefined,
        employerCode: userType === 'employee' ? formData.employerCode.trim() : undefined,
        contentNiche: userType === 'creator' ? formData.contentNiche.trim() : undefined,
        plan: selectedPlan || 'Free Trial',
        planType: normalizedPlan,
        requestedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/auth/oauth/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          mode: 'signup',
          userContext,
          deviceId,
          rememberDevice: formData.rememberDevice,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.authorizationUrl) {
        throw new Error(data?.message || 'Unable to connect with the provider.');
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Social signup failed. Please try again.' });
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Operating System Awaits
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Business | Life | Productivity | Growth - All in One Place
          </p>
          {selectedPlan && (
            <div className="mt-4 inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs sm:text-sm font-semibold">
              Selected Plan: {selectedPlan}
            </div>
          )}
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('business')}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  userType === 'business'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <Briefcase className={`w-8 h-8 mx-auto mb-2 ${
                  userType === 'business' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Business Owner</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Run your business</div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('employee')}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  userType === 'employee'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                }`}
              >
                <Users className={`w-8 h-8 mx-auto mb-2 ${
                  userType === 'employee' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Employee</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Work & collaborate</div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('creator')}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  userType === 'creator'
                    ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-pink-400'
                }`}
              >
                <Video className={`w-8 h-8 mx-auto mb-2 ${
                  userType === 'creator' ? 'text-pink-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Content Creator</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Create & monetize</div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('individual')}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  userType === 'individual'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                }`}
              >
                <Heart className={`w-8 h-8 mx-auto mb-2 ${
                  userType === 'individual' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Individual</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Personal productivity</div>
              </button>
            </div>
            {errors.userType && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.userType}</p>
            )}
          </div>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                  errors.fullName ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

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
                className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Conditional Fields Based on User Type */}
          {userType === 'business' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                    errors.businessName ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Acme Inc."
                />
              </div>
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.businessName}</p>
              )}
            </div>
          )}

          {userType === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employer Code <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="employerCode"
                  value={formData.employerCode}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white ${
                    errors.employerCode ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="e.g., ACME2024"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enter the code provided by your company administrator
              </p>
              {errors.employerCode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.employerCode}</p>
              )}
            </div>
          )}

          {userType === 'creator' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Niche
              </label>
              <div className="relative">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="contentNiche"
                  value={formData.contentNiche}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white ${
                    errors.contentNiche ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="e.g., Tech Reviews, Fitness, Gaming"
                />
              </div>
              {errors.contentNiche && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contentNiche}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                  errors.password ? 'ring-2 ring-red-500' : ''
                }`}
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
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                  errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3">
            <input
              id="agreeToTerms"
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.agreeToTerms}</p>
          )}

          {/* Remember Device */}
          <div className="flex items-start gap-3">
            <input
              id="rememberDevice"
              type="checkbox"
              name="rememberDevice"
              checked={formData.rememberDevice}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="rememberDevice" className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white">Remember this device after verification</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll trust this device for 30 days so you can jump straight to your dashboard on return visits.
              </p>
            </label>
          </div>

          {/* General Error Display */}
          {errors.general && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {errors.general}
              </p>
            </div>
          )}

          {verificationSentTo && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Verification email sent to {verificationSentTo}. Open your inbox, click the verification link, and signup will complete automatically.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isSubmitting}
                className="mt-3 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-green-800 dark:text-green-200 border border-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-60"
              >
                {isSubmitting ? 'Resending...' : 'Resend verification email'}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
          >
            {isSubmitting ? 'Sending Verification...' : 'Create Account'}
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
                    onClick={() => handleSocialSignup('google')}
                    disabled={Boolean(socialLoading) || isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                  >
                    {socialLoading === 'google' ? (
                      <span>Connecting...</span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4">
                            <path d="M23.49 12.27c0-.82-.07-1.64-.21-2.44H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.82Z" fill="#4285F4" />
                            <path d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3a7.08 7.08 0 0 1-10.54-3.72H1.49v3.12A12 12 0 0 0 12 24Z" fill="#34A853" />
                            <path d="M5.53 14.37a7.22 7.22 0 0 1 0-4.72V6.53H1.49a12 12 0 0 0 0 10.94l4.04-3.1Z" fill="#FBBC05" />
                            <path d="M12 4.75c1.76 0 3.36.61 4.62 1.8l3.45-3.45A12 12 0 0 0 1.49 6.53l4.04 3.12A7.08 7.08 0 0 1 12 4.75Z" fill="#EA4335" />
                          </svg>
                        </span>
                        <span>Sign up with Gmail</span>
                      </span>
                    )}
                  </button>
                )}

                {APPLE_OAUTH_ENABLED && (
                  <button
                    type="button"
                    onClick={() => handleSocialSignup('apple')}
                    disabled={Boolean(socialLoading) || isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                  >
                    {socialLoading === 'apple' ? (
                      <span>Connecting...</span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-gray-900 dark:text-white">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M16.44 1.99c0 1.14-.42 2.06-1.24 2.86-.92.9-1.99 1.43-3.18 1.34-.05-1.08.37-2.02 1.23-2.82.9-.86 1.99-1.36 3.19-1.38zM21 17.52c-.37.86-.8 1.66-1.3 2.41-.69 1.02-1.25 1.73-1.69 2.11-.7.65-1.45.99-2.27 1h-.02c-.57 0-1.26-.16-2.08-.49-.82-.33-1.58-.49-2.27-.49-.74 0-1.55.16-2.44.49-.89.33-1.6.5-2.12.52h-.19c-.77-.03-1.5-.35-2.2-.97-.47-.4-1.05-1.12-1.73-2.16-.74-1.11-1.35-2.4-1.82-3.86-.5-1.58-.75-3.1-.75-4.55 0-1.68.36-3.14 1.08-4.38a5.75 5.75 0 0 1 2.06-2.11A5.38 5.38 0 0 1 6.86 4c.66 0 1.52.19 2.56.55 1.03.36 1.7.55 2 .55.18 0 .83-.2 1.95-.59 1.04-.34 1.93-.49 2.68-.44 1.98.16 3.48.94 4.5 2.36a5 5 0 0 0-2.63 4.39c0 1.46.56 2.67 1.69 3.62-.1.29-.22.58-.34.88z" />
                          </svg>
                        </span>
                        <span>Continue with Apple</span>
                      </span>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Google/Apple sign-in is coming soon. Use email + password for now.
            </p>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline font-semibold">
              Log in
            </a>
          </p>
        </form>

        {/* Back to Pricing */}
        <div className="text-center mt-6">
          <a
            href="/pricing"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          >
            ← Back to Pricing
          </a>
        </div>
      </div>
    </div>
  );
}
