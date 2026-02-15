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
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [socialSubmitting, setSocialSubmitting] = useState<'google' | 'apple' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  const [pendingVerificationPayload, setPendingVerificationPayload] = useState<PendingSignupVerification | null>(null);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  const validateSocialSignup = () => {
    const newErrors: Record<string, string> = {};

    if (!userType) {
      newErrors.userType = 'Please select your user type first';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    if (userType === 'business' && !formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (userType === 'creator' && !formData.contentNiche.trim()) {
      newErrors.contentNiche = 'Content niche is required';
    }

    if (userType === 'employee') {
      if (!formData.employerCode.trim()) {
        newErrors.employerCode = 'Employer code is required for employee signup';
      } else if (!validateEmployerCode(formData.employerCode)) {
        newErrors.employerCode = 'Invalid employer code or company subscription expired';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    if (!validateSocialSignup()) return;

    const socialEmail = window.prompt(
      provider === 'google'
        ? 'Enter your Gmail address to continue'
        : 'Enter your Apple Mail address to continue'
    );

    if (!socialEmail) return;

    const normalizedEmail = socialEmail.trim().toLowerCase();
    const validEmail = /^\S+@\S+\.\S+$/.test(normalizedEmail);
    if (!validEmail) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    if (provider === 'google' && !normalizedEmail.endsWith('@gmail.com')) {
      setErrors({ email: 'Google signup requires a Gmail address.' });
      return;
    }

    const appleDomains = ['@icloud.com', '@me.com', '@mac.com', '@privaterelay.appleid.com'];
    if (provider === 'apple' && !appleDomains.some((domain) => normalizedEmail.endsWith(domain))) {
      setErrors({ email: 'Apple signup requires an Apple Mail address.' });
      return;
    }

    const fullName = formData.fullName.trim() || window.prompt('Enter your full name') || '';
    if (!fullName.trim()) {
      setErrors({ fullName: 'Full name is required for social signup.' });
      return;
    }

    setSocialSubmitting(provider);
    setErrors({});

    try {
      const normalizedPlan = normalizePlan(selectedPlan || 'Free Trial');

      const verificationPayload: PendingSignupVerification = {
        fullName: fullName.trim(),
        email: normalizedEmail,
        userType: (userType || 'individual') as UserType,
        businessName: userType === 'business' ? formData.businessName.trim() : undefined,
        employerCode: userType === 'employee' ? formData.employerCode.trim() : undefined,
        contentNiche: userType === 'creator' ? formData.contentNiche.trim() : undefined,
        plan: selectedPlan || 'Free Trial',
        planType: normalizedPlan,
        provider,
        deviceId: generateDeviceFingerprint(),
        requestedAt: new Date().toISOString(),
      };

      await sendSignupVerificationEmail(verificationPayload as unknown as Record<string, unknown>);
      savePendingSignupVerification(verificationPayload);
      setPendingVerificationPayload(verificationPayload);

      setVerificationSentTo(normalizedEmail);
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to send verification email.' });
    } finally {
      setSocialSubmitting(null);
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
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-600 dark:text-gray-400">
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
                disabled={isSubmitting || socialSubmitting !== null}
                className="mt-3 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-green-800 dark:text-green-200 border border-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-60"
              >
                {isSubmitting ? 'Resending...' : 'Resend verification email'}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || socialSubmitting !== null}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
          >
            {isSubmitting ? 'Sending Verification...' : 'Create Account'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialSignup('google')}
              disabled={socialSubmitting !== null}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              {socialSubmitting === 'google' ? 'Connecting...' : 'Continue with Google'}
            </button>
            <button
              type="button"
              onClick={() => handleSocialSignup('apple')}
              disabled={socialSubmitting !== null}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              {socialSubmitting === 'apple' ? 'Connecting...' : 'Continue with Apple'}
            </button>
          </div>

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
