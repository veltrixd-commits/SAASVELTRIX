'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, Plus, Clock, Users, MessageCircle, Mail, Calendar, Edit, Heart, Activity, Watch, X, Trash2 } from 'lucide-react';
import { executeAutomation, getAutomationRuns } from '@/lib/automationRuntime';
import { canCurrentUserUseAiAutomationReplies } from '@/lib/accessControl';

export default function AutomationsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [viewingWorkflow, setViewingWorkflow] = useState<any>(null);
  const [automations, setAutomations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [automationRuns, setAutomationRuns] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [canUseAiAutomation, setCanUseAiAutomation] = useState(true);
  const autoRunInProgressRef = useRef(false);
  const automationsRef = useRef<any[]>([]);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    trigger: 'New Engagement',
    platform: 'All Platforms',
    actions: 1,
    actionSteps: [
      { id: 1, type: 'AI Auto Reply', content: 'Reply politely, answer questions, and invite next step.', delay: 0 }
    ],
    conditions: []
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const normalizeAutomation = (automation: any) => {
    const actionsCount = Math.max(1, Number(automation.actions || 1));
    const existingSteps = Array.isArray(automation.actionSteps) ? automation.actionSteps : [];
    const normalizedSteps = existingSteps.length > 0
      ? existingSteps.map((step: any, index: number) => ({
          id: Number(step.id || index + 1),
          type: step.type || 'Create Task',
          content: step.content || `Auto action step ${index + 1}`,
          delay: Number(step.delay || 0),
        }))
      : Array.from({ length: actionsCount }, (_, index) => ({
          id: index + 1,
          type: 'Create Task',
          content: `Auto action step ${index + 1}`,
          delay: 0,
        }));

    return {
      ...automation,
      actions: normalizedSteps.length,
      actionSteps: normalizedSteps,
    };
  };

  // Load automations from localStorage on mount
  useEffect(() => {
    const savedAutomations = localStorage.getItem('veltrix_automations');
    if (savedAutomations) {
      const parsed = JSON.parse(savedAutomations);
      const normalized = Array.isArray(parsed) ? parsed.map(normalizeAutomation) : [];
      setAutomations(normalized);
    } else {
      // Initialize with default automations
      const defaultAutomations = getDefaultAutomations();
      setAutomations(defaultAutomations);
      localStorage.setItem('veltrix_automations', JSON.stringify(defaultAutomations));
    }

    setAutomationRuns(getAutomationRuns());
    setCanUseAiAutomation(canCurrentUserUseAiAutomationReplies());
    setIsLoading(false);
  }, []);

  // Save automations to localStorage whenever they change
  useEffect(() => {
    if (automations.length > 0) {
      localStorage.setItem('veltrix_automations', JSON.stringify(automations));
    }
    automationsRef.current = automations;
  }, [automations]);

  function getDefaultAutomations() {
    return [
      {
        id: 1,
        name: 'AI Engagement Responder',
        description: 'Automatically read and respond to messages, comments, and reviews with AI',
        status: 'active',
        trigger: 'New Engagement',
        actions: 1,
        actionSteps: [
          { id: 1, type: 'AI Auto Reply', content: 'Reply in a friendly professional tone and ask one follow-up question.', delay: 0 },
        ],
        lastRun: '2 mins ago',
        totalRuns: 247,
        successRate: 98.4,
        platform: 'All Platforms',
        icon: 'MessageCircle',
        color: 'text-green-500',
        glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'
      },
      {
        id: 2,
        name: 'Follow-up Sequence',
        description: 'Automated follow-up after 3 days of no response',
        status: 'active',
        trigger: 'No Response',
        actions: 5,
        lastRun: '15 mins ago',
        totalRuns: 189,
        successRate: 94.2,
        platform: 'Email',
        icon: 'Mail',
        color: 'text-blue-500',
        glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
      },
      {
        id: 3,
        name: 'Meeting Reminder',
        description: 'Send reminder 24 hours before scheduled meetings',
        status: 'active',
        trigger: 'Meeting Scheduled',
        actions: 2,
        lastRun: '1 hour ago',
        totalRuns: 156,
        successRate: 100,
        platform: 'SMS',
        icon: 'Calendar',
        color: 'text-purple-500',
        glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'
      },
      {
        id: 4,
        name: 'Hot Lead Alert',
        description: 'Notify team when lead score exceeds 80',
        status: 'active',
        trigger: 'High Score',
        actions: 4,
        lastRun: '5 mins ago',
        totalRuns: 89,
        successRate: 96.6,
        platform: 'TikTok',
        icon: 'Zap',
        color: 'text-yellow-500',
        glow: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]'
      },
      {
        id: 5,
        name: 'Abandoned Cart',
        description: 'Re-engage users who left without completing purchase',
        status: 'paused',
        trigger: 'Cart Abandoned',
        actions: 3,
        lastRun: '2 days ago',
        totalRuns: 134,
        successRate: 87.3,
        platform: 'Email',
        icon: 'Mail',
        color: 'text-orange-500',
        glow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
      },
      {
        id: 6,
        name: 'Birthday Campaign',
        description: 'Send personalized birthday offers to contacts',
        status: 'paused',
        trigger: 'Birthday',
        actions: 2,
        lastRun: '1 week ago',
        totalRuns: 45,
        successRate: 92.1,
        platform: 'WhatsApp',
        icon: 'MessageCircle',
        color: 'text-pink-500',
        glow: 'drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]'
      },
      {
        id: 7,
        name: 'Morning Wellness Reminder',
        description: 'Send daily morning routine reminders based on smartwatch data',
        status: 'active',
        trigger: 'Smartwatch Wake-up',
        actions: 3,
        lastRun: '1 hour ago',
        totalRuns: 312,
        successRate: 99.2,
        platform: 'Wellness',
        icon: 'Watch',
        color: 'text-teal-500',
        glow: 'drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]'
      },
      {
        id: 8,
        name: 'Low Activity Alert',
        description: 'Notify when daily step count is below goal by 6 PM',
        status: 'active',
        trigger: 'Low Steps',
        actions: 2,
        lastRun: '3 hours ago',
        totalRuns: 178,
        successRate: 94.8,
        platform: 'Wellness',
        icon: 'Activity',
        color: 'text-green-500',
        glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'
      },
      {
        id: 9,
        name: 'Sleep Quality Report',
        description: 'Weekly sleep analysis from connected smartwatch',
        status: 'active',
        trigger: 'Weekly',
        actions: 4,
        lastRun: '2 days ago',
        totalRuns: 52,
        successRate: 100,
        platform: 'Wellness',
        icon: 'Heart',
        color: 'text-red-500',
        glow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
      }
    ];
  }

  // Toggle automation status
  const toggleAutomation = (id: number) => {
    setAutomations(automations.map(auto => 
      auto.id === id 
        ? { ...auto, status: auto.status === 'active' ? 'paused' : 'active' }
        : auto
    ));
  };

  // Delete automation
  const deleteAutomation = (id: number) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      setAutomations(automations.filter(auto => auto.id !== id));
    }
  };

  // Create new automation
  const createAutomation = () => {
    const newAuto = {
      id: Date.now(),
      ...newAutomation,
      status: 'active',
      lastRun: 'Never',
      totalRuns: 0,
      successRate: 0,
      icon: getIconForPlatform(newAutomation.platform),
      color: getColorForPlatform(newAutomation.platform),
      glow: getGlowForPlatform(newAutomation.platform)
    };
    setAutomations([...automations, normalizeAutomation(newAuto)]);
    setShowCreateModal(false);
    showToast('Automation created successfully.', 'success');
    setNewAutomation({
      name: '',
      description: '',
      trigger: 'New Engagement',
      platform: 'All Platforms',
      actions: 1,
      actionSteps: [
        { id: 1, type: 'AI Auto Reply', content: 'Reply politely, answer questions, and invite next step.', delay: 0 }
      ],
      conditions: []
    });
  };

  // Edit automation
  const openEditModal = (automation: any) => {
    setEditingAutomation(automation);
    setShowEditModal(true);
  };

  const updateAutomation = () => {
    setAutomations(automations.map(auto => 
      auto.id === editingAutomation.id ? normalizeAutomation(editingAutomation) : auto
    ));
    setShowEditModal(false);
    setEditingAutomation(null);
    showToast('Automation updated successfully.', 'success');
  };

  const shouldUseEngagementAi = (automation: any) => {
    const trigger = String(automation.trigger || '').toLowerCase();
    const triggerMatch =
      trigger.includes('engagement') ||
      trigger.includes('message') ||
      trigger.includes('comment') ||
      trigger.includes('review');
    const steps = Array.isArray(automation.actionSteps) ? automation.actionSteps : [];
    const stepMatch = steps.some((step: any) => {
      const text = `${step?.type || ''} ${step?.content || ''}`.toLowerCase();
      return text.includes('ai') || text.includes('reply') || text.includes('respond');
    });
    return triggerMatch || stepMatch;
  };

  const runSingleAutomation = async (automation: any, options?: { notify?: boolean }) => {
    if (shouldUseEngagementAi(automation) && !canUseAiAutomation) {
      if (options?.notify) {
        showToast('You do not have permission to run AI auto-replies. Ask the owner to grant access.', 'error');
      }
      return;
    }

    const { run, updatedAutomation } = await executeAutomation(normalizeAutomation(automation));

    setAutomations((prev) => prev.map((item) => (item.id === automation.id ? updatedAutomation : item)));

    if (run.stepsExecuted > 0 || run.stepsSucceeded > 0 || options?.notify) {
      setAutomationRuns((prev) => [run, ...prev].slice(0, 20));
    }

    if (viewingWorkflow?.id === automation.id) {
      setViewingWorkflow(updatedAutomation);
    }

    if (options?.notify) {
      showToast(
        run.status === 'success'
          ? `Automation test completed: ${run.summary}`
          : `Automation test finished with issues: ${run.summary}`,
        run.status === 'success' ? 'success' : 'info'
      );
    }
  };

  const runAutomationTest = async (automation: any) => {
    await runSingleAutomation(automation, { notify: true });
  };

  useEffect(() => {
    const runActiveEngagementAutomations = async () => {
      if (autoRunInProgressRef.current) return;
      autoRunInProgressRef.current = true;

      try {
        if (!canUseAiAutomation) return;

        const activeEngagementAutomations = automationsRef.current.filter(
          (automation) => automation.status === 'active' && shouldUseEngagementAi(automation)
        );

        for (const automation of activeEngagementAutomations) {
          await runSingleAutomation(automation, { notify: false });
        }
      } finally {
        autoRunInProgressRef.current = false;
      }
    };

    runActiveEngagementAutomations();
    const intervalId = window.setInterval(runActiveEngagementAutomations, 45000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canUseAiAutomation]);

  function getIconForPlatform(platform: string) {
    const icons: any = {
      'WhatsApp': 'MessageCircle',
      'Email': 'Mail',
      'SMS': 'Calendar',
      'TikTok': 'Zap',
      'Instagram': 'MessageCircle',
      'Facebook': 'MessageCircle',
      'LinkedIn': 'Users',
      'Google My Business': 'MessageCircle',
      'All Platforms': 'Zap',
      'Wellness': 'Heart'
    };
    return icons[platform] || 'Zap';
  }

  function getColorForPlatform(platform: string) {
    const colors: any = {
      'WhatsApp': 'text-green-500',
      'Email': 'text-blue-500',
      'SMS': 'text-purple-500',
      'TikTok': 'text-yellow-500',
      'Instagram': 'text-pink-500',
      'Facebook': 'text-blue-500',
      'LinkedIn': 'text-sky-600',
      'Google My Business': 'text-emerald-500',
      'All Platforms': 'text-indigo-500',
      'Wellness': 'text-teal-500'
    };
    return colors[platform] || 'text-gray-500';
  }

  function getGlowForPlatform(platform: string) {
    const glows: any = {
      'WhatsApp': 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]',
      'Email': 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      'SMS': 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
      'TikTok': 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]',
      'Instagram': 'drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]',
      'Facebook': 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      'LinkedIn': 'drop-shadow-[0_0_8px_rgba(14,116,144,0.6)]',
      'Google My Business': 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      'All Platforms': 'drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]',
      'Wellness': 'drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]'
    };
    return glows[platform] || 'drop-shadow-[0_0_8px_rgba(156,163,175,0.6)]';
  }

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const icons: any = {
      MessageCircle,
      Mail,
      Calendar,
      Zap,
      Heart,
      Activity,
      Watch
    };
    return icons[iconName] || Zap;
  };

  // Calculate dynamic stats
  const activeCount = automations.filter(a => a.status === 'active').length;
  const totalRuns = automations.reduce((sum, a) => sum + a.totalRuns, 0);
  const avgSuccessRate = automations.length > 0 
    ? (automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length).toFixed(1)
    : '0';
  const timeSaved = (totalRuns * 0.015).toFixed(1); // Estimate 0.015 hours saved per run

  const stats = [
    { label: 'Active Automations', value: activeCount.toString(), change: '+' + Math.floor(activeCount / 3), icon: Zap, color: 'text-blue-500', glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' },
    { label: 'Total Runs Today', value: totalRuns.toLocaleString(), change: '+18%', icon: Play, color: 'text-green-500', glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' },
    { label: 'Success Rate', value: avgSuccessRate + '%', change: '+1.6%', icon: Users, color: 'text-purple-500', glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' },
    { label: 'Time Saved', value: timeSaved + 'h', change: '+5.8h', icon: Clock, color: 'text-orange-500', glow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' }
  ];

  const filteredAutomations = activeFilter === 'all' 
    ? automations 
    : automations.filter(a => a.status === activeFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Priming runbooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-[70]">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium border ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : toast.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.7)] animate-pulse" />
            Automation Command Deck
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Wire triggers to outcomes so nothing stalls and time comes back.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ship automation
        </button>
      </div>

      {!canUseAiAutomation && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          AI auto-replies are locked for this login. Ask the owner in Settings → Privacy to flip access.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="glass-card rounded-2xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <IconComponent className={`w-8 h-8 ${stat.color} ${stat.glow}`} />
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Runs */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Live Run Feed</h2>
        {automationRuns.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No runs logged yet—fire a test to prove the workflow actually ships.</p>
        ) : (
          <div className="space-y-3">
            {automationRuns.slice(0, 6).map((run) => (
              <div key={run.id} className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{run.automationName}</p>
                  <p className="text-xs text-gray-500">{run.summary}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${run.status === 'success' ? 'text-green-600' : run.status === 'partial' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {run.status.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(run.startedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="glass-card rounded-2xl p-2 inline-flex gap-2">
        {['all', 'active', 'paused'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Automations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAutomations.map((automation) => {
          const IconComponent = getIconComponent(automation.icon);
          return (
            <div key={automation.id} className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${automation.status === 'active' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${automation.color} ${automation.glow}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{automation.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{automation.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(automation)}
                    className="p-2 glass-button rounded-lg hover:scale-110 transition-all"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => deleteAutomation(automation.id)}
                    className="p-2 glass-button rounded-lg hover:scale-110 transition-all hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trigger</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{automation.trigger}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{automation.platform}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actions</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{automation.actions} steps</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                  <p className="text-sm font-semibold text-green-600">{automation.successRate}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setViewingWorkflow(automation);
                      setShowWorkflowModal(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    📋 View Workflow
                  </button>
                  <button 
                    onClick={() => runAutomationTest(automation)}
                    className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                  >
                    🧪 Test
                  </button>
                </div>
                <button 
                  onClick={() => toggleAutomation(automation.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    automation.status === 'active'
                      ? 'glass-button text-orange-600 hover:scale-105'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105 shadow-lg'
                  }`}
                >
                  {automation.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create Automation</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Automation Name</label>
                <input
                  type="text"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  placeholder="e.g., Welcome Series"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newAutomation.description}
                  onChange={(e) => setNewAutomation({...newAutomation, description: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  rows={3}
                  placeholder="Describe what this automation does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger</label>
                <select
                  value={newAutomation.trigger}
                  onChange={(e) => setNewAutomation({...newAutomation, trigger: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="New Engagement">New Engagement (Message/Comment/Review)</option>
                  <option value="New Message">New Message</option>
                  <option value="New Comment">New Comment</option>
                  <option value="New Review">New Review</option>
                  <option value="No Response">No Response (3 days)</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="High Score">High Score (&gt;80)</option>
                  <option value="Cart Abandoned">Cart Abandoned</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Smartwatch Wake-up">Smartwatch Wake-up</option>
                  <option value="Low Steps">Low Steps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform</label>
                <select
                  value={newAutomation.platform}
                  onChange={(e) => setNewAutomation({...newAutomation, platform: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Google My Business">Google My Business</option>
                  <option value="All Platforms">All Platforms</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Actions</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newAutomation.actions}
                  onChange={(e) => setNewAutomation({...newAutomation, actions: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createAutomation}
                disabled={!newAutomation.name || !newAutomation.description}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Automation
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Automation Modal */}
      {showEditModal && editingAutomation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Automation</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Automation Name</label>
                <input
                  type="text"
                  value={editingAutomation.name}
                  onChange={(e) => setEditingAutomation({...editingAutomation, name: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={editingAutomation.description}
                  onChange={(e) => setEditingAutomation({...editingAutomation, description: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger</label>
                <select
                  value={editingAutomation.trigger}
                  onChange={(e) => setEditingAutomation({...editingAutomation, trigger: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="New Engagement">New Engagement (Message/Comment/Review)</option>
                  <option value="New Message">New Message</option>
                  <option value="New Comment">New Comment</option>
                  <option value="New Review">New Review</option>
                  <option value="No Response">No Response (3 days)</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="High Score">High Score (&gt;80)</option>
                  <option value="Cart Abandoned">Cart Abandoned</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Smartwatch Wake-up">Smartwatch Wake-up</option>
                  <option value="Low Steps">Low Steps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform</label>
                <select
                  value={editingAutomation.platform}
                  onChange={(e) => setEditingAutomation({...editingAutomation, platform: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Google My Business">Google My Business</option>
                  <option value="All Platforms">All Platforms</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Actions</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingAutomation.actions}
                  onChange={(e) => setEditingAutomation({...editingAutomation, actions: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={updateAutomation}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Visualization Modal */}
      {showWorkflowModal && viewingWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                📊 Workflow: {viewingWorkflow.name}
              </h3>
              <button onClick={() => setShowWorkflowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Trigger */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
                <div className="flex-1 glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Trigger</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{viewingWorkflow.trigger}</p>
                      <p className="text-xs text-gray-500 mt-1">Platform: {viewingWorkflow.platform}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-purple-400"></div>
              </div>

              {/* Conditions (if any) */}
              {viewingWorkflow.conditions && viewingWorkflow.conditions.length > 0 && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                      2
                    </div>
                    <div className="flex-1 glass-card p-4 rounded-xl border-2 border-purple-200">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Conditions</h4>
                      {viewingWorkflow.conditions.map((condition: any, index: number) => (
                        <div key={index} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-sm">
                          <span className="font-medium">If</span> {condition.field} {condition.operator} {condition.value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-green-400"></div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {viewingWorkflow.conditions?.length > 0 ? '3' : '2'}
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Actions</h4>
                </div>
                
                {viewingWorkflow.actionSteps ? (
                  <div className="ml-16 space-y-3">
                    {viewingWorkflow.actionSteps.map((step: any, index: number) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">{step.type}</span>
                            {step.delay > 0 && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                ⏱️ {step.delay}min delay
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{step.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-16 text-gray-500 italic">
                    {viewingWorkflow.actions} action steps configured
                  </div>
                )}
              </div>

              {/* Stats Summary */}
              <div className="glass-card p-4 rounded-xl border-l-4 border-blue-600">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Performance Stats</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{viewingWorkflow.totalRuns}</p>
                    <p className="text-xs text-gray-600">Total Runs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{viewingWorkflow.successRate}%</p>
                    <p className="text-xs text-gray-600">Success Rate</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingWorkflow.lastRun}</p>
                    <p className="text-xs text-gray-600">Last Run</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowWorkflowModal(false);
                  openEditModal(viewingWorkflow);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ✏️ Edit Automation
              </button>
              <button
                onClick={() => {
                  runAutomationTest(viewingWorkflow);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                🧪 Run Test
              </button>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
