const CTA_EVENT_STORAGE_KEY = 'veltrix_cta_events';
const CTA_EVENT_MAX = 200;
const CTA_ANALYTICS_OPT_IN_KEY = 'ctaAnalyticsOptIn';

type AnalyticsMetadata = Record<string, string | number | boolean | null | undefined>;

export interface CtaAnalyticsEvent {
  id: string;
  label: string;
  destination?: string;
  surface?: string;
  metadata?: AnalyticsMetadata;
  timestamp?: string;
}

const isBrowser = typeof window !== 'undefined';

export function isCtaAnalyticsEnabled(): boolean {
  if (!isBrowser) {
    return false;
  }

  const envFlag = process.env.NEXT_PUBLIC_CTA_ANALYTICS_ENABLED;
  if (envFlag === 'true') return true;
  if (envFlag === 'false') return false;

  const storedPreference = window.localStorage.getItem(CTA_ANALYTICS_OPT_IN_KEY);
  if (storedPreference === 'true') return true;
  if (storedPreference === 'false') return false;

  return true;
}

export function setCtaAnalyticsOptIn(enabled: boolean) {
  if (!isBrowser) return;
  window.localStorage.setItem(CTA_ANALYTICS_OPT_IN_KEY, enabled ? 'true' : 'false');
}

export function getStoredCtaEvents(): CtaAnalyticsEvent[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(CTA_EVENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse CTA analytics events', error);
    return [];
  }
}

export function recordCtaClick(event: CtaAnalyticsEvent) {
  if (!isBrowser || !isCtaAnalyticsEnabled()) {
    return;
  }

  const payload: CtaAnalyticsEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const history = getStoredCtaEvents();
  history.unshift(payload);
  if (history.length > CTA_EVENT_MAX) {
    history.length = CTA_EVENT_MAX;
  }

  try {
    window.localStorage.setItem(CTA_EVENT_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to persist CTA analytics event', error);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[cta-analytics]', payload);
  }
}
