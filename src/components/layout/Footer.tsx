'use client';

import React from 'react';
import { HeartPulse, PhoneCall } from 'lucide-react';
import { useTranslation } from '@/i18n/context';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-crimson-700 text-white">
            <HeartPulse className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">{t.brand.name}</p>
            <p className="text-xs text-slate-400">{t.brand.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs">
          <PhoneCall className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{t.guidelines.emergencyHelplineDesc}</span>
        </div>
      </div>
    </footer>
  );
}
