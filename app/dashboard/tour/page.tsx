// Interactive Dashboard Tour
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, MessageCircle, Users, Package, Zap, BarChart3, 
  ArrowRight, ArrowLeft, X, CheckCircle, Sparkles, Heart, Video, TrendingUp, Target, Volume2, VolumeX
} from 'lucide-react';

interface TourStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  highlightArea: string;
  route: string;
  color: string;
  audioText: string;
}

export default function DashboardTourPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [tourStarted, setTourStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 1,
      title: 'Welcome to Your Personal OS! 🎉',
      description: 'Buckle up! You\'re about to discover your new command center that manages EVERYTHING - business, wellness, content, and life goals. Think of it as having a personal assistant, fitness coach, and business manager all rolled into one smart dashboard!',
      icon: Home,
      highlightArea: 'overview',
      route: '/dashboard',
      color: 'from-blue-600 to-purple-600',
      audioText: 'Welcome to Your Personal Operating System! Buckle up! You are about to discover your new command center that manages everything: business, wellness, content, and life goals. Think of it as having a personal assistant, fitness coach, and business manager all rolled into one smart dashboard!'
    },
    {
      id: 2,
      title: 'Autopilot Productivity Engine 🚀',
      description: 'This is YOUR secret weapon! The Autopilot Engine intelligently selects tasks for you based on your energy levels, burnout risk, and revenue impact. It calculates priority automatically (Urgency × Impact × Energy) so you always work on what matters most. Track projects with health metrics, see earning potential per task, and let AI plan your perfect day. Wellness guardrails protect you from burnout - the system limits tasks when you\'re overwhelmed. Smart productivity that respects your humanity!',
      icon: Target,
      highlightArea: 'productivity',
      route: '/dashboard/productivity',
      color: 'from-purple-600 to-blue-600',
      audioText: 'Autopilot Productivity Engine: This is your secret weapon! The Autopilot Engine intelligently selects tasks for you based on your energy levels, burnout risk, and revenue impact. It calculates priority automatically so you always work on what matters most. Track projects with health metrics, see earning potential per task, and let AI plan your perfect day. Wellness guardrails protect you from burnout. Smart productivity that respects your humanity!'
    },
    {
      id: 3,
      title: 'Unified Inbox - Never Miss a Message 📨',
      description: 'Your customers message you on TikTok at 2am? WhatsApp during lunch? Instagram while you sleep? No problem! All messages from EVERY platform (TikTok, WhatsApp, Facebook, Instagram, LinkedIn, Website) flow into ONE place. Reply once, connect everywhere. It\'s like magic, but it\'s technology! 🪄',
      icon: MessageCircle,
      highlightArea: 'inbox',
      route: '/dashboard/inbox',
      color: 'from-purple-600 to-pink-600',
      audioText: 'Unified Inbox: Never Miss a Message! Your customers message you on TikTok at 2 AM? WhatsApp during lunch? Instagram while you sleep? No problem! All messages from every platform flow into ONE place. Reply once, connect everywhere. Its like magic, but its technology!'
    },
    {
      id: 4,
      title: 'Lead Management - AI-Powered Sales 🎯',
      description: 'Meet your AI sales assistant! It automatically sorts leads into Hot 🔥, Warm 🌤️, and Cold ❄️ categories. Hot leads get priority alerts so you never miss a ready-to-buy customer. The AI analyzes conversation quality, response time, and buying signals. Click on any conversation and jump straight to the lead profile. It\'s like having a mind reader for sales!',
      icon: Users,
      highlightArea: 'leads',
      route: '/dashboard/leads',
      color: 'from-pink-600 to-red-600',
      audioText: 'Lead Management: AI-Powered Sales! Meet your AI sales assistant! It automatically sorts leads into Hot, Warm, and Cold categories. Hot leads get priority alerts so you never miss a ready-to-buy customer. The AI analyzes conversation quality, response time, and buying signals. Its like having a mind reader for sales!'
    },
    {
      id: 5,
      title: 'Conversations Hub - Organized Messaging 💬',
      description: 'New! Filter conversations by status with smart tabs: All, Active (hot discussions), and Waiting (needs follow-up). Every conversation shows platform icons, unread counts, and quick actions. Click "View Lead" to see the full profile instantly. Never lose track of important conversations again. It\'s inbox zero, but actually achievable!',
      icon: MessageCircle,
      highlightArea: 'conversations',
      route: '/dashboard/conversations',
      color: 'from-green-600 to-blue-600',
      audioText: 'Conversations Hub: Organized Messaging! Filter conversations by status with smart tabs: All, Active, and Waiting. Every conversation shows platform icons, unread counts, and quick actions. Click View Lead to see the full profile instantly. Never lose track of important conversations again. Its inbox zero, but actually achievable!'
    },
    {
      id: 6,
      title: 'Personal Wellness OS 💚',
      description: 'Your health is your wealth! Track your wellness score (currently 87% - nice!), set up morning routines, monitor sleep quality, and connect your smartwatch for automatic tracking. The AI wellness coach gives you personalized tips. Plus, set sleep and wake-up alarms to maintain a healthy schedule. Your burnout risk feeds into the Productivity Engine to protect your mental health. Because a healthy you = a productive you!',
      icon: Heart,
      highlightArea: 'wellness',
      route: '/dashboard/wellness',
      color: 'from-green-600 to-teal-600',
      audioText: 'Personal Wellness Operating System! Your health is your wealth! Track your wellness score, set up morning routines, monitor sleep quality, and connect your smartwatch for automatic tracking. The AI wellness coach gives you personalized tips. Plus, set sleep and wake-up alarms to maintain a healthy schedule. Because a healthy you equals a productive you!'
    },
    {
      id: 7,
      title: 'Content Studio - Creator\'s Paradise 🎬',
      description: 'Calling all creators! Script generator with AI, video idea suggestions, trend alerts, and performance analytics across ALL platforms. NEW: Click "+ Add Content" in the calendar to schedule posts across platforms! Track views, engagement, and revenue from TikTok, YouTube, Instagram in one dashboard. Repurpose content, manage brand deals, and watch your creator empire grow. It\'s your personal film studio meets marketing agency!',
      icon: Video,
      highlightArea: 'content',
      route: '/dashboard/content-studio',
      color: 'from-pink-600 to-purple-600',
      audioText: 'Content Studio: Creators Paradise! Script generator with AI, video idea suggestions, trend alerts, and performance analytics across all platforms. Click Add Content in the calendar to schedule posts across platforms! Track views, engagement, and revenue from TikTok, YouTube, Instagram in one dashboard. Its your personal film studio meets marketing agency!'
    },
    {
      id: 8,
      title: 'Performance & Money Motivation 💰',
      description: 'Set financial goals, track multiple income streams, and get AI-powered money motivation! See your progress toward goals with visual charts, celebrate milestones, and get productivity tips based on YOUR peak performance times. The system learns when you\'re most productive (spoiler: probably 9-11am!) and integrates with the Autopilot Engine to schedule tasks optimally.',
      icon: TrendingUp,
      highlightArea: 'performance',
      route: '/dashboard/performance',
      color: 'from-yellow-600 to-orange-600',
      audioText: 'Performance and Money Motivation! Set financial goals, track multiple income streams, and get AI-powered money motivation! See your progress toward goals with visual charts, celebrate milestones, and get productivity tips based on your peak performance times. The system learns when youre most productive and integrates with the Autopilot Engine to schedule tasks optimally.'
    },
    {
      id: 9,
      title: 'Product Catalog - Smart Inventory 📦',
      description: 'Manage all your products and services with NEW smart tabs! Switch between All, Products Only, or Services Only for focused views. Set prices, track inventory, add images, and sync across platforms automatically. When you update a product here, it updates EVERYWHERE. No more logging into 5 different platforms to change one price. That\'s the power of centralization!',
      icon: Package,
      highlightArea: 'products',
      route: '/dashboard/products',
      color: 'from-orange-600 to-red-600',
      audioText: 'Product Catalog: Smart Inventory! Manage all your products and services with smart tabs! Switch between All, Products Only, or Services Only for focused views. Set prices, track inventory, add images, and sync across platforms automatically. When you update a product here, it updates everywhere. Thats the power of centralization!'
    },
    {
      id: 10,
      title: 'Finance & Expense Tracking 💸',
      description: 'NEW: Full expense tracking is here! Click "+ Add Expense" to log business costs by category (Marketing, Software, Office, Travel, Equipment). See total expenses, transaction counts, and average spending at a glance. Track revenue streams, manage invoices, and generate financial reports. Know exactly where every rand goes and comes from. Financial clarity = business growth!',
      icon: BarChart3,
      highlightArea: 'finance',
      route: '/dashboard/finance',
      color: 'from-emerald-600 to-green-600',
      audioText: 'Finance and Expense Tracking! Full expense tracking is here! Click Add Expense to log business costs by category: Marketing, Software, Office, Travel, Equipment. See total expenses, transaction counts, and average spending at a glance. Track revenue streams, manage invoices, and generate financial reports. Know exactly where every rand goes and comes from. Financial clarity equals business growth!'
    },
    {
      id: 11,
      title: 'Automations - Work While You Sleep ⚡',
      description: 'This is where the REAL magic happens! Set up workflows that run automatically: Send welcome messages to new followers, qualify leads based on keywords, auto-respond with product info, schedule wellness reminders, even send invoices! Currently running: Morning Wellness Reminder (312 times!), Low Activity Alerts, and more. Set it once, benefit forever!',
      icon: Zap,
      highlightArea: 'automations',
      route: '/dashboard/automations',
      color: 'from-yellow-600 to-green-600',
      audioText: 'Automations: Work While You Sleep! This is where the real magic happens! Set up workflows that run automatically: Send welcome messages to new followers, qualify leads based on keywords, auto-respond with product info, schedule wellness reminders, even send invoices! Set it once, benefit forever!'
    },
    {
      id: 12,
      title: 'Analytics & Reports - Data-Driven Decisions 📊',
      description: 'Numbers don\'t lie! See real-time performance across all platforms. Conversion rates, revenue trends, platform comparisons, engagement analytics, and custom reports. Visual charts make complex data simple. Discover which platform brings the most revenue, what content performs best, and where to focus your energy for maximum ROI!',
      icon: BarChart3,
      highlightArea: 'analytics',
      route: '/dashboard/analytics',
      color: 'from-violet-600 to-purple-600',
      audioText: 'Analytics and Reports: Data-Driven Decisions! Numbers dont lie! See real-time performance across all platforms. Conversion rates, revenue trends, platform comparisons, engagement analytics, and custom reports. Visual charts make complex data simple. Discover which platform brings the most revenue, what content performs best, and where to focus your energy for maximum return on investment!'
    },
    {
      id: 13,
      title: 'You\'re Ready to Dominate! 🚀',
      description: 'Congratulations! You\'ve just learned about YOUR complete operating system. Autopilot productivity + Business tools + Personal wellness + Content creation + Financial tracking = Ultimate success formula. Remember: This isn\'t just software, it\'s your partner in success. Start by running Autopilot to plan your day, add one expense, schedule one content piece. Small steps, massive impact. Now go build your empire! 💪',
      icon: CheckCircle,
      highlightArea: 'complete',
      route: '/dashboard',
      color: 'from-green-600 to-emerald-600',
      audioText: 'Youre Ready to Dominate! Congratulations! Youve just learned about your complete operating system. Autopilot productivity plus Business tools plus Personal wellness plus Content creation plus Financial tracking equals the Ultimate success formula. Remember: This isnt just software, its your partner in success. Start by running Autopilot to plan your day, add one expense, schedule one content piece. Small steps, massive impact. Now go build your empire!'
    }
  ];

  // Audio narration functions
  const speak = (text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      stopSpeaking();
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
      // Start speaking current step
      if (currentTourStep) {
        speak(currentTourStep.audioText);
      }
    }
  };

  // Auto-play audio when step changes if audio is enabled
  useEffect(() => {
    if (audioEnabled && tourStarted && currentTourStep) {
      speak(currentTourStep.audioText);
    }
    
    return () => {
      stopSpeaking();
    };
  }, [currentStep, audioEnabled, tourStarted]);

  const handleStartTour = () => {
    setTourStarted(true);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Don't navigate away during tour, just update the step
      // Navigation happens in the real dashboard sidebar
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Don't navigate away during tour
    }
  };

  const handleSkipTour = () => {
    stopSpeaking(); // Stop audio when skipping
    // Mark tour as skipped
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const updatedUser = {
      ...userData,
      tourCompleted: false,
      tourSkipped: true
    };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    router.push('/dashboard');
  };

  const handleCompleteTour = () => {
    stopSpeaking(); // Stop audio when completing
    // Mark tour as completed
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const updatedUser = {
      ...userData,
      tourCompleted: true,
      tourSkipped: false
    };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    router.push('/dashboard');
  };

  const currentTourStep = tourSteps[currentStep];
  const IconComponent = currentTourStep?.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (!tourStarted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 max-w-2xl text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Take the Ultimate Tour! 🚀
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            Discover your complete Personal OS! We'll show you business tools + wellness tracking + content creation + goal management. Just 5 minutes to unlock your potential!
          </p>
          
          {/* Feature Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Unified Inbox</p>
            </div>
            <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Wellness OS</p>
            </div>
            <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
              <Video className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Content Studio</p>
            </div>
            <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Automations</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={handleStartTour}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Start Tour (5 min)
            </button>
            <button
              onClick={handleSkipTour}
              className="px-6 sm:px-8 py-3 sm:py-4 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Tour Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Tour Card - Responsive with max-height */}
        <div className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAudio}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    audioEnabled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'glass-button text-gray-700 dark:text-gray-300'
                  }`}
                  title={audioEnabled ? 'Disable audio narration' : 'Enable audio narration'}
                >
                  {audioEnabled ? (
                    <>
                      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      {isSpeaking ? 'Speaking...' : 'Audio On'}
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      Audio Off
                    </>
                  )}
                </button>
                <button
                  onClick={handleSkipTour}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Skip Tour
                </button>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tour Content */}
          <div className="text-center mb-6 sm:mb-8">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r ${currentTourStep.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse`}>
              <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {currentTourStep.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed px-4">
              {currentTourStep.description}
            </p>
          </div>

          {/* Educational Tips with Emojis */}
          {currentStep === 1 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-4 mb-6 bg-purple-50 dark:bg-purple-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <strong>💡 Pro Tip:</strong> The average person checks 5-7 platforms daily for messages. You just need ONE!
              </p>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-4 mb-6 bg-pink-50 dark:bg-pink-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <strong>🎯 Did you know?</strong> AI can predict buying intent with 89% accuracy by analyzing message tone and keywords!
              </p>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-4 mb-6 bg-green-50 dark:bg-green-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <strong>💚 Fun Fact:</strong> Users who track wellness score 43% higher in productivity. Healthy body = Healthy business!
              </p>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-4 mb-6 bg-pink-50 dark:bg-pink-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <strong>🎬 Creator Stats:</strong> Consistent posting (3x/week) increases audience growth by 312%. Let's automate that!
              </p>
            </div>
          )}
          
          {currentStep === 5 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-4 mb-6 bg-orange-50 dark:bg-orange-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <strong>💰 Money Hack:</strong> Visualizing goals makes you 42% more likely to achieve them. That's science!
              </p>
            </div>
          )}
          
          {currentStep === 7 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <strong>⚡ Automation Magic:</strong> Average user saves 18.2 hours per week with automations. That's like getting an extra day!
              </p>
            </div>
          )}
          
          {currentStep === 9 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-4 mb-6 bg-indigo-50 dark:bg-indigo-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <strong>🎯 Goal Mastery:</strong> Breaking big goals into milestones increases completion rate from 14% to 76%!
              </p>
            </div>
          )}

          {/* Visual Hint */}
          {currentStep > 0 && currentStep < tourSteps.length - 1 && (
            <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
                📍 <strong>Where to find it:</strong> Check the sidebar menu for{' '}
                <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${currentTourStep.color} text-white rounded-lg text-xs font-semibold`}>
                  <IconComponent className="w-3 h-3" />
                  {currentTourStep.title.split('-')[0].split('!')[0].trim()}
                </span>
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 text-gray-700 dark:text-gray-300'
              }`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Previous
            </button>

            {currentStep === tourSteps.length - 1 ? (
              <button
                onClick={handleCompleteTour}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Complete Tour
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Quick Skip Link */}
          {currentStep < tourSteps.length - 1 && (
            <div className="text-center mt-6">
              <button
                onClick={handleCompleteTour}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
              >
                I already know this, take me to my dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
