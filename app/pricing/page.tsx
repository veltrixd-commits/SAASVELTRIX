// Pricing Page - SaaS Subscription Tiers
'use client';

import { Check, Zap, Building2, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setSelectedPlan } from '@/lib/auth';

export default function PricingPage() {
  const router = useRouter();

  const tiers = [
    {
      name: 'Free Trial',
      price: 'R 0',
      period: '7 days',
      description: 'Experience your complete operating system',
      icon: Zap,
      color: 'from-blue-600 to-purple-600',
      features: [
        'Personal OS (Morning Routine, Health)',
        'Task & To-Do System',
        'Basic CRM & Lead Management',
        'Content Calendar (Creators)',
        'Up to 100 contacts',
        '2 connected platforms',
        'Email support',
        'Cancel anytime'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: 'R 17,000',
      period: 'per month',
      description: 'Complete business & life operating system',
      icon: Building2,
      color: 'from-purple-600 to-pink-600',
      features: [
        'Everything in Free Trial',
        'Full Personal OS (AI Therapist, Wellness)',
        'Performance & Money Motivation',
        'Business Core (POS, Inventory, Invoicing)',
        'Content Studio (Script Generator, Analytics)',
        'Brand Deals & Sponsorship Tracker',
        'Leadership & Team Reviews',
        'Unlimited contacts & automation',
        'All 6 platforms integrated',
        'Advanced analytics & reports',
        'Priority support'
      ],
      cta: 'Get Started',
      popular: true
    },
    {
      name: 'Scale',
      price: 'R 44,000',
      period: 'per month',
      description: 'Enterprise OS with white-label capabilities',
      icon: Crown,
      color: 'from-orange-600 to-red-600',
      features: [
        'Everything in Professional',
        'Multi-tenant SaaS deployment',
        'White-label your own OS',
        'Unlimited team members',
        'Advanced AI & automation',
        'Custom module development',
        'Dedicated account manager',
        '24/7 premium support',
        'Training & onboarding'
      ],
      cta: 'Get Started',
      popular: false
    }
  ];

  const handleSelectPlan = (tierName: string) => {
    // Store selected plan in localStorage
    setSelectedPlan(tierName);
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
            {tiers.map((tier) => {
              const IconComponent = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:scale-105 transition-all relative ${
                    tier.popular ? 'ring-4 ring-purple-500 shadow-2xl' : ''
                  }`}
                >
                {tier.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r ${tier.color} rounded-xl sm:rounded-2xl flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 px-2">
                    {tier.description}
                  </p>
                  <div className="mb-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                      {tier.price}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {tier.period}
                  </p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(tier.name)}
                  className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r ${tier.color} hover:scale-105 transition-all shadow-lg hover:shadow-2xl`}
                >
                  {tier.cta}
                </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="max-w-4xl mx-auto glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Enterprise OS
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 px-2">
            Custom operating system tailored to your organization's unique workflows
          </p>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">∞</div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">Unlimited Everything</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">24/7</div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">Dedicated Support</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">100%</div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">Custom Built</p>
            </div>
          </div>
          <button
            onClick={() => handleSelectPlan('Enterprise')}
            className="px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
          >
            Contact Sales
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
