// Homepage - Landing for the platform
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, MessageCircle, Facebook, Instagram, Linkedin, Globe, Zap, Lock, Infinity, Bot, Building2, DollarSign, Video, Heart } from 'lucide-react';
import { isAuthenticated, getCurrentUser, setSelectedPlan, getPostLoginRoute } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const hasSession = isAuthenticated();
    setLoggedIn(hasSession);

    if (hasSession) {
      const user = getCurrentUser();
      const name = String(user?.fullName || user?.email || '').trim();
      setFirstName(name ? name.split(' ')[0] : '');
    }
  }, []);

  const handleStartTrial = () => {
    setSelectedPlan('Free Trial');
    router.push('/signup');
  };

  const handlePrimaryAction = () => {
    if (loggedIn) {
      router.push(getPostLoginRoute(getCurrentUser()));
      return;
    }

    handleStartTrial();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Veltrix
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="/pricing" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
              Pricing
            </a>
            {loggedIn ? (
              <button
                onClick={() => router.push(getPostLoginRoute(getCurrentUser()))}
                className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all shadow-lg"
              >
                {firstName ? `Dashboard (${firstName})` : 'Dashboard'}
              </button>
            ) : (
              <>
                <a href="/login" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                  Log In
                </a>
                <a href="/signup" className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all shadow-lg">
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 px-2">
            Your Complete Operating System
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-2 px-2">
            For <span className="text-blue-600 font-bold">Business</span> | <span className="text-purple-600 font-bold">Work</span> | <span className="text-pink-600 font-bold">Content</span> | <span className="text-green-600 font-bold">Life</span>
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 px-2">
            One platform for Business Owners, Employees, Content Creators & Individuals
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button onClick={handlePrimaryAction} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium hover:scale-105 transition-all shadow-lg hover:shadow-2xl text-center">
              {loggedIn ? 'Go to Dashboard →' : 'Start Free Trial →'}
            </button>
            <a href="/pricing" className="glass-button text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all shadow-lg text-center">
              View Pricing
            </a>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4">
            7 days free • No credit card required
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          <FeatureCard
            icon={Music}
            title="TikTok-Native"
            description="First-class TikTok integration. Lead forms, DMs, and auto-qualification built-in."
            highlight="Industry first"
          />
          <FeatureCard
            icon={Lock}
            title="No Vendor Lock-In"
            description="Own your data. Swap WhatsApp providers (Meta, Twilio, WATI) without code changes."
            highlight="Full control"
          />
          <FeatureCard
            icon={Infinity}
            title="Unlimited Complexity"
            description="No workflow limits. Build automations as complex as you need."
            highlight="Zero restrictions"
          />
          <FeatureCard
            icon={Bot}
            title="AI-Powered"
            description="GPT-4 powered lead qualification. Auto-detect intent, urgency, and quality."
            highlight="Smart automation"
          />
          <FeatureCard
            icon={Video}
            title="Content Studio"
            description="Script generator, content calendar, analytics - everything creators need."
            highlight="For creators"
          />
          <FeatureCard
            icon={Heart}
            title="Personal OS"
            description="Morning routines, health tracking, AI therapist - optimize your life."
            highlight="Life & work"
          />
          <FeatureCard
            icon={Building2}
            title="Multi-Tenant SaaS"
            description="White-label ready. Perfect for agencies managing multiple clients."
            highlight="Agency mode"
          />
          <FeatureCard
            icon={DollarSign}
            title="Cost Effective"
            description="No per-contact fees. Pay only for hosting. Built for African entrepreneurs."
            highlight="Own your infra"
          />
        </div>

        {/* Platform Support */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">All Platforms. One System.</h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <PlatformBadge name="TikTok" Icon={Music} color="bg-black" />
            <PlatformBadge name="WhatsApp" Icon={MessageCircle} color="bg-green-500" />
            <PlatformBadge name="Facebook" Icon={Facebook} color="bg-blue-600" />
            <PlatformBadge name="Instagram" Icon={Instagram} color="bg-pink-500" />
            <PlatformBadge name="LinkedIn" Icon={Linkedin} color="bg-blue-700" />
            <PlatformBadge name="Website" Icon={Globe} color="bg-gray-700" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg px-2">
            All enquiries → One unified inbox → Zero admin work
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
          <StatCard label="Platforms" value="6+" />
          <StatCard label="Workflow Limits" value="∞" />
          <StatCard label="Vendor Lock-In" value="0" />
          <StatCard label="Data Ownership" value="100%" />
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16 px-4">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready for Your Operating System?
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
            Join business owners, employees, and content creators using Veltrix to achieve more
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={handlePrimaryAction} className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-medium hover:scale-105 transition-all shadow-lg hover:shadow-2xl">
              {loggedIn ? 'Open Dashboard →' : 'Start Free Trial →'}
            </button>
            {!loggedIn && (
              <a href="/login" className="inline-block glass-button text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all shadow-lg">
                Log In
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, highlight }: { icon: any; title: string; description: string; highlight: string }) {
  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">{description}</p>
      <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xs sm:text-sm font-medium">{highlight}</span>
    </div>
  )
}

function PlatformBadge({ name, Icon, color }: { name: string; Icon: any; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ${color} text-white text-sm sm:text-base font-medium shadow-lg hover:scale-105 transition-all`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>{name}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-all">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">{value}</div>
      <div className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}
