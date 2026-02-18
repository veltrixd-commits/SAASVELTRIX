// Dashboard Homepage - Overview
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import AIChatbot from '@/components/AIChatbot';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Sparkles, X, ArrowRight, Heart, Video, TrendingUp, Users, Zap, Target, MessageSquare, DollarSign, CreditCard } from 'lucide-react';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';
import { getSalesHistory } from '@/lib/commerceData';
import { recordCtaClick } from '@/lib/analytics';

function readStoredArray<T = any>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const slugify = (value: string) =>
  (value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cta');

type NavigateAnalytics = {
  id?: string;
  label?: string;
  surface?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [showTourBanner, setShowTourBanner] = useState(false);
  const [showAutopilotBanner, setShowAutopilotBanner] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState('');
  const [stats, setStats] = useState({
    totalLeads: 10,
    hotLeads: 3,
    activeConversations: 5,
    runningAutomations: 2,
    totalRevenue: 9496,
    pendingOrders: 2,
    unreadMessages: 8,
    wellnessScore: 87,
    contentPublished: 12,
    motivationLevel: 92,
  });
  const isServer = typeof window === 'undefined';

  useEffect(() => {
    // Auto-hide welcome banner after 2 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcomeBanner(false);
    }, 2000);

    // Load user data and settings
    const storedUser = getCurrentUser();
    const settingsStored = localStorage.getItem('userSettings');
    
    if (storedUser) {
      setUserData(storedUser);

      if (!storedUser.tourStarted && !storedUser.tourSkipped) {
        setShowTourBanner(true);
      }
    }

    return () => clearTimeout(welcomeTimer);

    const leads = readStoredArray<any>('veltrix_leads');
    const automations = readStoredArray<any>('veltrix_automations');
    const orders = readStoredArray<any>('orderHistory');
    const inboxMessages = readStoredArray<any>('veltrix_engagement_inbox');
    const automationMessages = readStoredArray<any>('veltrix_automation_message_queue');
    const automationEmail = readStoredArray<any>('veltrix_automation_email_queue');
    const automationComments = readStoredArray<any>('veltrix_automation_comment_reply_queue');
    const automationReviews = readStoredArray<any>('veltrix_automation_review_reply_queue');
    const sales = getSalesHistory();

    const totalLeads = leads.length;
    const hotLeads = leads.filter((lead) => {
      const status = String(lead?.status || '').toLowerCase();
      return status.includes('hot') || Number(lead?.score || 0) >= 80;
    }).length;

    const unreadMessages = inboxMessages.filter((msg) => !msg?.isRead).length
      + automationMessages.length
      + automationEmail.length
      + automationComments.length
      + automationReviews.length;

    const runningAutomations = automations.filter((automation) => automation?.isActive).length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const pendingOrders = orders.filter((order) => {
      const status = String(order?.status || '').toLowerCase();
      return status === 'pending' || status === 'processing';
    }).length;

    const activeConversations = new Set(
      inboxMessages
        .map((msg) => msg?.sender || msg?.leadName || msg?.email)
        .filter(Boolean)
    ).size;

    setStats((prev) => ({
      ...prev,
      totalLeads,
      hotLeads,
      unreadMessages,
      runningAutomations,
      totalRevenue,
      pendingOrders,
      activeConversations,
    }));

    if (settingsStored) {
      try {
        const parsed = JSON.parse(settingsStored);
        setUserSettings(parsed);
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }

    const deniedMessage = localStorage.getItem('accessDeniedMessage');
    if (deniedMessage) {
      setAccessDeniedMessage(deniedMessage);
      localStorage.removeItem('accessDeniedMessage');
    }
  }, []);

  useEffect(() => {
    const routesToPrefetch = [
      '/dashboard/leads',
      '/dashboard/leads?status=HOT',
      '/dashboard/delivery',
      '/dashboard/invoices',
      '/dashboard/automations',
      '/dashboard/pos'
    ];

    routesToPrefetch.forEach((path) => router.prefetch(path));
  }, [router]);

  const navigateTo = useCallback((path: string, analytics?: NavigateAnalytics) => {
    recordCtaClick({
      id: analytics?.id || `cta:${path}`,
      label: analytics?.label || `Navigate to ${path}`,
      destination: path,
      surface: analytics?.surface || 'dashboard',
      metadata: analytics?.metadata,
    });
    router.push(path);
  }, [router]);

  const handleTakeTour = useCallback(() => {
    navigateTo('/dashboard/tour', {
      id: 'dashboard-tour-banner',
      label: 'Start the dashboard tour',
      surface: 'dashboard-tour-banner',
    });
  }, [navigateTo]);

  const handleDismissTourBanner = useCallback(() => {
    setShowTourBanner(false);
    updateCurrentUser({ tourSkipped: true });
  }, []);

  const getRecommendedActions = useCallback(() => {
    if (!userSettings) return [];
    
    const actions = [];
    
    if (userSettings.focusAreas.includes('wellness')) {
      actions.push({
        title: 'Check Your Wellness Score',
        description: `${stats.wellnessScore}% health score today`,
        icon: <Heart className="w-5 h-5 text-green-600" />,
        href: '/dashboard/wellness',
        color: 'from-green-500 to-teal-500'
      });
    }
    
    if (userSettings.focusAreas.includes('content')) {
      actions.push({
        title: 'Content Studio',
        description: `${stats.contentPublished} videos this month`,
        icon: <Video className="w-5 h-5 text-pink-600" />,
        href: '/dashboard/content-studio',
        color: 'from-pink-500 to-purple-500'
      });
    }
    
    if (userSettings.focusAreas.includes('leads')) {
      actions.push({
        title: 'New Leads',
        description: `${stats.hotLeads} hot leads waiting`,
        icon: <Users className="w-5 h-5 text-blue-600" />,
        href: '/dashboard/leads',
        color: 'from-blue-500 to-indigo-500'
      });
    }
    
    if (userSettings.focusAreas.includes('automation')) {
      actions.push({
        title: 'Active Automations',
        description: `${stats.runningAutomations} automations running`,
        icon: <Zap className="w-5 h-5 text-yellow-600" />,
        href: '/dashboard/automations',
        color: 'from-yellow-500 to-orange-500'
      });
    }
    
    if (userSettings.focusAreas.includes('finance')) {
      actions.push({
        title: 'Performance Goals',
        description: `${stats.motivationLevel}% motivation level`,
        icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
        href: '/dashboard/performance',
        color: 'from-purple-500 to-pink-500'
      });
    }
    
    return actions.slice(0, 4);
  }, [userSettings, stats]);

  const userGreeting = useMemo(() => {
    const base = String(userData?.fullName || userData?.name || userData?.email || '').trim();
    return base ? base.split(' ')[0] : 'there';
  }, [userData]);
  const recommendedActions = useMemo(() => getRecommendedActions(), [getRecommendedActions]);
  const outcomePlaybooks = useMemo(() => {
    const revenueTarget = 12000;
    const wellnessFloor = 80;
    const automationGoal = 4;
    const revenueGap = Math.max(revenueTarget - stats.totalRevenue, 0);

    return [
      {
        key: 'revenue',
        label: 'Revenue',
        metric: `R${stats.totalRevenue.toLocaleString()}`,
        status: stats.totalRevenue >= revenueTarget ? 'On pace' : 'Leak detected',
        statusTone: stats.totalRevenue >= revenueTarget ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
        directive: stats.totalRevenue >= revenueTarget
          ? 'Upsell flow is outperforming—approve the bundle expansion Autopilot staged.'
          : `Autopilot flagged R${revenueGap.toLocaleString()} missing. Approve invoice chase plus upsell calls now.`,
        autopilotNote: 'Autopilot: finance chase + upsell',
        href: stats.totalRevenue >= revenueTarget ? '/dashboard/automations' : '/dashboard/invoices',
        cta: stats.totalRevenue >= revenueTarget ? 'Scale offer flow' : 'Recover cash now',
        icon: '💰',
      },
      {
        key: 'growth',
        label: 'Growth',
        metric: `${stats.hotLeads} hot leads`,
        status: stats.hotLeads >= 3 ? 'Act now' : 'Feed intake',
        statusTone: stats.hotLeads >= 3 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800',
        directive: stats.hotLeads >= 3
          ? `Autopilot drafted follow-ups. Run the closing script for ${stats.hotLeads} leads before lunch.`
          : 'Lead flow is light. Duplicate the TikTok capture recipe and relaunch it.',
        autopilotNote: 'Autopilot: follow-up + capture',
        href: stats.hotLeads >= 3 ? '/dashboard/leads?status=HOT' : '/dashboard/automations',
        cta: stats.hotLeads >= 3 ? 'Clear hot queue' : 'Launch capture flow',
        icon: '🚀',
      },
      {
        key: 'wellness',
        label: 'Wellness',
        metric: `${stats.wellnessScore}%`,
        status: stats.wellnessScore >= wellnessFloor ? 'Stable' : 'Overload risk',
        statusTone: stats.wellnessScore >= wellnessFloor ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800',
        directive: stats.wellnessScore >= wellnessFloor
          ? 'Keep energy high. Approve the recovery block Autopilot pinned tonight.'
          : 'Stress trend detected. Autopilot wants to move two meetings and inject a reset block.',
        autopilotNote: 'Autopilot: energy guardrails',
        href: '/dashboard/wellness',
        cta: stats.wellnessScore >= wellnessFloor ? 'Lock recovery plan' : 'Rebalance workload',
        icon: '🧠',
      },
      {
        key: 'leverage',
        label: 'Leverage',
        metric: `${stats.runningAutomations} automations`,
        status: stats.runningAutomations >= automationGoal ? 'Coverage solid' : 'Manual work detected',
        statusTone: stats.runningAutomations >= automationGoal ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800',
        directive: stats.runningAutomations >= automationGoal
          ? 'Connect finance and delivery flows so wins auto-notify ops.'
          : 'Turn on the abandoned cart + handoff automations to kill the busy-work.',
        autopilotNote: 'Autopilot: system sync',
        href: '/dashboard/automations',
        cta: stats.runningAutomations >= automationGoal ? 'Link more systems' : 'Activate automations',
        icon: '🛠️',
      },
    ];
  }, [stats]);
  const pipelineDirective = useMemo(() => {
    const hasDealCongestion = stats.hotLeads >= 3;
    return hasDealCongestion
      ? {
          status: 'Deals waiting',
          statusTone: 'bg-red-100 text-red-800',
          summary: 'Autopilot spotted buyers stuck before proposal. Run the closing ladder now.',
          autopilotNote: 'Autopilot: closing ladder queued',
          href: '/dashboard/pipelines',
          cta: 'Push deals forward',
        }
      : {
          status: 'Top-funnel light',
          statusTone: 'bg-blue-100 text-blue-800',
          summary: 'Lead intake is soft. Duplicate the TikTok capture recipe and redeploy.',
          autopilotNote: 'Autopilot: capture boost staged',
          href: '/dashboard/automations',
          cta: 'Relaunch capture flow',
        };
  }, [stats.hotLeads]);
  const signalDirective = useMemo(() => {
    const backlog = stats.unreadMessages >= 6 || stats.activeConversations >= 5;
    return backlog
      ? {
          status: 'Reply debt building',
          statusTone: 'bg-amber-100 text-amber-800',
          summary: 'Route AI replies now so signals never age past 15 minutes.',
          autopilotNote: 'Autopilot: reply queue active',
          href: '/dashboard/inbox',
          cta: 'Clear signal debt',
        }
      : {
          status: 'Signals under control',
          statusTone: 'bg-emerald-100 text-emerald-800',
          summary: 'Autopilot is holding the inbox. Use the feed to approve escalations only.',
          autopilotNote: 'Autopilot: monitoring live feed',
          href: '/dashboard/automations',
          cta: 'Review escalations',
        };
  }, [stats.unreadMessages, stats.activeConversations]);
  const hotLeadDirective = useMemo(() => {
    if (stats.hotLeads >= 3) {
      return {
        status: 'Deal fire',
        statusTone: 'bg-red-100 text-red-800',
        summary: `Autopilot stacked the closing ladder for ${stats.hotLeads} buyers—run it before noon.`,
        autopilotNote: 'Autopilot: closing ladder armed',
        href: '/dashboard/leads?status=HOT',
        cta: 'Run closing ladder',
      };
    }

    if (stats.hotLeads > 0) {
      return {
        status: 'Nurture live',
        statusTone: 'bg-orange-100 text-orange-800',
        summary: `Keep heat on the ${stats.hotLeads} warm leads—send the personalized Loom Autopilot drafted.`,
        autopilotNote: 'Autopilot: nurture pulses queued',
        href: '/dashboard/leads?status=WARM',
        cta: 'Send nurture pulse',
      };
    }

    return {
      status: 'Queue empty',
      statusTone: 'bg-gray-200 text-gray-800',
      summary: 'No hot leads yet. Duplicate the TikTok capture recipe and redeploy.',
      autopilotNote: 'Autopilot: capture boost ready',
      href: '/dashboard/automations',
      cta: 'Launch capture flow',
    };
  }, [stats.hotLeads]);
  const tutorialDirective = useMemo(() => {
    const systemSynced = stats.runningAutomations >= 4 && stats.totalLeads >= 10;
    return systemSynced
      ? {
          status: 'System synced',
          statusTone: 'bg-emerald-200/70 text-emerald-900',
          summary: 'Channels, automations, and delivery already looped—extend the OS to finance next.',
          autopilotNote: 'Autopilot: OS walkthrough complete, expansion path staged',
          href: '/dashboard/automations',
          cta: 'Chain more systems',
        }
      : {
          status: 'Sync pending',
          statusTone: 'bg-amber-200/70 text-amber-900',
          summary: 'Veltrix still needs your channel stack. Run the walkthrough and let Autopilot wire it.',
          autopilotNote: 'Autopilot: OS walkthrough waiting for approval',
          href: '/dashboard/tour',
          cta: 'Run OS walkthrough',
        };
  }, [stats.runningAutomations, stats.totalLeads]);

  // Handle metric click to show detailed modal - memoized
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  const handleModalNavigate = useCallback((path: string, analytics?: NavigateAnalytics) => {
    closeModal();
    navigateTo(path, analytics || {
      id: `dashboard-metric-modal-${path}`,
      label: `Modal CTA → ${path}`,
      surface: 'dashboard-metric-modal',
    });
  }, [closeModal, navigateTo]);

  const handleMetricClick = useCallback((metricType: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveModal(metricType);
    
    // Load detailed data based on metric type
    switch(metricType) {
      case 'leads':
        setModalData({
          total: stats.totalLeads,
          breakdown: [
            { status: 'Hot', count: 3, color: 'red', icon: '🔥' },
            { status: 'Warm', count: 4, color: 'orange', icon: '🌡️' },
            { status: 'Cold', count: 3, color: 'blue', icon: '❄️' },
          ],
          recent: [
            { name: 'Sarah Johnson', source: 'TikTok', score: 95, time: '5 mins ago' },
            { name: 'Michael Chen', source: 'WhatsApp', score: 88, time: '12 mins ago' },
            { name: 'Emma Wilson', source: 'Instagram', score: 82, time: '1 hour ago' },
          ]
        });
        break;
      case 'messages':
        setModalData({
          total: stats.unreadMessages,
          platforms: [
            { name: 'WhatsApp', count: 3, platform: 'WHATSAPP', path: '/dashboard/inbox?platform=whatsapp' },
            { name: 'TikTok', count: 2, platform: 'TIKTOK', path: '/dashboard/leads?source=tiktok' },
            { name: 'Instagram', count: 2, platform: 'INSTAGRAM', path: '/dashboard/leads?source=instagram' },
            { name: 'Facebook', count: 1, platform: 'FACEBOOK', path: '/dashboard/leads?source=facebook' },
          ]
        });
        break;
      case 'revenue':
        setModalData({
          total: stats.totalRevenue,
          breakdown: [
            { category: 'Product Sales', amount: 6500, percentage: 69 },
            { category: 'Services', amount: 2000, percentage: 21 },
            { category: 'Subscriptions', amount: 996, percentage: 10 },
          ],
          trend: '+45% vs last month'
        });
        break;
    }
  }, [stats]);

  if (isServer) {
    return null;
  }

  return (
    <div className="space-y-6">
      {accessDeniedMessage && (
        <div className="glass-card rounded-xl p-4 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 flex items-start justify-between gap-3">
          <p className="text-sm text-amber-800 dark:text-amber-300">{accessDeniedMessage}</p>
          <button
            onClick={() => setAccessDeniedMessage('')}
            className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Personalized Welcome Header - Auto-hides after 2 seconds */}
      {showWelcomeBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl glass-card shadow-2xl p-6 sm:p-8 text-white hover:shadow-3xl transition-all animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Command center live, {userGreeting}.</h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Noise already triaged—grab the next fire and move.
          </p>
        </div>
      )}

      {/* Autopilot Banner - New Primary Entry */}
      {showAutopilotBanner && (
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 animate-slideIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                ✨ Autopilot staged today’s run
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Decision tax slows the morning. Open the sequence, follow the order, and clear the deck without guesswork.
              </p>
              <button
                onClick={() => navigateTo('/dashboard/today', {
                  id: 'dashboard-autopilot-run',
                  label: 'Execute run sheet',
                  surface: 'autopilot-banner',
                })}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Execute run sheet
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowAutopilotBanner(false)}
              className="p-2 glass-button rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Setup Card for New Users */}
      {!userSettings && (
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-300 dark:border-orange-700 animate-slideIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🎯 Targets missing means no prioritization
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Veltrix can’t stack the work without a goalpost. Spend one minute telling the OS what to grow.
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/dashboard/settings', {
                    id: 'dashboard-targets-lock',
                    label: 'Lock targets CTA',
                    surface: 'dashboard-quick-setup',
                  });
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Lock targets
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Actions Based on Focus Areas */}
      {recommendedActions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Focus zones—clear them now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedActions.map((action, index) => (
              <button
                type="button"
                key={action.title}
                onClick={() =>
                  navigateTo(action.href, {
                    id: `focus-zone-${slugify(action.title)}`,
                    label: `Focus zone → ${action.title}`,
                    surface: 'dashboard-focus-zones',
                    metadata: { order: index + 1 },
                  })
                }
                className="glass-card rounded-xl p-6 hover:scale-105 transition-all group cursor-pointer text-left"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm font-medium">
                  Open <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Directive Outcome Playbooks */}
      <div className="glass-card rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Outcome playbooks</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Every metric comes with the next move—no naked data, no guesswork.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
            Autopilot staged
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomePlaybooks.map((playbook) => (
            <div key={playbook.key} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 glass-button">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>{playbook.icon}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{playbook.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{playbook.metric}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${playbook.statusTone}`}>
                  {playbook.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-snug">
                {playbook.directive}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {playbook.autopilotNote}
                </span>
                <button
                  type="button"
                  onClick={() => navigateTo(playbook.href, {
                    id: `playbook-${playbook.key}`,
                    label: `Outcome playbook → ${playbook.label}`,
                    surface: 'dashboard-outcome-playbooks',
                    metadata: { cta: playbook.cta, status: playbook.status },
                  })}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-300 inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  {playbook.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tour Banner */}
      {showTourBanner && (
        <div className="glass-card rounded-2xl p-6 border-2 border-blue-500 relative">
          <button
            onClick={handleDismissTourBanner}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-start gap-4 pr-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Lost? Run the three-minute tour.
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Stop guessing where leads, automations, and sales live. The walkthrough shows every switch you need to flip.
              </p>
              <button
                onClick={handleTakeTour}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Start the tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Leads captured"
          value={stats.totalLeads}
          change="+20%"
          icon="👥"
          positive
          href="/dashboard/leads"
          bgColor="from-blue-500 to-blue-600"
          onClick={(e: React.MouseEvent) => handleMetricClick('leads', e)}
          direction="Autopilot tagged every lead and drafted replies—review and approve responses."
          actionLabel="Review intake order"
        />
        <StatCard
          title="Hot leads waiting"
          value={stats.hotLeads}
          change="+3 new"
          icon="🔥"
          positive
          href="/dashboard/leads?status=HOT"
          bgColor="from-red-500 to-orange-600"
          onClick={() => navigateTo('/dashboard/leads?status=HOT', {
            id: 'stat-hot-leads',
            label: 'Stat card → Hot leads',
            surface: 'dashboard-stat-grid',
            metadata: { value: stats.hotLeads },
          })}
          direction="Pull the closing script Autopilot staged for these buyers."
          actionLabel="Run closing stack"
        />
        <StatCard
          title="Unanswered messages"
          value={stats.unreadMessages}
          change="5 platforms"
          icon="💬"
          href="/dashboard/inbox?status=unread"
          bgColor="from-green-500 to-green-600"
          onClick={(e: React.MouseEvent) => handleMetricClick('messages', e)}
          direction="Queue AI replies to keep SLA under five minutes."
          actionLabel="Approve reply queue"
        />
        <StatCard
          title="Live revenue"
          value={`R${stats.totalRevenue.toLocaleString()}`}
          change={`${stats.totalRevenue > 0 ? '+' : ''}${((stats.totalRevenue / 10000) * 100).toFixed(1)}%`}
          icon="💰"
          positive={stats.totalRevenue > 0}
          href="/dashboard/finance"
          bgColor="from-purple-500 to-purple-600"
          onClick={(e: React.MouseEvent) => handleMetricClick('revenue', e)}
          direction="Route Autopilot to chase unpaid invoices or scale the upsell funnel."
          actionLabel="Open finance run"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <QuickActionCard
          icon={<MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />}
          title="Inbox"
          subtitle={`Reply to ${stats.unreadMessages}`}
          onClick={() => navigateTo('/dashboard/inbox', {
            id: 'quick-inbox',
            label: 'Quick action → Inbox',
            surface: 'dashboard-quick-actions',
            metadata: { unread: stats.unreadMessages },
          })}
          color="blue"
        />
        <QuickActionCard
          icon={<CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />}
          title="Point of Sale"
          subtitle="Run walk-ins"
          onClick={() => navigateTo('/dashboard/pos', {
            id: 'quick-pos',
            label: 'Quick action → POS',
            surface: 'dashboard-quick-actions',
          })}
          color="emerald"
        />
        <QuickActionCard
          icon={<DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />}
          title="Invoices"
          subtitle="Collect cash"
          onClick={() => navigateTo('/dashboard/invoices', {
            id: 'quick-invoices',
            label: 'Quick action → Invoices',
            surface: 'dashboard-quick-actions',
          })}
          color="green"
        />
        <QuickActionCard
          icon={<Zap className="w-6 h-6 sm:w-7 sm:h-7" />}
          title="Automations"
          subtitle={`${stats.runningAutomations} running`}
          onClick={() => navigateTo('/dashboard/automations', {
            id: 'quick-automations',
            label: 'Quick action → Automations',
            surface: 'dashboard-quick-actions',
            metadata: { running: stats.runningAutomations },
          })}
          color="purple"
        />
        <QuickActionCard
          icon={"🚚"}
          title="Delivery"
          subtitle={`Move ${stats.pendingOrders}`}
          onClick={() => navigateTo('/dashboard/delivery', {
            id: 'quick-delivery',
            label: 'Quick action → Delivery',
            surface: 'dashboard-quick-actions',
            metadata: { pending: stats.pendingOrders },
          })}
          color="orange"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center justify-between">
              <span>📊 Channels feeding the pipeline</span>
              <button
                type="button"
                onClick={() => navigateTo('/dashboard/leads', {
                  id: 'channels-jump-to-leads',
                  label: 'Jump to leads feed',
                  surface: 'dashboard-channel-breakdown',
                })}
                className="text-sm text-blue-600 hover:text-blue-700 font-normal"
              >
                Jump to leads →
              </button>
            </h2>
          <div className="space-y-3">
            <PlatformRow 
              platform="TikTok" 
              platformId="TikTok"
              count={3} 
              total={10} 
              color="bg-black" 
            />
            <PlatformRow 
              platform="WhatsApp" 
              platformId="WhatsApp"
              count={2} 
              total={10} 
              color="bg-green-500" 
            />
            <PlatformRow 
              platform="Instagram" 
              platformId="Instagram"
              count={2} 
              total={10} 
              color="bg-pink-500" 
            />
            <PlatformRow 
              platform="Facebook" 
              platformId="Facebook"
              count={2} 
              total={10} 
              color="bg-blue-600" 
            />
            <PlatformRow 
              platform="LinkedIn" 
              platformId="LinkedIn"
              count={1} 
              total={10} 
              color="bg-blue-700" 
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">🕒 Live signal feed</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{signalDirective.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${signalDirective.statusTone}`}>
                {signalDirective.status}
              </span>
              <button
                type="button"
                onClick={() => navigateTo(signalDirective.href, {
                  id: 'directive-signal-feed',
                  label: `Signal directive → ${signalDirective.cta}`,
                  surface: 'dashboard-signal-feed',
                  metadata: { status: signalDirective.status },
                })}
                className="text-sm font-semibold text-blue-600 dark:text-blue-300 inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                {signalDirective.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <ActivityItem
              icon="🎵"
              text="New TikTok lead: Ethan Taylor"
              time="5 min ago"
              onClick={() => navigateTo('/dashboard/leads', {
                id: 'signal-feed-tiktok-lead',
                label: 'Signal feed item → TikTok lead',
                surface: 'dashboard-signal-feed-list',
              })}
            />
            <ActivityItem
              icon="💬"
              text="WhatsApp message from Michael Chen"
              time="12 min ago"
              onClick={() => navigateTo('/dashboard/inbox', {
                id: 'signal-feed-whatsapp-message',
                label: 'Signal feed item → WhatsApp thread',
                surface: 'dashboard-signal-feed-list',
              })}
            />
            <ActivityItem
              icon="🔥"
              text="Lead qualified as HOT: Sarah Johnson"
              time="28 min ago"
              onClick={() => navigateTo('/dashboard/leads', {
                id: 'signal-feed-hot-lead',
                label: 'Signal feed item → Hot lead',
                surface: 'dashboard-signal-feed-list',
              })}
            />
            <ActivityItem
              icon="💰"
              text="Invoice paid: R2,999"
              time="1 hour ago"
              onClick={() => navigateTo('/dashboard/invoices', {
                id: 'signal-feed-invoice-paid',
                label: 'Signal feed item → Invoice paid',
                surface: 'dashboard-signal-feed-list',
              })}
            />
            <ActivityItem
              icon="⚡"
              text="Auto-responder sent 3 replies"
              time="2 hours ago"
              onClick={() => navigateTo('/dashboard/automations', {
                id: 'signal-feed-autoresponder',
                label: 'Signal feed item → Auto-responder',
                surface: 'dashboard-signal-feed-list',
              })}
            />
            <ActivityItem
              icon="📦"
              text="Order marked as fulfilled"
              time="3 hours ago"
              onClick={() => navigateTo('/dashboard/delivery', {
                id: 'signal-feed-fulfilled-order',
                label: 'Signal feed item → Delivery order',
                surface: 'dashboard-signal-feed-list',
              })}
            />
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
            {signalDirective.autopilotNote}
          </div>
        </div>
      </div>

      {/* Hot Leads Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">🔥 Hot leads. Call now.</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{hotLeadDirective.summary}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${hotLeadDirective.statusTone}`}>
              {hotLeadDirective.status}
            </span>
            <button
              type="button"
              onClick={() => navigateTo(hotLeadDirective.href, {
                id: 'directive-hot-leads',
                label: `Hot lead directive → ${hotLeadDirective.cta}`,
                surface: 'dashboard-hot-leads',
                metadata: { status: hotLeadDirective.status },
              })}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              {hotLeadDirective.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Mobile: Card View */}
        <div className="block lg:hidden space-y-3">
          <LeadCard
            name="Sarah Johnson"
            email="sarah.johnson@email.com"
            source="TikTok"
            intent="Pricing Inquiry"
            score={95}
            lastContact="5 mins ago"
            onClick={() => navigateTo('/dashboard/leads/lead1', {
              id: 'hot-lead-card-sarah',
              label: 'Hot lead card → Sarah Johnson',
              surface: 'dashboard-hot-leads-mobile',
            })}
          />
          <LeadCard
            name="Michael Chen"
            email="michael.chen@email.com"
            source="WhatsApp"
            intent="Demo Request"
            score={92}
            lastContact="12 mins ago"
            onClick={() => navigateTo('/dashboard/leads/lead2', {
              id: 'hot-lead-card-michael',
              label: 'Hot lead card → Michael Chen',
              surface: 'dashboard-hot-leads-mobile',
            })}
          />
          <LeadCard
            name="Emma Williams"
            email="emma.williams@email.com"
            source="Instagram"
            intent="Service Question"
            score={88}
            lastContact="23 mins ago"
            onClick={() => navigateTo('/dashboard/leads/lead3', {
              id: 'hot-lead-card-emma',
              label: 'Hot lead card → Emma Williams',
              surface: 'dashboard-hot-leads-mobile',
            })}
          />
        </div>

        {/* Desktop: Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Lead</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Intent</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <LeadRow
                name="Sarah Johnson"
                email="sarah.johnson@email.com"
                source="TikTok"
                intent="Pricing Inquiry"
                score={95}
                lastContact="5 mins ago"
                onOpen={() => navigateTo('/dashboard/leads/lead1', {
                  id: 'hot-lead-row-sarah',
                  label: 'Hot lead row → Sarah Johnson',
                  surface: 'dashboard-hot-leads-table',
                })}
              />
              <LeadRow
                name="Michael Chen"
                email="michael.chen@email.com"
                source="WhatsApp"
                intent="Demo Request"
                score={92}
                lastContact="12 mins ago"
                onOpen={() => navigateTo('/dashboard/leads/lead2', {
                  id: 'hot-lead-row-michael',
                  label: 'Hot lead row → Michael Chen',
                  surface: 'dashboard-hot-leads-table',
                })}
              />
              <LeadRow
                name="Emma Williams"
                email="emma.williams@email.com"
                source="Instagram"
                intent="Service Question"
                score={88}
                lastContact="23 mins ago"
                onOpen={() => navigateTo('/dashboard/leads/lead3', {
                  id: 'hot-lead-row-emma',
                  label: 'Hot lead row → Emma Williams',
                  surface: 'dashboard-hot-leads-table',
                })}
              />
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
          {hotLeadDirective.autopilotNote}
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">🎯 Pipeline pressure check</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">{pipelineDirective.summary}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pipelineDirective.statusTone}`}>
              {pipelineDirective.status}
            </span>
            <button
              type="button"
              onClick={() => navigateTo(pipelineDirective.href, {
                id: 'directive-pipeline',
                label: `Pipeline directive → ${pipelineDirective.cta}`,
                surface: 'dashboard-pipeline-check',
                metadata: { status: pipelineDirective.status },
              })}
              className="text-sm font-semibold text-blue-600 dark:text-blue-300 inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              {pipelineDirective.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <PipelineStage name="New Lead" count={3} color="blue" />
          <PipelineStage name="Contacted" count={2} color="purple" />
          <PipelineStage name="Qualified" count={2} color="green" />
          <PipelineStage name="Proposal" count={1} color="orange" />
          <PipelineStage name="Won" count={3} color="emerald" />
        </div>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
          {pipelineDirective.autopilotNote}
        </div>
      </div>

      {/* Platform Tutorial */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl glass-card shadow-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">✨ How the OS kills chaos</h2>
            <p className="text-white/90 text-sm sm:text-base">{tutorialDirective.summary}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tutorialDirective.statusTone}`}>
              {tutorialDirective.status}
            </span>
            <button
              type="button"
              onClick={() => navigateTo(tutorialDirective.href, {
                id: 'directive-tutorial',
                label: `Tutorial directive → ${tutorialDirective.cta}`,
                surface: 'dashboard-platform-tutorial',
                metadata: { status: tutorialDirective.status },
              })}
              className="text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all text-indigo-50"
            >
              {tutorialDirective.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 text-lg">1️⃣</span>
            <span>Capture every channel—TikTok, WhatsApp, Instagram, Facebook, LinkedIn—without manual routing.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 text-lg">2️⃣</span>
            <span>AI replies instantly, tags intent, and queues human escalations inside one feed.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 text-lg">3️⃣</span>
            <span>Autopilot moves every lead to the next stage—no human switches or copy/paste.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 text-lg">4️⃣</span>
            <span>Revenue, invoices, and delivery statuses broadcast back to the command board.</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={() => navigateTo('/dashboard/inbox', {
              id: 'tutorial-approve-inbox',
              label: 'Tutorial CTA → Approve inbox autopilot',
              surface: 'dashboard-platform-tutorial',
            })}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            📥 Approve inbox autopilot
          </button>
          <button 
            type="button"
            onClick={() => navigateTo('/dashboard/automations', {
              id: 'tutorial-expand-automations',
              label: 'Tutorial CTA → Expand automations',
              surface: 'dashboard-platform-tutorial',
            })}
            className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg font-medium hover:bg-white/30 transition-colors text-sm"
          >
            ⚡ Expand automations
          </button>
        </div>
        <p className="mt-6 text-xs text-white/80 font-medium">{tutorialDirective.autopilotNote}</p>
      </div>

      {/* Drill-Down Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeModal === 'leads' && '👥 Leads Breakdown'}
                {activeModal === 'messages' && '💬 Messages by Platform'}
                {activeModal === 'revenue' && '💰 Revenue Breakdown'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {activeModal === 'leads' && modalData && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {modalData.breakdown.map((item: any, idx: number) => (
                      <div key={idx} className={`bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-xl p-4 text-center`}>
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.status}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Leads</h4>
                    <div className="space-y-3">
                      {modalData.recent.map((lead: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 glass-button rounded-xl">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{lead.name}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <PlatformBadge platform={lead.source} variant="icon" size="xs" />
                              <span>{lead.source} • {lead.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">🔥 {lead.score}</span>
                            <button 
                              onClick={() => navigateTo('/dashboard/leads', {
                                id: `modal-lead-view-${slugify(lead.name)}`,
                                label: `Modal lead view → ${lead.name}`,
                                surface: 'dashboard-leads-modal',
                                metadata: { source: lead.source },
                              })}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigateTo('/dashboard/leads', {
                      id: 'modal-leads-open-all',
                      label: 'Modal CTA → Open all leads',
                      surface: 'dashboard-leads-modal',
                    })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
                  >
                    Open all leads →
                  </button>
                </>
              )}
              
              {activeModal === 'messages' && modalData && (
                <>
                  <div className="space-y-3">
                    {modalData.platforms.map((platform: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 glass-button rounded-xl">
                        <div className="flex items-center gap-3">
                          <PlatformBadge
                            platform={platform.platform || platform.name}
                            variant="icon"
                            size="sm"
                          />
                          <span className="font-semibold text-gray-900 dark:text-white">{platform.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">{platform.count} unread</span>
                          <button
                            type="button"
                            onClick={() => handleModalNavigate(platform.path || '/dashboard/inbox', {
                              id: `modal-messages-${slugify(platform.name || platform.platform || 'channel')}`,
                              label: `Messages modal → ${platform.name}`,
                              surface: 'dashboard-messages-modal',
                            })}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => navigateTo('/dashboard/inbox', {
                      id: 'modal-messages-jump-inbox',
                      label: 'Modal CTA → Jump to inbox',
                      surface: 'dashboard-messages-modal',
                    })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
                  >
                    Jump to inbox →
                  </button>
                </>
              )}
              
              {activeModal === 'revenue' && modalData && (
                <>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Revenue (MTD)</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">R{modalData.total.toLocaleString()}</div>
                    <div className="text-sm font-semibold text-green-600">{modalData.trend}</div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Sources</h4>
                    <div className="space-y-4">
                      {modalData.breakdown.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                            <span className="font-bold text-gray-900 dark:text-white">R{item.amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all" style={{ width: `${item.percentage}%` }}></div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.percentage}% of total</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigateTo('/dashboard/finance', {
                      id: 'modal-revenue-open-finance',
                      label: 'Modal CTA → Open finance dashboard',
                      surface: 'dashboard-revenue-modal',
                    })}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
                  >
                    Open finance dashboard →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, change, icon, positive, href, bgColor, onClick, direction, actionLabel = 'Open details' }: any) {
  const isInteractive = Boolean(onClick) || Boolean(href);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (typeof onClick === 'function') {
      onClick(event);
      return;
    }

    if (href) {
      event.preventDefault();
      window.location.href = href;
    }
  };

  return (
    <button
      type="button"
      onClick={isInteractive ? handleClick : undefined}
      className={`bg-gradient-to-br ${bgColor} rounded-2xl glass-card shadow-2xl p-6 text-white transition-all duration-300 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
        isInteractive ? 'hover:scale-110 hover:shadow-3xl cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl sm:text-4xl animate-bounce">{icon}</div>
        <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
          positive ? 'bg-white/30' : 'bg-white/30'
        }`}>
          {change}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
      <div className="text-white/90 text-sm">{title}</div>
      {direction && (
        <p className="mt-3 text-white/90 text-xs leading-relaxed">
          {direction}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wide">
        <ArrowRight className="w-3 h-3" />
        {actionLabel}
      </div>
    </button>
  )
}

// Quick Action Card Component
function QuickActionCard({ icon, title, subtitle, onClick, color }: any) {
  const colorClasses = {
    blue: 'border-blue-200/50 hover:border-blue-400',
    orange: 'border-orange-200/50 hover:border-orange-400',
    green: 'border-green-200/50 hover:border-green-400',
    emerald: 'border-emerald-200/50 hover:border-emerald-400',
    purple: 'border-purple-200/50 hover:border-purple-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-button rounded-2xl border-2 ${colorClasses[color]} p-4 transition-all duration-300 cursor-pointer hover:scale-110 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 flex flex-col items-center text-center`}
    >
      <div className="text-2xl sm:text-3xl mb-2 flex items-center justify-center text-gray-700 dark:text-gray-300">{icon}</div>
      <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{title}</div>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
    </button>
  );
}

// Platform Row Component
function PlatformRow({ platform, platformId, count, total, color }: any) {
  const percentage = (count / total) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={platformId || platform} variant="icon" size="sm" />
          <span className="font-medium text-sm sm:text-base dark:text-gray-300">{platform}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count} leads</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// Activity Item Component
function ActivityItem({ icon, text, time, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 p-3 glass-button rounded-xl transition-all duration-300 cursor-pointer hover:scale-105 text-left w-full"
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">{text}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{time}</p>
      </div>
    </button>
  )
}

// Lead Card Component (Mobile)
function LeadCard({ name, email, source, intent, score, lastContact, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block p-4 glass-card rounded-2xl transition-all duration-300 hover:scale-105 text-left w-full"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
        </div>
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          {score}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <PlatformBadge platform={source} size="xs" />
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
          {intent}
        </span>
        <span className="text-xs text-gray-500">{lastContact}</span>
      </div>
    </button>
  )
}

// Lead Row Component (Desktop)
function LeadRow({ name, email, source, intent, score, lastContact, onOpen }: any) {
  return (
    <tr className="border-b border-white/20 hover:bg-white/30 transition-all">
      <td className="py-3 px-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-gray-500">{email}</div>
        </div>
      </td>
      <td className="py-3 px-4">
        <PlatformBadge platform={source} size="xs" />
      </td>
      <td className="py-3 px-4 text-sm">{intent}</td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          🔥 {score}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{lastContact}</td>
      <td className="py-3 px-4">
        <button
          type="button"
          onClick={onOpen}
          className="px-3 py-1.5 glass-button rounded-xl text-sm font-medium hover:scale-110 transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          Open
        </button>
      </td>
    </tr>
  )
}

// Pipeline Stage Component
function PipelineStage({ name, count, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-2xl glass-button p-4 text-center hover:scale-110 transition-all duration-300 cursor-pointer`}>
      <div className="text-2xl sm:text-3xl font-bold mb-1">{count}</div>
      <div className="text-xs sm:text-sm font-medium">{name}</div>
    </div>
  )
}
