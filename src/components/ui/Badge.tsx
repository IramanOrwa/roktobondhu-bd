'use client';

import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/i18n/context';
import { BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';
import type {
  BloodGroupCode,
  DonorAvailability,
  HeroBadgeTier,
  RequestStatus,
  UrgencyLevel,
} from '@/types';

export function BloodGroupBadge({
  group,
  size = 'md',
}: {
  group: BloodGroupCode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'lg'
      ? 'h-12 w-12 text-lg'
      : size === 'sm'
        ? 'h-8 w-8 text-xs'
        : 'h-10 w-10 text-sm';
  return (
    <span
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-xl bg-crimson-700 font-extrabold text-white shadow-sm`}
    >
      {BLOOD_GROUP_LABELS[group]}
    </span>
  );
}

export function AvailabilityBadge({ status }: { status: DonorAvailability }) {
  const { t } = useTranslation();
  const styles: Record<DonorAvailability, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UNAVAILABLE: 'bg-slate-100 text-slate-600 border-slate-200',
    ON_COOLDOWN: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'AVAILABLE'
            ? 'bg-emerald-500'
            : status === 'ON_COOLDOWN'
              ? 'bg-amber-500'
              : 'bg-slate-400'
        }`}
      />
      {t.availability[status]}
    </span>
  );
}

export function HeroBadgePill({ tier }: { tier: HeroBadgeTier }) {
  const { t } = useTranslation();
  if (tier === 'NONE') return null;

  const styles: Record<Exclude<HeroBadgeTier, 'NONE'>, string> = {
    BRONZE: 'bg-orange-50 text-orange-800 border-orange-200',
    SILVER: 'bg-slate-100 text-slate-700 border-slate-300',
    GOLD: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    LIFESAVER: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  };

  const Icon = tier === 'LIFESAVER' ? ShieldCheck : Award;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[tier]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {t.badges[tier]}
    </span>
  );
}

export function UrgencyPill({ level }: { level: UrgencyLevel }) {
  const { t } = useTranslation();
  const styles: Record<UrgencyLevel, string> = {
    EMERGENCY: 'bg-crimson-50 text-crimson-800 border-crimson-200 animate-pulse',
    WITHIN_24H: 'bg-amber-50 text-amber-800 border-amber-200',
    SCHEDULED: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[level]}`}
    >
      {t.requestForm.urgencyOptions[level]}
    </span>
  );
}

export function RequestStatusPill({ status }: { status: RequestStatus }) {
  const { t } = useTranslation();
  const styles: Record<RequestStatus, string> = {
    ACTIVE: 'bg-crimson-50 text-crimson-700 border-crimson-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-800 border-amber-200',
    FULFILLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    EXPIRED: 'bg-slate-100 text-slate-500 border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {t.requestBoard.statuses[status]}
    </span>
  );
}
