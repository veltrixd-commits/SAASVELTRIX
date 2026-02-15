// Onboarding - Billing Information
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, AlertCircle, Shield } from 'lucide-react';
import { getCurrentUser, normalizePlan, updateCurrentUser } from '@/lib/auth';

export default function BillingInformationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: '',
    city: '',
    postalCode: '',
    country: 'South Africa'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState('Free Trial');

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.plan) {
      setSelectedPlan(user.plan);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, cardNumber: value }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.length < 13 || formData.cardNumber.length > 19) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Required';
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Required';
    }

    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateCurrentUser({
      billingInfo: {
        ...formData,
        // In production, never store full card details - use tokenization
        cardNumber: `****${formData.cardNumber.slice(-4)}`, // Only store last 4 digits
        cardType: getCardType(formData.cardNumber)
      },
      plan: selectedPlan,
      planType: normalizePlan(selectedPlan),
      onboardingStep: 'tour'
    });

    // Navigate to tour/completion
    router.push('/onboarding/tour');
  };

  const handleSkip = () => {
    // For free trial, allow skipping billing
    if (selectedPlan === 'Free Trial') {
      updateCurrentUser({
        billingInfo: null,
        billingSkipped: true,
        plan: selectedPlan,
        planType: normalizePlan(selectedPlan),
        onboardingStep: 'tour'
      });
      router.push('/onboarding/tour');
    }
  };

  const getCardType = (number: string) => {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  const months = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Billing Information
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Selected Plan: <span className="font-semibold">{selectedPlan}</span>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="glass-card rounded-xl p-4 border-2 border-green-500 flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
            </p>
          </div>
        </div>

        {selectedPlan === 'Free Trial' && (
          <div className="mt-4 glass-card rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Free Trial Note:</strong> You won't be charged during your 7-day free trial. You can skip this step and add payment details later.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cardholder Name *
          </label>
          <input
            type="text"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
              errors.cardholderName ? 'ring-2 ring-red-500' : ''
            }`}
            placeholder="John Doe"
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardholderName}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Number *
          </label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="cardNumber"
              value={formatCardNumber(formData.cardNumber)}
              onChange={handleCardNumberChange}
              className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                errors.cardNumber ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiry Date *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                name="expiryMonth"
                value={formData.expiryMonth}
                onChange={handleChange}
                className={`px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                  errors.expiryMonth ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <option value="">MM</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                name="expiryYear"
                value={formData.expiryYear}
                onChange={handleChange}
                className={`px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                  errors.expiryYear ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <option value="">YYYY</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {(errors.expiryMonth || errors.expiryYear) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CVV *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,4}$/.test(value)) {
                    handleChange(e);
                  }
                }}
                className={`w-full pl-12 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                  errors.cvv ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="123"
                maxLength={4}
              />
            </div>
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Billing Address *
          </label>
          <input
            type="text"
            name="billingAddress"
            value={formData.billingAddress}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
              errors.billingAddress ? 'ring-2 ring-red-500' : ''
            }`}
            placeholder="123 Main Street"
          />
          {errors.billingAddress && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.billingAddress}</p>
          )}
        </div>

        {/* City, Postal Code, Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                errors.city ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="Johannesburg"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={`w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
                errors.postalCode ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="2000"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.postalCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="South Africa">South Africa</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Kenya">Kenya</option>
              <option value="Ghana">Ghana</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/onboarding/automation-preferences')}
            className="px-4 sm:px-6 py-2.5 sm:py-3 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:scale-105 transition-all order-2 sm:order-1"
          >
            ← Back
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
            {selectedPlan === 'Free Trial' && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 sm:px-6 py-2.5 sm:py-3 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
              >
                Skip for Now
              </button>
            )}
            <button
              type="submit"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
            >
              Complete Setup →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
