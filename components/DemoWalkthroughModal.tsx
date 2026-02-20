'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, ChevronRight, Inbox, Users, CheckSquare, ShoppingCart, DollarSign, Sparkles } from 'lucide-react';
import { usePersistedState } from '@/lib/hooks/usePersistedState';

const STEPS = [
  {
    key: 'inbox',
    icon: <Inbox className="w-8 h-8 text-purple-500" />,
    title: 'Inbox — All messages in one place',
    description: 'Every WhatsApp, DM, email and comment lands here. Reply, auto-respond, and never miss a lead.',
    href: '/dashboard/inbox',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    key: 'leads',
    icon: <Users className="w-8 h-8 text-blue-500" />,
    title: 'Leads — Turn strangers into customers',
    description: 'Automatically captured from every channel. Score, tag, and track every prospect through your pipeline.',
    href: '/dashboard/leads',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    key: 'tasks',
    icon: <CheckSquare className="w-8 h-8 text-green-500" />,
    title: 'Tasks — Stay on top of everything',
    description: 'Tasks, projects, and to-dos tied to your leads and deals. Assign, prioritise and track progress.',
    href: '/dashboard/productivity',
    color: 'from-green-500 to-teal-600',
  },
  {
    key: 'pos',
    icon: <ShoppingCart className="w-8 h-8 text-orange-500" />,
    title: 'POS — Sell anything, anywhere',
    description: 'Point of sale for products, services, and bookings. Accept payments and issue invoices instantly.',
    href: '/dashboard/pos',
    color: 'from-orange-500 to-red-500',
  },
  {
    key: 'finance',
    icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
    title: 'Finance — Know your numbers',
    description: 'Revenue, expenses, invoices, and cash flow — all in one view. No spreadsheets required.',
    href: '/dashboard/finance',
    color: 'from-emerald-500 to-green-600',
  },
] as const;

export default function DemoWalkthroughModal() {
  const router = useRouter();
  const [seen, setSeen] = usePersistedState<boolean>('demo:walkthrough:seen', false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Only show on first login, client-side only
  useEffect(() => {
    if (!seen) setOpen(true);
  }, [seen]);

  const handleClose = useCallback(() => {
    setSeen(true);
    setOpen(false);
  }, [setSeen]);

  const handleExplore = useCallback(() => {
    const target = STEPS[step];
    setSeen(true);
    setOpen(false);
    router.push(target.href);
  }, [step, router, setSeen]);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  }, [step, handleClose]);

  if (!open) return null;

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Demo walkthrough"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header gradient strip */}
        <div className={`h-2 w-full bg-gradient-to-r ${current.color}`} />

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Welcome headline (first step only) */}
          {step === 0 && (
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-purple-600 uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              Welcome to Veltrix
            </div>
          )}

          {/* Step icon + content */}
          <div className="flex items-start gap-4 mb-6">
            <div className="mt-0.5">{current.icon}</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{current.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{current.description}</p>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === step ? 'w-6 bg-purple-500' : 'w-1.5 bg-gray-200 dark:bg-gray-700'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExplore}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${current.color} hover:opacity-90 transition-opacity`}
            >
              Explore {current.title.split(' — ')[0]}
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {step < STEPS.length - 1 ? (
                <>Next <ArrowRight className="w-3.5 h-3.5" /></>
              ) : (
                'Finish'
              )}
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={handleClose}
            className="block w-full mt-3 text-xs text-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
