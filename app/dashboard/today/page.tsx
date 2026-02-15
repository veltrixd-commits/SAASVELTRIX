/**
 * Today Screen - Primary Autopilot Interface
 * 
 * The new main entry point for Veltrix.
 * Answers: What should I focus on today? How's my energy? How can I grow?
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Target, 
  Zap, 
  DollarSign, 
  Heart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Info,
  Plus,
  Edit3,
  Save,
  X,
  User,
  Briefcase,
} from 'lucide-react';
import { AutopilotEngine, createAutopilotEngine } from '@/lib/autopilot-engine';
import { getUserModeConfig, getUserModeName, getMetricIcon } from '@/lib/user-mode';
import type { AutopilotRecommendations, UserMode } from '@/types/autopilot';

export default function TodayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AutopilotRecommendations | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('individual');
  const [userName, setUserName] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditFocusModal, setShowEditFocusModal] = useState(false);
  const [showBusinessOwnerModal, setShowBusinessOwnerModal] = useState(false);
  
  // Editable focus metrics
  const [productiveHours, setProductiveHours] = useState(8);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [breaksCount, setBreaksCount] = useState(3);
  const [businessGoal, setBusinessGoal] = useState('');
  
  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('30');
  const [newTaskPriority, setNewTaskPriority] = useState('high');

  useEffect(() => {
    loadAutopilotData();
  }, []);

  const loadAutopilotData = () => {
    try {
      // Load user data
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      
      setUserName(userData.fullName || 'there');
      
      // Determine user mode
      const mode = (settings.userMode || 'individual') as UserMode;
      setUserMode(mode);
      
      // Get permissions
      const config = getUserModeConfig(mode, settings.permissions);
      
      // Create autopilot engine
      const engine = createAutopilotEngine(userData, mode, config.permissions);
      
      // Generate recommendations
      const recs = engine.generateRecommendations();
      setRecommendations(recs);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load autopilot data:', error);
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getEnergyColor = (level: string) => {
    if (level === 'high') return 'text-green-600';
    if (level === 'medium') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEnergyEmoji = (level: string) => {
    if (level === 'high') return '⚡';
    if (level === 'medium') return '🔋';
    return '🪫';
  };
  
  const handleSaveFocus = () => {
    // Save focus settings to localStorage
    const focusData = {
      productiveHours,
      energyLevel,
      breaksCount,
      businessGoal,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('todayFocus', JSON.stringify(focusData));
    setShowEditFocusModal(false);
    alert('Focus settings saved! ✨');
  };
  
  const handleAddPriorityTask = () => {
    if (!newTaskTitle.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    // Add task to localStorage
    const tasks = JSON.parse(localStorage.getItem('priorityTasks') || '[]');
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      estimatedMinutes: parseInt(newTaskTime),
      priority: newTaskPriority,
      createdAt: new Date(). toISOString(),
      completed: false,
    };
    tasks.push(newTask);
    localStorage.setItem('priorityTasks', JSON.stringify(tasks));
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskTime('30');
    setNewTaskPriority('high');
    setShowAddTaskModal(false);
    
    // Reload recommendations
    loadAutopilotData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Mapping today’s run sheet...</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Autopilot couldn’t pull data</p>
          <button 
            onClick={loadAutopilotData}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Retry sync
          </button>
        </div>
      </div>
    );
  }

  const { dailyFocusPlan, priorityTasks, incomeOpportunities, wellnessGuardrails, insights } = recommendations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Floating Business Owner Button */}
      {userMode === 'businessOwner' && (
        <button
          onClick={() => setShowBusinessOwnerModal(true)}
          className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group"
          title="Business Owner Tools"
        >
          <Briefcase className="w-7 h-7" />
          <span className="absolute right-20 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Business Owner
          </span>
        </button>
      )}
      
      {/* Floating Add Priority Task Button */}
      <button
        onClick={() => setShowAddTaskModal(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group"
        title="Add Priority Task"
      >
        <Plus className="w-7 h-7" />
        <span className="absolute right-20 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Add Priority
        </span>
      </button>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}, {userName}
            </h1>
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              {getUserModeName(userMode)}
            </span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Critical Wellness Guardrails */}
        {wellnessGuardrails.filter(g => g.severity === 'critical').length > 0 && (
          <div className="mb-6 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                  ⚠️ Wellness blockers detected
                </h3>
                {wellnessGuardrails
                  .filter(g => g.severity === 'critical')
                  .map(guardrail => (
                    <div key={guardrail.id} className="mb-3">
                      <p className="text-red-800 dark:text-red-200 font-medium">{guardrail.message}</p>
                      <p className="text-red-700 dark:text-red-300 text-sm mt-1">{guardrail.recommendation}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Focus Plan */}
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Today's attack plan</h2>
            </div>
            <button
              onClick={() => setShowEditFocusModal(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Edit Focus Settings"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <p className="text-xl font-semibold mb-3">{dailyFocusPlan.primary}</p>
            {dailyFocusPlan.secondary.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-white/80">Then tackle:</p>
                {dailyFocusPlan.secondary.map((focus, i) => (
                  <p key={i} className="text-white/90 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    {focus}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Energy</p>
              <p className="text-xl font-bold">
                {getEnergyEmoji(dailyFocusPlan.energyLevel)} {dailyFocusPlan.energyLevel}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Productive Hours</p>
              <p className="text-xl font-bold">{productiveHours}h</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Breaks</p>
              <p className="text-xl font-bold">{breaksCount}x</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Business Goal</p>
              <p className="text-lg font-bold">{businessGoal || '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Priority Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Priority moves</h3>
            </div>
            
            {priorityTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No priority tasks right now. Great job! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {priorityTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:scale-102 transition-all cursor-pointer"
                    onClick={() => {
                      if (task.category === 'lead') router.push('/dashboard/leads');
                      else router.push('/dashboard');
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.impact === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        task.impact === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {task.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {task.energyRequired}
                      </span>
                      {task.revenueImpact && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                          <DollarSign className="w-3 h-3" />
                          R {task.revenueImpact.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Income Opportunities */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue opportunities</h3>
            </div>
            
            {/* Quick Directory Links */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => router.push('/dashboard/leads')}
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:scale-105 transition-all text-left border-2 border-blue-200 dark:border-blue-700"
              >
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">View All Leads</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Browse prospects</div>
              </button>
              <button
                onClick={() => router.push('/dashboard/pipelines')}
                className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:scale-105 transition-all text-left border-2 border-purple-200 dark:border-purple-700"
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Sales Funnels</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Pipeline overview</div>
              </button>
            </div>
            
            {incomeOpportunities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No active opportunities right now
              </p>
            ) : (
              <div className="space-y-3">
                {incomeOpportunities.map((opp) => (
                  <div 
                    key={opp.id}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:scale-102 transition-all cursor-pointer"
                    onClick={() => router.push('/dashboard/leads')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{opp.title}</p>
                      <span className="text-lg font-bold text-green-600">
                        R {opp.potentialRevenue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{opp.action}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Effort: {opp.effort}</span>
                      <span>Confidence: {opp.confidence}%</span>
                      {opp.deadline && (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          Due: {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Wellness Guardrails (Warning level) */}
        {wellnessGuardrails.filter(g => g.severity === 'warning').length > 0 && (
          <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Wellness guardrails</h3>
            </div>
            <div className="space-y-3">
              {wellnessGuardrails
                .filter(g => g.severity === 'warning')
                .map(guardrail => (
                  <div key={guardrail.id} className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{guardrail.message}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{guardrail.recommendation}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Operational insights</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            Open full dashboard
          </button>
          <button
            onClick={() => router.push('/dashboard/wellness')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            Open wellness ops
          </button>
          <button
            onClick={() => router.push('/dashboard/leads')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            Jump to leads
          </button>
        </div>

      </div>
      
      {/* Edit Focus Modal */}
      {showEditFocusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEditFocusModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">✏️ Edit Today's Focus</h3>
              <button onClick={() => setShowEditFocusModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Productive Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  ⏰ Productive Hours Target
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={productiveHours}
                  onChange={(e) => setProductiveHours(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Energy Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  💪 Energy Level (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-purple-600 w-12 text-center">{energyLevel}</span>
                </div>
              </div>
              
              {/* Breaks Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  ☕ Planned Breaks
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBreaksCount(Math.max(0, breaksCount - 1))}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold hover:scale-105 transition-all"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white w-16 text-center">{breaksCount}</span>
                  <button
                    onClick={() => setBreaksCount(breaksCount + 1)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold hover:scale-105 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Business Goal */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  🎯 Grow Your Business Goal
                </label>
                <input
                  type="text"
                  value={businessGoal}
                  onChange={(e) => setBusinessGoal(e.target.value)}
                  placeholder="e.g., Close 3 deals, Launch campaign"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowEditFocusModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFocus}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Focus
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Priority Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddTaskModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">➕ Add Priority Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  ⏱️ Estimated Time (minutes)
                </label>
                <select
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>
              
              {/* Priority Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setNewTaskPriority('high')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${ newTaskPriority === 'high' 
                      ? 'bg-red-600 text-white scale-105' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}
                  >
                    🔴 High
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('medium')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      newTaskPriority === 'medium' 
                      ? 'bg-orange-600 text-white scale-105' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                    }`}
                  >
                    🟠 Medium
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('low')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      newTaskPriority === 'low' 
                      ? 'bg-blue-600 text-white scale-105' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    }`}
                  >
                    🔵 Low
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPriorityTask}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Business Owner Modal */}
      {showBusinessOwnerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBusinessOwnerModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">💼 Business Owner Tools</h3>
              <button onClick={() => setShowBusinessOwnerModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              <button
                onClick={() => { router.push('/dashboard/productivity'); setShowBusinessOwnerModal(false); }}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl hover:scale-105 transition-all text-left border-2 border-purple-200 dark:border-purple-700"
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-900 dark:text-white">Team Productivity</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage tasks & goals</div>
              </button>
              
              <button
                onClick={() => { router.push('/dashboard/leads'); setShowBusinessOwnerModal(false); }}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:scale-105 transition-all text-left border-2 border-blue-200 dark:border-blue-700"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-gray-900 dark:text-white">View All Leads</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage prospects</div>
              </button>
              
              <button
                onClick={() => { router.push('/dashboard/finance'); setShowBusinessOwnerModal(false); }}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:scale-105 transition-all text-left border-2 border-green-200 dark:border-green-700"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold text-gray-900 dark:text-white">Finance Dashboard</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Revenue & expenses</div>
              </button>
              
              <button
                onClick={() => { router.push('/dashboard/analytics'); setShowBusinessOwnerModal(false); }}
                className="w-full p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl hover:scale-105 transition-all text-left border-2 border-orange-200 dark:border-orange-700"
              >
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold text-gray-900 dark:text-white">Analytics</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Business insights</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
