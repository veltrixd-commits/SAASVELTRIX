/**
 * Autopilot System Type Definitions
 * 
 * Core types for the Autopilot Engine that orchestrates
 * life and business automation across all modules.
 */

// ============================================
// USER MODE SYSTEM
// ============================================

export type UserMode = 'individual' | 'employee' | 'creator' | 'businessOwner';

export interface UserModeConfig {
  mode: UserMode;
  visibleModules: ModuleName[];
  dashboardMetrics: MetricType[];
  tone: 'personal' | 'professional' | 'creative' | 'executive';
  permissions: UserPermissions;
}

export type ModuleName = 
  | 'wellness'
  | 'tasks'
  | 'content'
  | 'leads'
  | 'automation'
  | 'finance'
  | 'team'
  | 'analytics'
  | 'delivery'
  | 'inbox';

export type MetricType =
  | 'focus'
  | 'energy'
  | 'money'
  | 'growth'
  | 'health'
  | 'productivity'
  | 'engagement'
  | 'revenue';

// ============================================
// PERMISSIONS & PRIVACY
// ============================================

export interface UserPermissions {
  // What data can this user see?
  canViewEarnings: boolean;
  canViewPerformance: boolean;
  canShareWellnessData: boolean;
  
  // What can others see about this user?
  earningsVisibility: 'private' | 'owner' | 'public';
  performanceVisibility: 'private' | 'owner' | 'public';
  wellnessVisibility: 'private' | 'therapist-only' | 'owner-aggregate' | 'public';
  
  // Automation controls
  allowAutopilot: boolean;
  allowWellnessGuardrails: boolean;
  allowPerformanceTracking: boolean;
}

// ============================================
// AUTOPILOT ENGINE
// ============================================

export interface AutopilotRecommendations {
  dailyFocusPlan: FocusPlan;
  priorityTasks: PriorityTask[];
  incomeOpportunities: IncomeOpportunity[];
  wellnessGuardrails: WellnessGuardrail[];
  insights: string[];
  generatedAt: Date;
}

export interface FocusPlan {
  primary: string;
  secondary: string[];
  energyLevel: 'low' | 'medium' | 'high';
  estimatedProductiveHours: number;
  recommendedBreaks: number;
}

export interface PriorityTask {
  id: string;
  title: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  revenueImpact: number | null; // ZAR
  energyRequired: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  category: 'lead' | 'content' | 'admin' | 'growth' | 'wellness';
  reason: string; // Why is this priority?
}

export interface IncomeOpportunity {
  id: string;
  type: 'hot-lead' | 'content-deal' | 'upsell' | 'automation-win';
  title: string;
  potentialRevenue: number; // ZAR
  effort: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  action: string;
  deadline?: Date;
}

export interface WellnessGuardrail {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'burnout-risk' | 'low-energy' | 'overwork' | 'stress-detected';
  message: string;
  recommendation: string;
  autoAction?: 'throttle-tasks' | 'suggest-break' | 'reschedule' | 'notify-owner';
}

// ============================================
// DATA SOURCES (from existing modules)
// ============================================

export interface AutopilotDataSources {
  leads: LeadData[];
  tasks: TaskData[];
  content: ContentData[];
  wellness: WellnessData;
  revenue: RevenueData;
  automation: AutomationData;
}

export interface LeadData {
  id: string;
  status: 'new' | 'hot' | 'warm' | 'cold';
  source: string;
  createdAt: Date;
  lastContact?: Date;
  estimatedValue?: number;
}

export interface TaskData {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completedAt?: Date;
  linkedRevenue?: number;
}

export interface ContentData {
  id: string;
  platform: string;
  published: boolean;
  scheduledDate?: Date;
  engagement?: number;
  revenue?: number;
}

export interface WellnessData {
  energyLevel: number; // 0-100
  stressLevel: number; // 0-100
  sleepHours: number;
  workHoursToday: number;
  workHoursThisWeek: number;
  lastBreak?: Date;
  burnoutRisk: number; // 0-100
}

export interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  revenueGoal: number;
  pipelineValue: number;
}

export interface AutomationData {
  activeAutomations: number;
  tasksAutomated: number;
  leadsProcessed: number;
  timeSaved: number; // minutes
}

// ============================================
// PERFORMANCE INSIGHTS
// ============================================

export interface PerformanceInsight {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  revenueCorrelation: number; // -1 to 1
  recommendation: string;
}

export interface MoneyFeedbackLoop {
  userId: string;
  action: string;
  result: string;
  revenueImpact: number;
  formula: string; // e.g., "10 leads responded → 2 sales → R 10,000"
  confidence: number; // 0-100
}
