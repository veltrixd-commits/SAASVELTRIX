/**
 * User Mode System
 * 
 * Controls what modules, metrics, and features are visible
 * based on user type (Individual, Employee, Creator, Business Owner)
 */

import type { UserMode, UserModeConfig, ModuleName, MetricType, UserPermissions } from '@/types/autopilot';

// ============================================
// USER MODE CONFIGURATIONS
// ============================================

const USER_MODE_CONFIGS: Record<UserMode, Omit<UserModeConfig, 'mode' | 'permissions'>> = {
  individual: {
    visibleModules: ['wellness', 'tasks', 'finance', 'inbox'],
    dashboardMetrics: ['focus', 'energy', 'health', 'productivity'],
    tone: 'personal',
  },
  employee: {
    visibleModules: ['tasks', 'wellness', 'inbox', 'analytics', 'team'],
    dashboardMetrics: ['focus', 'productivity', 'energy', 'growth'],
    tone: 'professional',
  },
  creator: {
    visibleModules: ['content', 'inbox', 'analytics', 'wellness', 'finance'],
    dashboardMetrics: ['engagement', 'money', 'growth', 'energy'],
    tone: 'creative',
  },
  businessOwner: {
    visibleModules: ['leads', 'automation', 'finance', 'team', 'analytics', 'content', 'delivery', 'inbox', 'wellness'],
    dashboardMetrics: ['revenue', 'growth', 'productivity', 'focus'],
    tone: 'executive',
  },
};

// ============================================
// DEFAULT PERMISSIONS
// ============================================

const DEFAULT_PERMISSIONS: Record<UserMode, UserPermissions> = {
  individual: {
    canViewEarnings: true,
    canViewPerformance: true,
    canShareWellnessData: false,
    earningsVisibility: 'private',
    performanceVisibility: 'private',
    wellnessVisibility: 'private',
    allowAutopilot: true,
    allowWellnessGuardrails: true,
    allowPerformanceTracking: true,
  },
  employee: {
    canViewEarnings: false, // Must be enabled by owner
    canViewPerformance: true,
    canShareWellnessData: false,
    earningsVisibility: 'private',
    performanceVisibility: 'owner',
    wellnessVisibility: 'therapist-only',
    allowAutopilot: true,
    allowWellnessGuardrails: true,
    allowPerformanceTracking: true,
  },
  creator: {
    canViewEarnings: true,
    canViewPerformance: true,
    canShareWellnessData: false,
    earningsVisibility: 'private',
    performanceVisibility: 'public',
    wellnessVisibility: 'private',
    allowAutopilot: true,
    allowWellnessGuardrails: true,
    allowPerformanceTracking: true,
  },
  businessOwner: {
    canViewEarnings: true,
    canViewPerformance: true,
    canShareWellnessData: false,
    earningsVisibility: 'private',
    performanceVisibility: 'private',
    wellnessVisibility: 'owner-aggregate',
    allowAutopilot: true,
    allowWellnessGuardrails: true,
    allowPerformanceTracking: true,
  },
};

// ============================================
// USER MODE UTILITIES
// ============================================

/**
 * Get full configuration for a user mode
 */
export function getUserModeConfig(mode: UserMode, customPermissions?: Partial<UserPermissions>): UserModeConfig {
  const baseConfig = USER_MODE_CONFIGS[mode];
  const basePermissions = DEFAULT_PERMISSIONS[mode];
  
  return {
    mode,
    ...baseConfig,
    permissions: { ...basePermissions, ...customPermissions },
  };
}

/**
 * Check if a module is visible for this user mode
 */
export function isModuleVisible(mode: UserMode, moduleName: ModuleName): boolean {
  const config = USER_MODE_CONFIGS[mode];
  return config.visibleModules.includes(moduleName);
}

/**
 * Get dashboard metrics for this user mode
 */
export function getDashboardMetrics(mode: UserMode): MetricType[] {
  return USER_MODE_CONFIGS[mode].dashboardMetrics;
}

/**
 * Get tone/language for this user mode
 */
export function getTone(mode: UserMode): 'personal' | 'professional' | 'creative' | 'executive' {
  return USER_MODE_CONFIGS[mode].tone;
}

/**
 * Get human-readable name for user mode
 */
export function getUserModeName(mode: UserMode): string {
  const names: Record<UserMode, string> = {
    individual: 'Individual',
    employee: 'Employee',
    creator: 'Content Creator',
    businessOwner: 'Business Owner',
  };
  return names[mode];
}

/**
 * Get description for user mode
 */
export function getUserModeDescription(mode: UserMode): string {
  const descriptions: Record<UserMode, string> = {
    individual: 'Personal productivity, wellness, and life management',
    employee: 'Task management, team collaboration, and performance tracking',
    creator: 'Content creation, brand deals, and audience engagement',
    businessOwner: 'Full business automation, CRM, revenue tracking, and team management',
  };
  return descriptions[mode];
}

/**
 * Get icon for user mode
 */
export function getUserModeIcon(mode: UserMode): string {
  const icons: Record<UserMode, string> = {
    individual: '❤️',
    employee: '👔',
    creator: '🎬',
    businessOwner: '🏢',
  };
  return icons[mode];
}

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Check if user can see earnings data
 */
export function canViewEarnings(permissions: UserPermissions): boolean {
  return permissions.canViewEarnings;
}

/**
 * Check if user can see performance metrics
 */
export function canViewPerformance(permissions: UserPermissions): boolean {
  return permissions.canViewPerformance;
}

/**
 * Check if wellness guardrails are enabled
 */
export function hasWellnessGuardrails(permissions: UserPermissions): boolean {
  return permissions.allowWellnessGuardrails;
}

/**
 * Check if autopilot is enabled
 */
export function isAutopilotEnabled(permissions: UserPermissions): boolean {
  return permissions.allowAutopilot;
}

// ============================================
// MODE SWITCHING
// ============================================

/**
 * Validate mode switch (some switches require owner approval)
 */
export function canSwitchMode(currentMode: UserMode, newMode: UserMode, isOwner: boolean): boolean {
  // Anyone can switch to individual
  if (newMode === 'individual') return true;
  
  // Switching to businessOwner requires ownership
  if (newMode === 'businessOwner') return isOwner;
  
  // Other switches are allowed
  return true;
}

/**
 * Get recommended mode based on onboarding data
 */
export function getRecommendedMode(onboardingData: any): UserMode {
  // Check business details
  if (onboardingData.businessName && onboardingData.industry) {
    return 'businessOwner';
  }
  
  // Check focus areas
  if (onboardingData.focusAreas?.includes('content')) {
    return 'creator';
  }
  
  if (onboardingData.employerCode) {
    return 'employee';
  }
  
  return 'individual';
}

// ============================================
// METRIC LABELS
// ============================================

/**
 * Get human-readable labels for metrics
 */
export function getMetricLabel(metric: MetricType): string {
  const labels: Record<MetricType, string> = {
    focus: 'Focus',
    energy: 'Energy',
    money: 'Money',
    growth: 'Growth',
    health: 'Health',
    productivity: 'Productivity',
    engagement: 'Engagement',
    revenue: 'Revenue',
  };
  return labels[metric];
}

/**
 * Get metric icon
 */
export function getMetricIcon(metric: MetricType): string {
  const icons: Record<MetricType, string> = {
    focus: '🎯',
    energy: '⚡',
    money: '💰',
    growth: '📈',
    health: '❤️',
    productivity: '✅',
    engagement: '👥',
    revenue: '💵',
  };
  return icons[metric];
}
