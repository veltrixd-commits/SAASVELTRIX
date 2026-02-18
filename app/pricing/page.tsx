// Pricing Page - SaaS Subscription Tiers
'use client';

import { Check, Zap, Building2, Crown, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setSelectedPlan } from '@/lib/auth';
import { getPlanMeta, listPlans } from '@/lib/subscriptionPlans';

export default function PricingPage() {
  const router = useRouter();
  const plans = listPlans({ includeEnterprise: false });
  const enterprisePlan = getPlanMeta('enterprise');
  const iconMap = {
    zap: Zap,
    building: Building2,
    crown: Crown,
    shield: Shield,
  } as const;

  const handleSelectPlan = (planLabel: string) => {
    // Store selected plan in localStorage
    setSelectedPlan(planLabel);
    // Redirect to signup
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-2">
            Your Complete Operating System
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2 px-2">
            For Business Owners | Employees | Content Creators | Individuals
          </p>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-2">
            Simple pricing. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto mb-12 sm:mb-16 overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] lg:auto-cols-fr gap-6 sm:gap-8 min-w-max lg:min-w-0">
            {plans.map((plan) => {
              const IconComponent = iconMap[plan.icon];
              return (
                <div
                  key={plan.code}
                  className={`glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:scale-105 transition-all relative ${
                    plan.recommended ? 'ring-4 ring-purple-500 shadow-2xl' : ''
                  }`}
                >
                {plan.recommended && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r ${plan.accent} rounded-xl sm:rounded-2xl flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 px-2">
                      {plan.description}
                  </p>
                  <div className="mb-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        {plan.priceLabel}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {plan.billingPeriodLabel}
                  </p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.entitlements.map((entitlement) => (
                      <li key={`${plan.code}-${entitlement.key}`} className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r ${plan.accent} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                          {entitlement.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r ${plan.accent} hover:scale-105 transition-all shadow-lg hover:shadow-2xl`}
                >
                    {plan.ctaLabel}
                </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="max-w-4xl mx-auto glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {enterprisePlan.name}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 px-2">
            {enterprisePlan.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {enterprisePlan.entitlements.map((entitlement) => (
              <div key={`enterprise-${entitlement.key}`} className="text-left p-4 glass-card rounded-xl">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{entitlement.label}</p>
                {entitlement.limit && (
                  <p className="text-xs text-gray-500 mt-1">
                    {entitlement.limit === 'unlimited'
                      ? 'Unlimited capacity'
                      : `${entitlement.limit} ${entitlement.unit || ''}`.trim()}
                  </p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => handleSelectPlan(enterprisePlan.name)}
            className="px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
          >
            {enterprisePlan.ctaLabel}
          </button>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center px-2">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                What happens after the free trial?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Your free trial lasts 7 days. After that, you'll need to choose a paid plan to continue using the platform. No credit card required for the trial.
              </p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8 sm:mt-12">
          <a
            href="/"
            className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
