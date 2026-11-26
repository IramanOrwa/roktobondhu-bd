'use client';

import React from 'react';
import { CheckCircle2, Clock, HeartHandshake, PhoneCall } from 'lucide-react';
import { useTranslation } from '@/i18n/context';

export function BloodDonationGuidelines() {
  const { t } = useTranslation();

  const cards = [
    {
      title: t.guidelines.eligibilityTitle,
      items: t.guidelines.eligibilityItems,
      icon: CheckCircle2,
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      title: t.guidelines.cooldownTitle,
      items: t.guidelines.cooldownItems,
      icon: Clock,
      accent: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      title: t.guidelines.prePostTitle,
      items: t.guidelines.prePostItems,
      icon: HeartHandshake,
      accent: 'text-crimson-700 bg-crimson-50 border-crimson-200',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">{t.guidelines.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.guidelines.subtitle}</p>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${card.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson-700" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-crimson-200 bg-crimson-50 p-4 sm:flex-row sm:items-center sm:gap-3">
          <PhoneCall className="h-5 w-5 shrink-0 text-crimson-700" />
          <div>
            <p className="text-sm font-bold text-crimson-900">
              {t.guidelines.emergencyHelplineTitle}
            </p>
            <p className="text-xs font-medium text-crimson-800">
              {t.guidelines.emergencyHelplineDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
