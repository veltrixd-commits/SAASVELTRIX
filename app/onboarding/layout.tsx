// Onboarding Layout
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CheckCircle, Circle } from 'lucide-react';
import { getCurrentUser, getOnboardingRoute, isAuthenticated } from '@/lib/auth';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.onboardingComplete) {
      router.push('/dashboard');
      return;
    }

    if (pathname === '/onboarding') {
      router.push(getOnboardingRoute(user.onboardingStep));
      return;
    }

    setHasAccess(true);
  }, [pathname, router]);

  const steps = [
    { name: 'Business Details', path: '/onboarding/business-details' },
    { name: 'Product Setup', path: '/onboarding/product-setup' },
    { name: 'Automation Preferences', path: '/onboarding/automation-preferences' },
    { name: 'Billing Info', path: '/onboarding/billing' },
    { name: 'Welcome Tour', path: '/onboarding/tour' }
  ];

  const currentStepIndex = steps.findIndex(step => pathname === step.path);

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-4 sm:mb-8">
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Setup Progress
            </h2>
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.path} className="flex items-center flex-1">
                  <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        index < currentStepIndex
                          ? 'bg-green-500'
                          : index === currentStepIndex
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Circle className={`w-4 h-4 sm:w-6 sm:h-6 ${index === currentStepIndex ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center ${
                        index <= currentStepIndex
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${
                        index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
