'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, X, Calendar, Users, CheckCircle, Circle, TrendingUp, Flag, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0-100
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: 'not-started' | 'in-progress' | 'completed';
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'growth' | 'operational' | 'strategic' | 'team';
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress: number; // 0-100
  owner: string;
  team: string[];
  milestones: Milestone[];
  color: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'strategic' as Goal['category'],
    startDate: '',
    targetDate: '',
    owner: '',
    team: [] as string[]
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    deadline: '',
    priority: 'medium' as Task['priority']
  });

  // Mock team members
  const teamMembers = [
    { id: '1', name: 'Sarah Johnson', role: 'CEO' },
    { id: '2', name: 'Michael Chen', role: 'CTO' },
    { id: '3', name: 'Emily Rodriguez', role: 'COO' },
    { id: '4', name: 'David Kim', role: 'CFO' },
    { id: '5', name: 'Lisa Anderson', role: 'CMO' }
  ];

  // Category colors
  const categoryConfig = {
    revenue: { color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700', icon: '💰' },
    growth: { color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', icon: '📈' },
    operational: { color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', icon: '⚙️' },
    strategic: { color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700', icon: '🎯' },
    team: { color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-700', icon: '👥' }
  };

  // Load goals from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('organizationalGoals');
    if (saved) {
      setGoals(JSON.parse(saved));
    } else {
      // Initialize with sample goals
      const sampleGoals: Goal[] = [
        {
          id: '1',
          title: 'Increase Annual Revenue by 30%',
          description: 'Grow revenue from R10M to R13M through new product lines and market expansion',
          category: 'revenue',
          startDate: '2026-01-01',
          targetDate: '2026-12-31',
          status: 'active',
          progress: 45,
          owner: 'David Kim',
          team: ['David Kim', 'Lisa Anderson', 'Emily Rodriguez'],
          color: 'from-green-500 to-emerald-600',
          milestones: [
            {
              id: 'm1',
              title: 'Launch New Product Line',
              description: 'Develop and launch premium product tier',
              targetDate: '2026-06-30',
              status: 'in-progress',
              progress: 65,
              tasks: [
                { id: 't1', title: 'Complete market research', assignedTo: 'Lisa Anderson', status: 'completed', deadline: '2026-03-15', priority: 'high' },
                { id: 't2', title: 'Develop product specifications', assignedTo: 'Michael Chen', status: 'in-progress', deadline: '2026-04-30', priority: 'high' },
                { id: 't3', title: 'Create marketing campaign', assignedTo: 'Lisa Anderson', status: 'not-started', deadline: '2026-05-31', priority: 'medium' }
              ]
            },
            {
              id: 'm2',
              title: 'Expand to 2 New Markets',
              description: 'Enter Cape Town and Durban markets',
              targetDate: '2026-09-30',
              status: 'not-started',
              progress: 20,
              tasks: [
                { id: 't4', title: 'Conduct market analysis', assignedTo: 'Emily Rodriguez', status: 'in-progress', deadline: '2026-06-30', priority: 'high' },
                { id: 't5', title: 'Establish local partnerships', assignedTo: 'Sarah Johnson', status: 'not-started', deadline: '2026-08-31', priority: 'medium' }
              ]
            }
          ]
        },
        {
          id: '2',
          title: 'Build World-Class Engineering Team',
          description: 'Hire 15 senior engineers and establish tech leadership',
          category: 'team',
          startDate: '2026-02-01',
          targetDate: '2026-11-30',
          status: 'active',
          progress: 30,
          owner: 'Michael Chen',
          team: ['Michael Chen', 'Sarah Johnson'],
          color: 'from-pink-500 to-pink-600',
          milestones: [
            {
              id: 'm3',
              title: 'Hire 10 Senior Engineers',
              description: 'Recruit top talent from leading tech companies',
              targetDate: '2026-08-31',
              status: 'in-progress',
              progress: 40,
              tasks: [
                { id: 't6', title: 'Post job openings', assignedTo: 'Michael Chen', status: 'completed', deadline: '2026-03-01', priority: 'high' },
                { id: 't7', title: 'Conduct first round interviews', assignedTo: 'Michael Chen', status: 'in-progress', deadline: '2026-05-31', priority: 'high' }
              ]
            }
          ]
        }
      ];
      setGoals(sampleGoals);
      localStorage.setItem('organizationalGoals', JSON.stringify(sampleGoals));
    }
  }, []);

  // Auto-save goals
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('organizationalGoals', JSON.stringify(goals));
    }
  }, [goals]);

  // Calculate overall goal progress from milestones
  const calculateGoalProgress = (goal: Goal): number => {
    if (goal.milestones.length === 0) return 0;
    const totalProgress = goal.milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / goal.milestones.length);
  };

  // Calculate milestone progress from tasks
  const calculateMilestoneProgress = (milestone: Milestone): number => {
    if (milestone.tasks.length === 0) return 0;
    const completedTasks = milestone.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / milestone.tasks.length) * 100);
  };

  // Create new goal
  const createGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      startDate: newGoal.startDate,
      targetDate: newGoal.targetDate,
      status: 'active',
      progress: 0,
      owner: newGoal.owner,
      team: newGoal.team,
      milestones: [],
      color: categoryConfig[newGoal.category].color
    };
    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', category: 'strategic', startDate: '', targetDate: '', owner: '', team: [] });
    setShowCreateGoal(false);
    alert(`Goal "${goal.title}" created successfully!`);
  };

  // Create new milestone
  const createMilestone = () => {
    if (!selectedGoal) return;
    
    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description,
      targetDate: newMilestone.targetDate,
      status: 'not-started',
      progress: 0,
      tasks: []
    };
    
    const updatedGoals = goals.map(g => 
      g.id === selectedGoal.id 
        ? { ...g, milestones: [...g.milestones, milestone] }
        : g
    );
    setGoals(updatedGoals);
    setNewMilestone({ title: '', description: '', targetDate: '' });
    setShowCreateMilestone(false);
    alert(`Milestone "${milestone.title}" added to "${selectedGoal.title}"!`);
  };

  // Create new task
  const createTask = () => {
    if (!selectedGoal || !selectedMilestone) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignedTo: newTask.assignedTo,
      status: 'not-started',
      deadline: newTask.deadline,
      priority: newTask.priority
    };
    
    const updatedGoals = goals.map(g => 
      g.id === selectedGoal.id 
        ? {
            ...g,
            milestones: g.milestones.map(m => 
              m.id === selectedMilestone.id
                ? { ...m, tasks: [...m.tasks, task] }
                : m
            )
          }
        : g
    );
    setGoals(updatedGoals);
    setNewTask({ title: '', assignedTo: '', deadline: '', priority: 'medium' });
    setShowCreateTask(false);
    alert(`Task "${task.title}" added to milestone "${selectedMilestone.title}"!`);
  };

  // Toggle goal expansion
  const toggleGoal = (goalId: string) => {
    setExpandedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  // Update task status
  const updateTaskStatus = (goalId: string, milestoneId: string, taskId: string, newStatus: Task['status']) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = g.milestones.map(m => {
          if (m.id === milestoneId) {
            const updatedTasks = m.tasks.map(t => 
              t.id === taskId ? { ...t, status: newStatus } : t
            );
            const newProgress = calculateMilestoneProgress({ ...m, tasks: updatedTasks });
            return { ...m, tasks: updatedTasks, progress: newProgress };
          }
          return m;
        });
        const newGoalProgress = calculateGoalProgress({ ...g, milestones: updatedMilestones });
        return { ...g, milestones: updatedMilestones, progress: newGoalProgress };
      }
      return g;
    });
    setGoals(updatedGoals);
  };

  // Filter goals
  const filteredGoals = goals.filter(g => filterStatus === 'all' || g.status === filterStatus);

  // Stats
  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-orange-600" />
            Goals & Milestones
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track organizational goals, milestones, and strategic objectives
          </p>
        </div>
        <button
          onClick={() => setShowCreateGoal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-medium hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" /> Create Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Goals</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <Target className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Active Goals</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Completed</p>
              <p className="text-3xl font-bold mt-2">{stats.completed}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100">Avg Progress</p>
              <p className="text-3xl font-bold mt-2">{stats.avgProgress}%</p>
            </div>
            <Flag className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'on-hold'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['list', 'kanban', 'timeline'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Goals Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first organizational goal to start tracking progress
              </p>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
              >
                Create First Goal
              </button>
            </div>
          ) : (
            filteredGoals.map(goal => {
              const isExpanded = expandedGoals.includes(goal.id);
              const config = categoryConfig[goal.category];
              
              return (
                <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Goal Header */}
                  <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{config.icon}</span>
                          <h3 className="text-xl font-bold">{goal.title}</h3>
                        </div>
                        <p className="text-sm text-white/90 mb-4">{goal.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{goal.team.length} team members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flag className="h-4 w-4" />
                            <span>{goal.milestones.length} milestones</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span className="font-bold">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-3">
                        <div
                          className="bg-white rounded-full h-3 transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Milestones (Expanded) */}
                  {isExpanded && (
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Milestones</h4>
                        <button
                          onClick={() => {
                            setSelectedGoal(goal);
                            setShowCreateMilestone(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50"
                        >
                          <Plus className="h-4 w-4" /> Add Milestone
                        </button>
                      </div>

                      {goal.milestones.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No milestones yet. Add your first milestone to track progress.
                        </div>
                      ) : (
                        goal.milestones.map(milestone => (
                          <div key={milestone.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{milestone.title}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{milestone.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(milestone.targetDate).toLocaleDateString()}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-200 text-gray-700'
                                  }`}>
                                    {milestone.status}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedGoal(goal);
                                  setSelectedMilestone(milestone);
                                  setShowCreateTask(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                              >
                                <Plus className="h-3 w-3" /> Task
                              </button>
                            </div>

                            {/* Progress */}
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{milestone.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-blue-600 rounded-full h-2 transition-all"
                                  style={{ width: `${milestone.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Tasks */}
                            {milestone.tasks.length > 0 && (
                              <div className="space-y-2">
                                {milestone.tasks.map(task => (
                                  <div key={task.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded p-3">
                                    <button
                                      onClick={() => updateTaskStatus(goal.id, milestone.id, task.id, 
                                        task.status === 'completed' ? 'not-started' : 
                                        task.status === 'in-progress' ? 'completed' : 'in-progress'
                                      )}
                                      className="flex-shrink-0"
                                    >
                                      {task.status === 'completed' ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      ) : task.status === 'in-progress' ? (
                                        <Circle className="h-5 w-5 text-blue-600" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-gray-400" />
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium ${
                                        task.status === 'completed' 
                                          ? 'line-through text-gray-500 dark:text-gray-400' 
                                          : 'text-gray-900 dark:text-white'
                                      }`}>
                                        {task.title}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>{task.assignedTo}</span>
                                        <span>•</span>
                                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                        <span className={`px-1.5 py-0.5 rounded ${
                                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                          {task.priority}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['active', 'on-hold', 'completed'] as const).map(status => (
            <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                {status.replace('-', ' ')} ({goals.filter(g => g.status === status).length})
              </h3>
              <div className="space-y-3">
                {goals.filter(g => g.status === status).map(goal => {
                  const config = categoryConfig[goal.category];
                  return (
                    <div key={goal.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{config.icon}</span>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{goal.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{goal.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{goal.milestones.length} milestones</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                        <div
                          className={`bg-gradient-to-r ${config.color} rounded-full h-1.5`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="space-y-6">
            {filteredGoals.map((goal, idx) => {
              const config = categoryConfig[goal.category];
              const daysUntilTarget = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={goal.id} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xl`}>
                      {config.icon}
                    </div>
                    {idx < filteredGoals.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{goal.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={daysUntilTarget < 30 ? 'text-red-600 font-semibold' : ''}>
                        {daysUntilTarget > 0 ? `${daysUntilTarget} days remaining` : 'Overdue'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${config.color} rounded-full h-2`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-6 w-6 text-orange-600" /> Create New Goal
              </h3>
              <button
                onClick={() => setShowCreateGoal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Increase Annual Revenue by 30%"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the goal and why it's important..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Goal['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="strategic">🎯 Strategic</option>
                  <option value="revenue">💰 Revenue</option>
                  <option value="growth">📈 Growth</option>
                  <option value="operational">⚙️ Operational</option>
                  <option value="team">👥 Team</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date *</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Owner *</label>
                <select
                  value={newGoal.owner}
                  onChange={(e) => setNewGoal({ ...newGoal, owner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select owner...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.name}>{member.name} - {member.role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateGoal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createGoal}
                disabled={!newGoal.title || !newGoal.description || !newGoal.startDate || !newGoal.targetDate || !newGoal.owner}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Milestone Modal */}
      {showCreateMilestone && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Milestone</h3>
              <button onClick={() => setShowCreateMilestone(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-sm">
                <strong>Goal:</strong> {selectedGoal.title}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Milestone Title *</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="e.g., Launch New Product Line"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  rows={3}
                  placeholder="Describe what needs to be accomplished..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date *</label>
                <input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  min={selectedGoal.startDate}
                  max={selectedGoal.targetDate}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateMilestone(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button
                onClick={createMilestone}
                disabled={!newMilestone.title || !newMilestone.description || !newMilestone.targetDate}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && selectedGoal && selectedMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Task</h3>
              <button onClick={() => setShowCreateTask(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                <strong>Milestone:</strong> {selectedMilestone.title}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Complete market research"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To *</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline *</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    max={selectedMilestone.targetDate}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority *</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateTask(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={!newTask.title || !newTask.assignedTo || !newTask.deadline}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
