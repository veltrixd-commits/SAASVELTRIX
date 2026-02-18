'use client';

import type { ReactNode } from 'react';
import { SubscriptionProvider } from '@/lib/subscription-context';

export function Providers({ children }: { children: ReactNode }) {
  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}
