// Onboarding - Tour / Complete
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, CheckCircle, Home, MessageCircle, Users, Package, Zap, BarChart3, PlayCircle, Target, Heart } from 'lucide-react';
import { updateCurrentUser } from '@/lib/auth';

export default function TourPage() {
  const router = useRouter();
  const [showTourConfirm, setShowTourConfirm] = useState(true);

  const handleStartTour = () => {
    updateCurrentUser({
      onboardingComplete: true,
      tourStarted: true,
      completedAt: new Date().toISOString()
    });

    // Redirect to interactive dashboard tour
    router.push('/dashboard/tour');
  };

  const handleSkipTour = () => {
    updateCurrentUser({
      onboardingComplete: true,
      tourStarted: false,
      completedAt: new Date().toISOString()
    });

    router.push('/dashboard');
  };

  if (showTourConfirm) {
    return (
      <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Setup Complete! 🎉
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
            Your account is ready to go
          </p>
        </div>

        {/* Quick Tour Offer */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-blue-500">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Take a Quick Tour?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Let us show you around! We'll walk you through the key features in just 3 minutes.
              </p>
            </div>
          </div>

          {/* Tour Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Autopilot Productivity
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  AI-powered task planning
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Unified Inbox
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All messages in one place
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Lead Management
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Track and qualify leads
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Wellness OS
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Health & burnout protection
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Automations
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Work while you sleep
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Analytics & Finance
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Track revenue & expenses
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStartTour}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
            >
              Start Tour (3 min)
            </button>
            <button
              onClick={handleSkipTour}
              className="px-6 py-4 glass-button rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Alternative: Go to Dashboard */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Or explore on your own
          </p>
          <button
            onClick={handleSkipTour}
            className="inline-flex items-center gap-2 px-8 py-3 glass-button rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
