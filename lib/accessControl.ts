// Access Control & Role-Based Feature Management
// Controls which features users can access based on their user type

export type UserType = 'business' | 'employee' | 'creator' | 'individual';
export type PlanType = 'free_trial' | 'professional' | 'scale' | 'enterprise';

export interface UserPermissions {
  // Personal OS Features
  canAccessWellness: boolean;
  canAccessPerformance: boolean;
  canAccessContentStudio: boolean;
  canAccessProductivity: boolean;
  
  // Business Features
  canAccessLeads: boolean;
  canAccessInbox: boolean;
  canAccessConversations: boolean;
  canAccessProducts: boolean;
  canAccessPOS: boolean; // Point of Sale access
  canAccessDelivery: boolean;
  canAccessFinance: boolean; // Full finance or budgeting
  canAccessInvoices: boolean;
  canAccessAutomations: boolean;
  canAccessPipelines: boolean;
  canAccessAnalytics: boolean;
  canAccessScheduler: boolean;
  canUseAiAutomationReplies: boolean;
  canManageAiAutomationPermissions: boolean;
  
  // Special Access
  isBudgetingMode: boolean; // For individuals - finance becomes budgeting
  requiresCompanyApproval: boolean; // For employees
  hasLimitedBusinessFeatures: boolean; // For creators
}

export interface PlanPermissions {
  plan: PlanType;
  canUsePOS: boolean;
  canUseAutomations: boolean;
  canUseAnalytics: boolean;
  canUsePipelines: boolean;
  canUseDelivery: boolean;
  canUseInvoices: boolean;
  canUseFinanceCenter: boolean;
  maxProducts: number;
  maxUsers: number;
}

const PLAN_MATRIX: Record<PlanType, PlanPermissions> = {
  free_trial: {
    plan: 'free_trial',
    canUsePOS: true,
    canUseAutomations: true,
    canUseAnalytics: true,
    canUsePipelines: true,
    canUseDelivery: true,
    canUseInvoices: true,
    canUseFinanceCenter: true,
    maxProducts: 10,
    maxUsers: 1,
  },
  professional: {
    plan: 'professional',
    canUsePOS: true,
    canUseAutomations: true,
    canUseAnalytics: true,
    canUsePipelines: true,
    canUseDelivery: true,
    canUseInvoices: true,
    canUseFinanceCenter: true,
    maxProducts: 500,
    maxUsers: 10,
  },
  scale: {
    plan: 'scale',
    canUsePOS: true,
    canUseAutomations: true,
    canUseAnalytics: true,
    canUsePipelines: true,
    canUseDelivery: true,
    canUseInvoices: true,
    canUseFinanceCenter: true,
    maxProducts: 5000,
    maxUsers: 100,
  },
  enterprise: {
    plan: 'enterprise',
    canUsePOS: true,
    canUseAutomations: true,
    canUseAnalytics: true,
    canUsePipelines: true,
    canUseDelivery: true,
    canUseInvoices: true,
    canUseFinanceCenter: true,
    maxProducts: Number.MAX_SAFE_INTEGER,
    maxUsers: Number.MAX_SAFE_INTEGER,
  },
};

function normalizePlan(plan?: string): PlanType {
  const value = (plan || '').trim().toLowerCase();
  if (value === 'professional') return 'professional';
  if (value === 'scale') return 'scale';
  if (value === 'enterprise') return 'enterprise';
  if (value === 'free trial' || value === 'free_trial' || value === 'free') return 'free_trial';
  return 'free_trial';
}

export function getCurrentPlanType(): PlanType {
  if (typeof window === 'undefined') return 'free_trial';

  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return normalizePlan(parsed.plan);
    }

    const selectedPlan = localStorage.getItem('selectedPlan');
    return normalizePlan(selectedPlan || undefined);
  } catch (error) {
    console.error('Error reading current plan:', error);
    return 'free_trial';
  }
}

export function getPlanPermissions(planType: PlanType): PlanPermissions {
  return PLAN_MATRIX[planType] || PLAN_MATRIX.free_trial;
}

/**
 * Get employee-specific permissions from userData
 * Returns array of permissions assigned by company admin
 */
function getEmployeePermissions(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.userType === 'employee' && parsed.employeePermissions) {
        return parsed.employeePermissions;
      }
    }
  } catch (error) {
    console.error('Error getting employee permissions:', error);
  }
  
  return [];
}

const TEAM_PERMISSION_KEY = 'veltrix_team_member_permissions';

function getCurrentUserIdentity(): { id: string; email: string } {
  if (typeof window === 'undefined') {
    return { id: '', email: '' };
  }

  try {
    const userData = localStorage.getItem('userData');
    if (!userData) return { id: '', email: '' };
    const parsed = JSON.parse(userData);
    return {
      id: String(parsed.id || parsed.userId || parsed.email || '').trim().toLowerCase(),
      email: String(parsed.email || '').trim().toLowerCase(),
    };
  } catch {
    return { id: '', email: '' };
  }
}

function getTeamPermissionMap(): Record<string, any> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(TEAM_PERMISSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function hasOwnerGrantedPermission(permissionName: 'canUseAiAutomationReplies'): boolean {
  const identity = getCurrentUserIdentity();
  if (!identity.id && !identity.email) return false;

  const permissionMap = getTeamPermissionMap();
  const record = permissionMap[identity.id] || permissionMap[identity.email];
  if (!record || typeof record !== 'object') return false;

  return record[permissionName] === true;
}

/**
 * Get user permissions based on their user type
 */
export function getUserPermissions(userType: UserType): UserPermissions {
  switch (userType) {
    case 'business':
      // Business owners get full access to everything
      return {
        canAccessWellness: true,
        canAccessPerformance: true,
        canAccessContentStudio: true,
        canAccessProductivity: true,
        canAccessLeads: true,
        canAccessInbox: true,
        canAccessConversations: true,
        canAccessProducts: true,
        canAccessPOS: true,
        canAccessDelivery: true,
        canAccessFinance: true,
        canAccessInvoices: true,
        canAccessAutomations: true,
        canAccessPipelines: true,
        canAccessAnalytics: true,
        canAccessScheduler: true,
        canUseAiAutomationReplies: true,
        canManageAiAutomationPermissions: true,
        isBudgetingMode: false,
        requiresCompanyApproval: false,
        hasLimitedBusinessFeatures: false,
      };

    case 'employee':
      // Employees: Base permissions for personal features
      // Business features based on assigned role/permissions
      const employeePermissions = getEmployeePermissions();
      const canAccessAutomations = employeePermissions.includes('automations');
      const canUseAiAutomationReplies =
        employeePermissions.includes('automation_ai') ||
        hasOwnerGrantedPermission('canUseAiAutomationReplies');

      return {
        canAccessWellness: true,
        canAccessPerformance: true,
        canAccessContentStudio: true, // Personal content only
        canAccessProductivity: true,
        canAccessLeads: employeePermissions.includes('leads'),
        canAccessInbox: employeePermissions.includes('inbox'),
        canAccessConversations: employeePermissions.includes('conversations'),
        canAccessProducts: employeePermissions.includes('products'),
        canAccessPOS: employeePermissions.includes('sales') || employeePermissions.includes('pos'),
        canAccessDelivery: employeePermissions.includes('delivery'),
        canAccessFinance: employeePermissions.includes('finance'),
        canAccessInvoices: employeePermissions.includes('invoices'),
        canAccessAutomations,
        canAccessPipelines: employeePermissions.includes('pipelines'),
        canAccessAnalytics: employeePermissions.includes('analytics'),
        canAccessScheduler: true, // Personal scheduling
        canUseAiAutomationReplies: canAccessAutomations && canUseAiAutomationReplies,
        canManageAiAutomationPermissions: false,
        isBudgetingMode: false,
        requiresCompanyApproval: true,
        hasLimitedBusinessFeatures: false,
      };

    case 'creator':
      // Content Creators: Full personal features + limited business features
      return {
        canAccessWellness: true,
        canAccessPerformance: true,
        canAccessContentStudio: true,
        canAccessProductivity: true,
        canAccessLeads: true, // For brand deals and sponsorships
        canAccessInbox: true, // For fan messages
        canAccessConversations: true, // For managing DMs
        canAccessProducts: true, // For merchandise and digital products
        canAccessPOS: true, // For selling merchandise
        canAccessDelivery: false, // Limited access
        canAccessFinance: true, // Track creator income
        canAccessInvoices: true, // For brand deals
        canAccessAutomations: true, // For content workflows
        canAccessPipelines: false, // Limited access
        canAccessAnalytics: true, // Full analytics for content
        canAccessScheduler: true,
        canUseAiAutomationReplies: true,
        canManageAiAutomationPermissions: false,
        isBudgetingMode: false,
        requiresCompanyApproval: false,
        hasLimitedBusinessFeatures: true,
      };

    case 'individual':
      // Individuals: Personal features only, budgeting instead of business finance
      return {
        canAccessWellness: true,
        canAccessPerformance: true,
        canAccessContentStudio: true, // Personal vlogs/content
        canAccessProductivity: true,
        canAccessLeads: false,
        canAccessInbox: false,
        canAccessConversations: false,
        canAccessProducts: false,
        canAccessPOS: false,
        canAccessDelivery: false,
        canAccessFinance: true, // Becomes personal budgeting
        canAccessInvoices: false,
        canAccessAutomations: false,
        canAccessPipelines: false,
        canAccessAnalytics: false,
        canAccessScheduler: true, // Personal scheduling
        canUseAiAutomationReplies: false,
        canManageAiAutomationPermissions: false,
        isBudgetingMode: true,
        requiresCompanyApproval: false,
        hasLimitedBusinessFeatures: false,
      };

    default:
      // Default to individual permissions for safety
      return getUserPermissions('individual');
  }
}

/**
 * Get current user's type from localStorage
 */
export function getCurrentUserType(): UserType {
  if (typeof window === 'undefined') return 'individual';
  
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.userType || 'individual';
    }
  } catch (error) {
    console.error('Error reading user type:', error);
  }
  
  return 'individual';
}

/**
 * Get current user's permissions
 */
export function getCurrentUserPermissions(): UserPermissions {
  const userType = getCurrentUserType();
  const basePermissions = getUserPermissions(userType);
  const planType = getCurrentPlanType();
  const planPermissions = getPlanPermissions(planType);

  return {
    ...basePermissions,
    canAccessPOS: basePermissions.canAccessPOS && planPermissions.canUsePOS,
    canAccessAutomations: basePermissions.canAccessAutomations && planPermissions.canUseAutomations,
    canAccessAnalytics: basePermissions.canAccessAnalytics && planPermissions.canUseAnalytics,
    canAccessPipelines: basePermissions.canAccessPipelines && planPermissions.canUsePipelines,
    canAccessDelivery: basePermissions.canAccessDelivery && planPermissions.canUseDelivery,
    canAccessInvoices: basePermissions.canAccessInvoices && planPermissions.canUseInvoices,
    canAccessFinance: basePermissions.canAccessFinance && planPermissions.canUseFinanceCenter,
  };
}

export function getCurrentAccessContext() {
  const userType = getCurrentUserType();
  const planType = getCurrentPlanType();
  const planPermissions = getPlanPermissions(planType);
  const permissions = getCurrentUserPermissions();

  return {
    userType,
    planType,
    planPermissions,
    permissions,
  };
}

/**
 * Check if employee has been approved by their company
 */
export function isEmployeeApproved(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.userType === 'employee') {
        return parsed.companyApproved === true;
      }
    }
  } catch (error) {
    console.error('Error checking employee approval:', error);
  }
  
  return false;
}

/**
 * Get company approval status and company name
 */
export function getCompanyApprovalStatus(): {
  isEmployee: boolean;
  isApproved: boolean;
  companyName?: string;
  employerCode?: string;
  pendingApproval: boolean;
} {
  if (typeof window === 'undefined') {
    return { isEmployee: false, isApproved: false, pendingApproval: false };
  }
  
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.userType === 'employee') {
        return {
          isEmployee: true,
          isApproved: parsed.companyApproved === true,
          companyName: parsed.companyName,
          employerCode: parsed.employerCode,
          pendingApproval: !!parsed.employerCode && !parsed.companyApproved,
        };
      }
    }
  } catch (error) {
    console.error('Error checking company approval status:', error);
  }
  
  return { isEmployee: false, isApproved: false, pendingApproval: false };
}

/**
 * Feature labels based on user type
 */
export function getFeatureLabel(feature: string, userType: UserType): string {
  if (feature === 'finance' && userType === 'individual') {
    return 'Personal Budget';
  }
  
  const labels: Record<string, string> = {
    finance: 'Finance',
    wellness: 'Wellness',
    performance: 'Performance',
    contentStudio: 'Content Studio',
    productivity: 'Productivity',
    leads: 'Leads',
    inbox: 'Inbox',
    conversations: 'Conversations',
    products: 'Products',
    delivery: 'Delivery',
    invoices: 'Invoices',
    automations: 'Automations',
    pipelines: 'Pipelines',
    analytics: 'Analytics',
    scheduler: 'Scheduler',
  };
  
  return labels[feature] || feature;
}

/**
 * Get user type display name
 */
export function getUserTypeDisplayName(userType: UserType): string {
  const names: Record<UserType, string> = {
    business: 'Business Owner',
    employee: 'Employee',
    creator: 'Content Creator',
    individual: 'Individual',
  };
  
  return names[userType];
}

/**
 * Approve employee access (called by company admin)
 */
export function approveEmployeeAccess(employeeEmail: string, companyName: string): void {
  // In production, this would be an API call
  // For now, we'll update the employee's localStorage when they log in
  console.log(`Approved ${employeeEmail} for ${companyName}`);
}

export function canCurrentUserManageAiAutomationPermissions(): boolean {
  const permissions = getCurrentUserPermissions();
  return permissions.canManageAiAutomationPermissions === true;
}

export function canCurrentUserUseAiAutomationReplies(): boolean {
  const permissions = getCurrentUserPermissions();
  return permissions.canUseAiAutomationReplies === true;
}

export function setTeamMemberAiAutomationPermission(
  memberIdOrEmail: string,
  enabled: boolean,
  updatedBy?: string
): void {
  if (typeof window === 'undefined') return;

  const key = String(memberIdOrEmail || '').trim().toLowerCase();
  if (!key) return;

  const map = getTeamPermissionMap();
  const existing = map[key] || {};
  map[key] = {
    ...existing,
    canUseAiAutomationReplies: enabled,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || getCurrentUserIdentity().email || 'owner',
  };
  localStorage.setItem(TEAM_PERMISSION_KEY, JSON.stringify(map));
}

export function getTeamMemberAiAutomationPermission(memberIdOrEmail: string): boolean {
  const key = String(memberIdOrEmail || '').trim().toLowerCase();
  if (!key) return false;
  const map = getTeamPermissionMap();
  return map?.[key]?.canUseAiAutomationReplies === true;
}
