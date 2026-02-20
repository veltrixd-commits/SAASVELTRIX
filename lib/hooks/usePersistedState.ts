'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Works exactly like useState but syncs the value to localStorage.
 * On SSR the initialValue is used and hydration is deferred to the effect.
 *
 * @example
 * const [darkMode, setDarkMode] = usePersistedState('ui:dark-mode', false);
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Stay in sync with external changes (e.g. another tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setState(e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValue);
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, initialValue]);

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        try {
          if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // quota exceeded — silent
        }
        return next;
      });
    },
    [key]
  );

  return [state, set];
}
