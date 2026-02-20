// Onboarding - Business Details
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, Phone, Globe, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';

export default function BusinessDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    businessSize: '',
    country: 'South Africa',
    city: '',
    phoneNumber: '',
    website: '',
    description: '',
    monthlyRevenueGoal: '',
    annualRevenueTarget: ''
  });
  const [revenueError, setRevenueError] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.businessDetails) {
      setFormData(prev => ({ ...prev, ...user.businessDetails }));
      return;
    }

    if (user?.businessName) {
      setFormData(prev => ({ ...prev, businessName: user.businessName ?? '' }));
    }
  }, []);

  const industries = [
    'E-commerce',
    'Education',
    'Healthcare',
    'Real Estate',
    'Hospitality',
    'Financial Services',
    'Marketing Agency',
    'Retail',
    'Technology',
    'Other'
  ];

  const businessSizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate minimum revenue goal and auto-calculate annual
    if (name === 'monthlyRevenueGoal') {
      const monthlyGoal = parseFloat(value) || 0;
      
      // Check minimum R5,000
      if (monthlyGoal > 0 && monthlyGoal < 5000) {
        setRevenueError('Minimum monthly revenue goal is R5,000');
      } else {
        setRevenueError('');
      }
      
      // Auto-fill annual revenue target (monthly × 12)
      const annualTarget = monthlyGoal * 12;
      setFormData(prev => ({ ...prev, annualRevenueTarget: annualTarget > 0 ? annualTarget.toString() : '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check revenue validation
    const monthlyGoal = parseFloat(formData.monthlyRevenueGoal) || 0;
    if (monthlyGoal > 0 && monthlyGoal < 5000) {
      setRevenueError('Minimum monthly revenue goal is R5,000');
      return;
    }

    updateCurrentUser({
      businessDetails: formData,
      businessName: formData.businessName,
      onboardingStep: 'product-setup'
    });

    // Navigate to product setup
    router.push('/onboarding/product-setup');
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tell us about your business
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This helps us customize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Acme Inc."
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry *
          </label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="">Select an industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Business Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Size *
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              name="businessSize"
              value={formData.businessSize}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="">Select business size</option>
              {businessSizes.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location - Country & City */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country *
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="South Africa"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Johannesburg"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="+27 XX XXX XXXX"
            />
          </div>
        </div>

        {/* Website (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website (Optional)
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Business Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brief Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
            placeholder="Tell us what your business does..."
          />
        </div>

        {/* Revenue Goals Section */}
        <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-purple-500">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md sm:rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Revenue Goals
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                Help us understand your targets to provide better insights
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Monthly Revenue Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Revenue Goal *
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  R
                </span>
                <input
                  type="number"
                  name="monthlyRevenueGoal"
                  value={formData.monthlyRevenueGoal}
                  onChange={handleChange}
                  required
                  className="w-full pl-16 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="50,000"
                  step="1000"
                  min="5000"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum R5,000 | Your monthly revenue target in ZAR
              </p>
              
              {/* Validation Error */}
              {revenueError && (
                <div className="mt-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-500 rounded-lg sm:rounded-xl">
                  <div className="flex gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 font-medium">
                      {revenueError}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Annual Revenue Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Revenue Target *
              </label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  R
                </span>
                <input
                  type="number"
                  name="annualRevenueTarget"
                  value={formData.annualRevenueTarget}
                  onChange={handleChange}
                  required
                  className="w-full pl-16 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="600,000"
                  step="10000"
                  min="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Auto-calculated from monthly goal (×12) - you can adjust if needed
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-4 sm:px-6 py-2.5 sm:py-3 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:scale-105 transition-all order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg hover:shadow-2xl order-1 sm:order-2"
          >
            Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
