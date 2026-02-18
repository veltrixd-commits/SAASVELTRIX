import type { PlanType } from '@/lib/accessControl';

export type PlanCode = PlanType;

export type SubscriptionFeatureKey =
  | 'personal_os'
  | 'task_system'
  | 'crm_basic'
  | 'content_calendar'
  | 'contacts_limit'
  | 'connected_platforms'
  | 'support_email'
  | 'ai_wellness'
  | 'performance_coach'
  | 'pos'
  | 'inventory'
  | 'invoicing'
  | 'content_studio'
  | 'brand_deals'
  | 'team_reviews'
  | 'support_priority'
  | 'unlimited_contacts'
  | 'six_platforms'
  | 'advanced_analytics'
  | 'ai_automation'
  | 'multi_tenant'
  | 'white_label'
  | 'unlimited_team'
  | 'custom_modules'
  | 'dedicated_manager'
  | 'support_premium'
  | 'training';

export type SubscriptionEntitlementLimit = number | 'unlimited' | null;

export interface SubscriptionEntitlement {
  key: SubscriptionFeatureKey;
  label: string;
  category: 'os' | 'productivity' | 'crm' | 'automation' | 'finance' | 'content' | 'support' | 'platform' | 'team';
  unit?: string;
  limit?: SubscriptionEntitlementLimit;
}

export interface PlanLimits {
  contacts: SubscriptionEntitlementLimit;
  connectedPlatforms: SubscriptionEntitlementLimit;
  automations: SubscriptionEntitlementLimit;
  teamSeats: SubscriptionEntitlementLimit;
  products: SubscriptionEntitlementLimit;
}

export type SupportLevel = 'standard' | 'priority' | 'dedicated';

export interface PlanMeta {
  code: PlanCode;
  name: string;
  description: string;
  highlight: string;
  priceZar: number | null;
  priceLabel: string;
  billingPeriodLabel: string;
  interval: 'monthly' | 'yearly';
  trialDays: number;
  icon: 'zap' | 'building' | 'crown' | 'shield';
  accent: string;
  recommended?: boolean;
  category: 'core' | 'enterprise';
  supportLevel: SupportLevel;
  ctaLabel: string;
  entitlements: SubscriptionEntitlement[];
  limits: PlanLimits;
  featureFlags: PlanFeatureFlagMap;
}

export interface PlanSeedRecord {
  plan: {
    code: string;
    name: string;
    description: string;
    priceCents: number;
    currency: string;
    interval: 'MONTHLY' | 'YEARLY';
    trialDays: number;
    maxUsers: number;
    maxLeads: number;
    maxAutomations: number;
    metadata: Record<string, any>;
  };
  entitlements: Array<{
    feature: string;
    unit?: string;
    limitValue?: number | null;
    isEnabled: boolean;
    metadata?: Record<string, any>;
  }>;
}

const FEATURE_KEYS: SubscriptionFeatureKey[] = [
  'personal_os',
  'task_system',
  'crm_basic',
  'content_calendar',
  'contacts_limit',
  'connected_platforms',
  'support_email',
  'ai_wellness',
  'performance_coach',
  'pos',
  'inventory',
  'invoicing',
  'content_studio',
  'brand_deals',
  'team_reviews',
  'support_priority',
  'unlimited_contacts',
  'six_platforms',
  'advanced_analytics',
  'ai_automation',
  'multi_tenant',
  'white_label',
  'unlimited_team',
  'custom_modules',
  'dedicated_manager',
  'support_premium',
  'training',
];

export type PlanFeatureFlagMap = Record<SubscriptionFeatureKey, boolean>;

const createEmptyFlagMap = (): PlanFeatureFlagMap => {
  return FEATURE_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as PlanFeatureFlagMap);
};

const PLAN_ORDER: PlanCode[] = ['free_trial', 'professional', 'scale', 'enterprise'];

const PLAN_DEFINITIONS: Record<PlanCode, PlanMeta> = (() => {
  const makePlan = (config: Omit<PlanMeta, 'featureFlags'>): PlanMeta => {
    const flags = createEmptyFlagMap();
    config.entitlements.forEach((entitlement) => {
      flags[entitlement.key] = true;
    });
    return { ...config, featureFlags: flags };
  };

  return {
    free_trial: makePlan({
      code: 'free_trial',
      name: 'Free Trial',
      description: 'Experience your complete operating system.',
      highlight: '7-day guided experience',
      priceZar: 0,
      priceLabel: 'R 0',
      billingPeriodLabel: '7 days',
      interval: 'monthly',
      trialDays: 7,
      icon: 'zap',
      accent: 'from-blue-600 to-purple-600',
      category: 'core',
      supportLevel: 'standard',
      ctaLabel: 'Start Free Trial',
      entitlements: [
        { key: 'personal_os', label: 'Personal OS (Morning Routine, Health)', category: 'os' },
        { key: 'task_system', label: 'Task & To-Do System', category: 'productivity' },
        { key: 'crm_basic', label: 'Basic CRM & Lead Management', category: 'crm' },
        { key: 'content_calendar', label: 'Content Calendar (Creators)', category: 'content' },
        { key: 'contacts_limit', label: 'Up to 100 contacts', category: 'crm', limit: 100, unit: 'contacts' },
        { key: 'connected_platforms', label: '2 connected platforms', category: 'platform', limit: 2, unit: 'platforms' },
        { key: 'support_email', label: 'Email support', category: 'support' },
      ],
      limits: {
        contacts: 100,
        connectedPlatforms: 2,
        automations: 2,
        teamSeats: 1,
        products: 10,
      },
    }),
    professional: makePlan({
      code: 'professional',
      name: 'Professional',
      description: 'Complete business & life operating system.',
      highlight: 'Most popular for operators',
      priceZar: 17000,
      priceLabel: 'R 17,000',
      billingPeriodLabel: 'per month',
      interval: 'monthly',
      trialDays: 14,
      icon: 'building',
      accent: 'from-purple-600 to-pink-600',
      recommended: true,
      category: 'core',
      supportLevel: 'priority',
      ctaLabel: 'Get Started',
      entitlements: [
        { key: 'personal_os', label: 'Full Personal OS (AI Therapist, Wellness)', category: 'os' },
        { key: 'performance_coach', label: 'Performance & Money Motivation', category: 'productivity' },
        { key: 'pos', label: 'Business Core (POS, Inventory, Invoicing)', category: 'finance' },
        { key: 'content_studio', label: 'Content Studio (Script Generator, Analytics)', category: 'content' },
        { key: 'brand_deals', label: 'Brand Deals & Sponsorship Tracker', category: 'crm' },
        { key: 'team_reviews', label: 'Leadership & Team Reviews', category: 'team' },
        { key: 'unlimited_contacts', label: 'Unlimited contacts & automation', category: 'crm', limit: 'unlimited' },
        { key: 'six_platforms', label: 'All 6 platforms integrated', category: 'platform', limit: 6, unit: 'platforms' },
        { key: 'advanced_analytics', label: 'Advanced analytics & reports', category: 'automation' },
        { key: 'support_priority', label: 'Priority support', category: 'support' },
      ],
      limits: {
        contacts: 'unlimited',
        connectedPlatforms: 6,
        automations: 25,
        teamSeats: 10,
        products: 500,
      },
    }),
    scale: makePlan({
      code: 'scale',
      name: 'Scale',
      description: 'Enterprise OS with white-label capabilities.',
      highlight: 'For multi-brand operators',
      priceZar: 44000,
      priceLabel: 'R 44,000',
      billingPeriodLabel: 'per month',
      interval: 'monthly',
      trialDays: 30,
      icon: 'crown',
      accent: 'from-orange-600 to-red-600',
      category: 'core',
      supportLevel: 'priority',
      ctaLabel: 'Get Started',
      entitlements: [
        { key: 'personal_os', label: 'Everything in Professional', category: 'os' },
        { key: 'multi_tenant', label: 'Multi-tenant SaaS deployment', category: 'platform' },
        { key: 'white_label', label: 'White-label your own OS', category: 'platform' },
        { key: 'unlimited_team', label: 'Unlimited team members', category: 'team', limit: 'unlimited' },
        { key: 'ai_automation', label: 'Advanced AI & automation', category: 'automation' },
        { key: 'custom_modules', label: 'Custom module development', category: 'automation' },
        { key: 'dedicated_manager', label: 'Dedicated account manager', category: 'support' },
        { key: 'support_premium', label: '24/7 premium support', category: 'support' },
        { key: 'training', label: 'Training & onboarding', category: 'team' },
      ],
      limits: {
        contacts: 'unlimited',
        connectedPlatforms: 'unlimited',
        automations: 100,
        teamSeats: 'unlimited',
        products: 5000,
      },
    }),
    enterprise: makePlan({
      code: 'enterprise',
      name: 'Enterprise',
      description: 'Custom OS tailored to your organization.',
      highlight: 'Custom build + success team',
      priceZar: null,
      priceLabel: 'Custom',
      billingPeriodLabel: 'engagement',
      interval: 'monthly',
      trialDays: 0,
      icon: 'shield',
      accent: 'from-gray-900 to-gray-700',
      category: 'enterprise',
      supportLevel: 'dedicated',
      ctaLabel: 'Contact Sales',
      entitlements: [
        { key: 'personal_os', label: 'Unlimited Everything', category: 'os', limit: 'unlimited' },
        { key: 'white_label', label: 'Full white-label + OEM', category: 'platform' },
        { key: 'multi_tenant', label: 'Multi-tenant orchestration', category: 'platform' },
        { key: 'custom_modules', label: 'Custom engineering pod', category: 'automation' },
        { key: 'dedicated_manager', label: 'Dedicated success squad', category: 'support' },
        { key: 'support_premium', label: '24/7 command center', category: 'support' },
        { key: 'training', label: 'Enterprise onboarding program', category: 'team' },
      ],
      limits: {
        contacts: 'unlimited',
        connectedPlatforms: 'unlimited',
        automations: 'unlimited',
        teamSeats: 'unlimited',
        products: 'unlimited',
      },
    }),
  };
})();

export const normalizePlanCode = (plan?: string): PlanCode => {
  const value = (plan || '').trim().toLowerCase();
  if (value === 'professional') return 'professional';
  if (value === 'scale') return 'scale';
  if (value === 'enterprise') return 'enterprise';
  if (value === 'free trial' || value === 'free_trial' || value === 'free') return 'free_trial';
  return 'free_trial';
};

export const listPlans = (options: { includeEnterprise?: boolean } = {}): PlanMeta[] => {
  const { includeEnterprise = true } = options;
  return PLAN_ORDER
    .filter((code) => includeEnterprise || code !== 'enterprise')
    .map((code) => PLAN_DEFINITIONS[code]);
};

export const getPlanMeta = (plan?: string): PlanMeta => {
  return PLAN_DEFINITIONS[normalizePlanCode(plan)];
};

export const getPlanEntitlements = (plan?: string): SubscriptionEntitlement[] => {
  return getPlanMeta(plan).entitlements;
};

export const getPlanLimits = (plan?: string): PlanLimits => {
  return getPlanMeta(plan).limits;
};

export const getPlanFeatureFlags = (plan?: string): PlanFeatureFlagMap => {
  return getPlanMeta(plan).featureFlags;
};

export const PLAN_SEED_DATA: PlanSeedRecord[] = PLAN_ORDER.map((code) => {
  const plan = PLAN_DEFINITIONS[code];
  const maxUsers = plan.limits.teamSeats && plan.limits.teamSeats !== 'unlimited'
    ? plan.limits.teamSeats
    : (plan.code === 'enterprise' ? 500 : 100);
  const maxLeads = plan.limits.contacts && plan.limits.contacts !== 'unlimited'
    ? plan.limits.contacts
    : (plan.code === 'enterprise' ? 1_000_000 : 50_000);
  const maxAutomations = plan.limits.automations && plan.limits.automations !== 'unlimited'
    ? plan.limits.automations
    : (plan.code === 'enterprise' ? 2_000 : 250);

  return {
    plan: {
      code: plan.code,
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceZar ? plan.priceZar * 100 : 0,
      currency: 'ZAR',
      interval: 'MONTHLY',
      trialDays: plan.trialDays,
      maxUsers: typeof maxUsers === 'number' ? maxUsers : 100,
      maxLeads: typeof maxLeads === 'number' ? maxLeads : 10000,
      maxAutomations: typeof maxAutomations === 'number' ? maxAutomations : 25,
      metadata: {
        highlight: plan.highlight,
        supportLevel: plan.supportLevel,
        category: plan.category,
      },
    },
    entitlements: plan.entitlements.map((entitlement) => ({
      feature: entitlement.key,
      unit: entitlement.unit,
      limitValue: typeof entitlement.limit === 'number' ? entitlement.limit : null,
      isEnabled: true,
      metadata: { label: entitlement.label, category: entitlement.category },
    })),
  };
});

export const describePlanSupport = (plan?: string): string => {
  const meta = getPlanMeta(plan);
  if (meta.supportLevel === 'dedicated') return 'Dedicated success squad + 24/7 command center';
  if (meta.supportLevel === 'priority') return 'Priority routing with senior success engineers';
  return 'Email support during business hours';
};
