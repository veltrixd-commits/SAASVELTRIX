// Login Page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authenticate, authenticateSocial, setCurrentUser, migrateLegacyUserIfNeeded, getPostLoginRoute } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    migrateLegacyUserIfNeeded();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    const result = authenticate(formData.email, formData.password);
    if (!result.ok || !result.user) {
      setError(result.error || 'Invalid email or password');
      return;
    }

    setCurrentUser({ ...result.user, rememberMe: formData.rememberMe });

    router.push(getPostLoginRoute(result.user));
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    const email = window.prompt(
      provider === 'google'
        ? 'Enter your Gmail address'
        : 'Enter your Apple Mail address'
    );

    if (!email) return;
    const normalizedEmail = email.trim().toLowerCase();

    setSocialLoading(provider);
    setError('');

    const result = authenticateSocial(normalizedEmail, provider);
    if (!result.ok || !result.user) {
      setError(result.error || 'Social login failed.');
      setSocialLoading(null);
      return;
    }

    setCurrentUser({ ...result.user, rememberMe: true });
    router.push(getPostLoginRoute(result.user));
    setSocialLoading(null);
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
        <form onSubmit={handleSubmit} className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
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
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
          >
            Log In
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
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              {socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={socialLoading !== null}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              {socialLoading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
            </button>
          </div>

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
