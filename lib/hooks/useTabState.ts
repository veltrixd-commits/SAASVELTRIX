'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * URL-driven tab state hook.
 * Active tab is stored as `?tab=<key>` in the URL so page refresh keeps the tab.
 *
 * @example
 * const { activeTab, setTab } = useTabState('overview', ['overview', 'leads', 'inbox']);
 *
 * <button
 *   data-active={activeTab === 'leads'}
 *   onClick={() => setTab('leads')}
 * >Leads</button>
 */
export function useTabState<T extends string>(
  defaultTab: T,
  validTabs: readonly T[],
  paramName = 'tab'
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get(paramName) as T | null;
  const activeTab: T = raw && (validTabs as readonly string[]).includes(raw) ? raw : defaultTab;

  const setTab = useCallback(
    (tab: T) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === defaultTab) {
        params.delete(paramName);
      } else {
        params.set(paramName, tab);
      }
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, pathname, searchParams, defaultTab, paramName]
  );

  return { activeTab, setTab };
}
