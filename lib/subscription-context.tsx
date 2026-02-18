'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getCurrentAccessContext,
  getPlanPermissions,
  getUserPermissions,
  type PlanPermissions,
  type PlanType,
  type UserPermissions,
  type UserType,
} from '@/lib/accessControl';
import { AUTH_CHANGE_EVENT } from '@/lib/auth';
import {
  getPlanFeatureFlags,
  getPlanMeta,
  listPlans,
  normalizePlanCode,
  type PlanLimits,
  type PlanMeta,
  type SubscriptionFeatureKey,
} from '@/lib/subscriptionPlans';

interface SubscriptionSnapshot {
  planType: PlanType;
  plan: PlanMeta;
  planPermissions: PlanPermissions;
  permissions: UserPermissions;
  userType: UserType;
  selectedPlanLabel: string;
  entitlements: Record<SubscriptionFeatureKey, boolean>;
  limits: PlanLimits;
}

interface SubscriptionContextValue extends SubscriptionSnapshot {
  refresh: () => void;
  hasFeature: (feature: SubscriptionFeatureKey) => boolean;
}

const FALLBACK_PLAN = getPlanMeta('free_trial');
const FALLBACK_SNAPSHOT: SubscriptionSnapshot = {
  planType: 'free_trial',
  plan: FALLBACK_PLAN,
  planPermissions: getPlanPermissions('free_trial'),
  permissions: getUserPermissions('business'),
  userType: 'business',
  selectedPlanLabel: FALLBACK_PLAN.name,
  entitlements: getPlanFeatureFlags('free_trial'),
  limits: FALLBACK_PLAN.limits,
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  ...FALLBACK_SNAPSHOT,
  refresh: () => undefined,
  hasFeature: () => false,
});

function readSelectedPlanLabel(): string {
  if (typeof window === 'undefined') return FALLBACK_PLAN.name;
  try {
    const activeUserRaw = window.localStorage.getItem('userData');
    if (activeUserRaw) {
      const parsed = JSON.parse(activeUserRaw);
      if (parsed?.plan) {
        const matched = listPlans().find((plan) => normalizePlanCode(plan.code) === normalizePlanCode(parsed.plan));
        if (matched) {
          return matched.name;
        }
      }
    }

    const selectedPlan = window.localStorage.getItem('selectedPlan');
    if (selectedPlan) {
      const matched = listPlans().find((plan) => normalizePlanCode(plan.code) === normalizePlanCode(selectedPlan));
      if (matched) return matched.name;
      return selectedPlan;
    }
  } catch (error) {
    console.warn('Failed to read selected plan label', error);
  }

  return FALLBACK_PLAN.name;
}

function buildSnapshot(): SubscriptionSnapshot {
  if (typeof window === 'undefined') {
    return FALLBACK_SNAPSHOT;
  }

  try {
    const accessContext = getCurrentAccessContext();
    const planMeta = getPlanMeta(accessContext.planType);

    return {
      planType: accessContext.planType,
      plan: planMeta,
      planPermissions: accessContext.planPermissions,
      permissions: accessContext.permissions,
      userType: accessContext.userType,
      selectedPlanLabel: readSelectedPlanLabel(),
      entitlements: { ...getPlanFeatureFlags(accessContext.planType) },
      limits: planMeta.limits,
    };
  } catch (error) {
    console.error('Failed to build subscription snapshot', error);
    return FALLBACK_SNAPSHOT;
  }
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot>(buildSnapshot);

  const refresh = useCallback(() => {
    setSnapshot(buildSnapshot());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (!event.key) {
        refresh();
        return;
      }

      if (event.key === 'userData' || event.key === 'selectedPlan' || event.key === 'veltrix_users') {
        refresh();
      }
    };

    const handleAuthChange = () => refresh();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);
    };
  }, [refresh]);

  const value = useMemo<SubscriptionContextValue>(() => ({
    ...snapshot,
    refresh,
    hasFeature: (feature: SubscriptionFeatureKey) => Boolean(snapshot.entitlements[feature]),
  }), [snapshot, refresh]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}
