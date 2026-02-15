// Onboarding - Automation Preferences
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Music, MessageCircle, Facebook, Instagram, Linkedin, Globe, Check } from 'lucide-react';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';

export default function AutomationPreferencesPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(currentUser?.selectedPlatforms || []);
  const [automationPreferences, setAutomationPreferences] = useState(currentUser?.automationPreferences || {
    autoQualifyLeads: false,
    autoRespond: false,
    autoSchedulePosts: false,
    autoSendInvoices: false,
    trackDeliveries: false,
    aiAssist: false
  });
  const [morningRoutine, setMorningRoutine] = useState({
    wakeUpTime: '07:00',
    mainGoals: [] as string[],
    includeExercise: false,
    includeWellness: false,
    workStartTime: '09:00',
  });

  const platforms = [
    { name: 'TikTok', icon: Music, color: 'from-black to-gray-800', description: 'Lead forms & DM automation' },
    { name: 'WhatsApp', icon: MessageCircle, color: 'from-green-500 to-green-600', description: 'Business messaging' },
    { name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700', description: 'Ads & messenger' },
    { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600', description: 'DMs & comments' },
    { name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-800', description: 'B2B messaging' },
    { name: 'Website', icon: Globe, color: 'from-gray-700 to-gray-800', description: 'Lead capture forms' }
  ];

  const togglePlatform = (platformName: string) => {
    if (selectedPlatforms.includes(platformName)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformName));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformName]);
    }
  };

  const handlePreferenceChange = (key: keyof typeof automationPreferences) => {
    setAutomationPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMorningGoal = (goal: string) => {
    if (morningRoutine.mainGoals.includes(goal)) {
      setMorningRoutine(prev => ({ 
        ...prev, 
        mainGoals: prev.mainGoals.filter(g => g !== goal) 
      }));
    } else {
      setMorningRoutine(prev => ({ 
        ...prev, 
        mainGoals: [...prev.mainGoals, goal] 
      }));
    }
  };

  const createMorningRoutine = () => {
    const routineSteps = [];
    const wakeTime = morningRoutine.wakeUpTime;
    
    // Always add wake up
    routineSteps.push({
      time: wakeTime,
      activity: 'Wake Up',
      description: 'Start your productive day with energy',
    });

    // Add wellness check if selected
    if (morningRoutine.includeWellness) {
      const wellnessTime = addMinutes(wakeTime, 5);
      routineSteps.push({
        time: wellnessTime,
        activity: 'Wellness Check',
        description: 'Review your health stats and set wellness goals',
      });
    }

    // Add exercise if selected
    if (morningRoutine.includeExercise) {
      const exerciseTime = addMinutes(wakeTime, morningRoutine.includeWellness ? 15 : 10);
      routineSteps.push({
        time: exerciseTime,
        activity: 'Morning Exercise',
        description: '15-30 min workout or stretching',
      });
    }

    // Add goal-specific activities
    if (morningRoutine.mainGoals.includes('review_leads')) {
      const leadsTime = addMinutes(wakeTime, 30);
      routineSteps.push({
        time: leadsTime,
        activity: 'Review Hot Leads',
        description: 'Check and respond to priority leads',
      });
    }

    if (morningRoutine.mainGoals.includes('content_plan')) {
      const contentTime = addMinutes(wakeTime, 45);
      routineSteps.push({
        time: contentTime,
        activity: 'Content Planning',
        description: 'Plan and schedule today\'s content',
      });
    }

    if (morningRoutine.mainGoals.includes('check_revenue')) {
      const revenueTime = addMinutes(wakeTime, 50);
      routineSteps.push({
        time: revenueTime,
        activity: 'Revenue Review',
        description: 'Check overnight sales and invoices',
      });
    }

    // Add work start
    routineSteps.push({
      time: morningRoutine.workStartTime,
      activity: 'Start Work',
      description: 'Begin your focused work session',
    });

    return routineSteps;
  };

  const addMinutes = (time: string, minutes: number) => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60) % 24;
    const newMins = totalMins % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  const handleContinue = () => {
    const generatedRoutine = createMorningRoutine();
    
    // Store morning routine in localStorage for dashboard access
    localStorage.setItem('user_morning_routine', JSON.stringify(generatedRoutine));
    localStorage.setItem('user_morning_routine_config', JSON.stringify(morningRoutine));
    
    updateCurrentUser({
      selectedPlatforms: selectedPlatforms,
      automationPreferences: automationPreferences,
      onboardingStep: 'billing'
    });

    // Navigate to billing
    router.push('/onboarding/billing');
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Automation Preferences
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Choose which platforms and features you want to automate
        </p>
      </div>

      {/* Select Platforms */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Connect Your Platforms
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          Select the platforms where you receive customer enquiries
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {platforms.map(platform => {
            const IconComponent = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.name);
            
            return (
              <button
                key={platform.name}
                onClick={() => togglePlatform(platform.name)}
                className={`glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 hover:scale-[1.02] transition-all text-left relative ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${platform.color} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {platform.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automation Features */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Automation Features
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Choose which aspects of your business to automate
        </p>
        <div className="space-y-3">
          <label className="glass-card rounded-xl p-6 flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all">
            <input
              type="checkbox"
              checked={automationPreferences.autoQualifyLeads}
              onChange={() => handlePreferenceChange('autoQualifyLeads')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Auto-Qualify Leads
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use AI to automatically score and prioritize incoming leads
              </p>
            </div>
          </label>

          <label className="glass-card rounded-xl p-6 flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all">
            <input
              type="checkbox"
              checked={automationPreferences.autoRespond}
              onChange={() => handlePreferenceChange('autoRespond')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Auto-Respond to Messages
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send instant responses to common questions across all platforms
              </p>
            </div>
          </label>

          <label className="glass-card rounded-xl p-6 flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all">
            <input
              type="checkbox"
              checked={automationPreferences.autoSchedulePosts}
              onChange={() => handlePreferenceChange('autoSchedulePosts')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Auto-Schedule Content
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Schedule and post content automatically across platforms
              </p>
            </div>
          </label>

          <label className="glass-card rounded-xl p-6 flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all">
            <input
              type="checkbox"
              checked={automationPreferences.autoSendInvoices}
              onChange={() => handlePreferenceChange('autoSendInvoices')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Auto-Send Invoices
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate and send invoices automatically after sales
              </p>
            </div>
          </label>

          <label className="glass-card rounded-xl p-6 flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all">
            <input
              type="checkbox"
              checked={automationPreferences.trackDeliveries}
              onChange={() => handlePreferenceChange('trackDeliveries')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Track Deliveries
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send automated delivery updates to customers
              </p>
            </div>
          </label>

          <label className="glass-card rounded-xl p-6 flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all">
            <input
              type="checkbox"
              checked={automationPreferences.aiAssist}
              onChange={() => handlePreferenceChange('aiAssist')}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                AI Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use GPT-4 to help with customer conversations and content
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Morning Routine Setup */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ☀️ Auto-Create Your Morning Routine
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We'll suggest a personalized morning routine based on your preferences
        </p>
        
        <div className="space-y-4">
          {/* Wake up time */}
          <div className="glass-card rounded-xl p-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              What time do you usually wake up?
            </label>
            <input
              type="time"
              value={morningRoutine.wakeUpTime}
              onChange={(e) => setMorningRoutine(prev => ({ ...prev, wakeUpTime: e.target.value }))}
              className="w-full sm:w-auto px-4 py-2 glass-input rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          {/* Work start time */}
          <div className="glass-card rounded-xl p-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              When do you start work/business activities?
            </label>
            <input
              type="time"
              value={morningRoutine.workStartTime}
              onChange={(e) => setMorningRoutine(prev => ({ ...prev, workStartTime: e.target.value }))}
              className="w-full sm:w-auto px-4 py-2 glass-input rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          {/* Morning goals */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              What should be in your morning routine? (Select all that apply)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => toggleMorningGoal('review_leads')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  morningRoutine.mainGoals.includes('review_leads')
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">📊 Review Hot Leads</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Check priority leads first thing</div>
              </button>
              
              <button
                onClick={() => toggleMorningGoal('check_revenue')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  morningRoutine.mainGoals.includes('check_revenue')
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">💰 Check Revenue</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Review overnight sales</div>
              </button>
              
              <button
                onClick={() => toggleMorningGoal('content_plan')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  morningRoutine.mainGoals.includes('content_plan')
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">📝 Plan Content</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Schedule today's posts</div>
              </button>
              
              <label className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                morningRoutine.includeWellness
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                <input
                  type="checkbox"
                  checked={morningRoutine.includeWellness}
                  onChange={(e) => setMorningRoutine(prev => ({ ...prev, includeWellness: e.target.checked }))}
                  className="sr-only"
                />
                <div className="font-semibold text-gray-900 dark:text-white">❤️ Wellness Check</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Review health metrics</div>
              </label>
              
              <label className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                morningRoutine.includeExercise
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                <input
                  type="checkbox"
                  checked={morningRoutine.includeExercise}
                  onChange={(e) => setMorningRoutine(prev => ({ ...prev, includeExercise: e.target.checked }))}
                  className="sr-only"
                />
                <div className="font-semibold text-gray-900 dark:text-white">🏃 Morning Exercise</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">15-30 min workout</div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
        <button
          onClick={() => router.push('/onboarding/product-setup')}
          className="px-4 sm:px-6 py-2.5 sm:py-3 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:scale-105 transition-all order-2 sm:order-1"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedPlatforms.length === 0}
          className={`px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg hover:shadow-2xl order-1 sm:order-2 ${
            selectedPlatforms.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Continue →
        </button>
      </div>

      {selectedPlatforms.length === 0 && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
          Please select at least one platform to continue
        </p>
      )}
    </div>
  );
}
