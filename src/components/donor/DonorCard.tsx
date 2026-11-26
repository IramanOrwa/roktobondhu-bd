'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import {
  AvailabilityBadge,
  BloodGroupBadge,
  HeroBadgePill,
} from '@/components/ui/Badge';
import { resolveLocationNames } from '@/data/bangladesh-locations';
import { useTranslation } from '@/i18n/context';
import { normalizeBangladeshWhatsappUrl } from '@/lib/privacy';
import type { RankedDonor } from '@/types';

interface DonorCardProps {
  ranked: RankedDonor;
  onRequestMatchReveal: (donorId: string) => void;
}

export function DonorCard({ ranked, onRequestMatchReveal }: DonorCardProps) {
  const { lang, t } = useTranslation();
  const { donor, matchScore, matchTierLabel, isExactBloodMatch, displayPhone, isPhoneMasked } =
    ranked;

  const location = resolveLocationNames(
    {
      divisionId: donor.divisionId,
      districtId: donor.districtId,
      upazilaId: donor.upazilaId,
      postOfficeId: donor.postOfficeId,
      villageId: donor.villageId,
    },
    lang
  );

  const tierStyle =
    matchScore === 1
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : matchScore === 2
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';

  const whatsappHref = !isPhoneMasked
    ? normalizeBangladeshWhatsappUrl(
        donor.whatsappNumber || donor.mobileNumber,
        lang === 'bn'
          ? `আসসালামু আলাইকুম ${donor.fullName}, রক্তবন্ধু বিডি থেকে জরুরি রক্তের জন্য যোগাযোগ করছি।`
          : `Assalamu Alaikum ${donor.fullName}, reaching out via RoktoBondhu BD for an urgent blood need.`
      )
    : '#';

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-crimson-200 hover:shadow-md">
      <div>
        {/* Top Row: Blood Group + Name + Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <BloodGroupBadge group={donor.bloodGroup} />
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900">{donor.fullName}</h3>
                {donor.isMobileVerified && (
                  <span
                    title={t.common.verified}
                    className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {t.common.verified}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <AvailabilityBadge status={donor.availabilityStatus} />
                <HeroBadgePill tier={donor.heroBadge} />
              </div>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tierStyle}`}
          >
            {t.donorSearch.tiers[matchTierLabel]}
          </span>
        </div>

        {/* Blood Match Type & Donation Stats */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`rounded-md px-2 py-0.5 font-semibold ${
              isExactBloodMatch
                ? 'bg-crimson-50 text-crimson-700'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            {isExactBloodMatch
              ? t.donorSearch.exactBloodBadge
              : t.donorSearch.compatibleBloodBadge}
          </span>
          <span className="text-slate-500">
            • {t.badges.donationsCount.replace('{count}', String(donor.totalDonations))}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            • <Clock className="h-3 w-3" />
            {ranked.daysSinceLastDonation !== null
              ? t.donorSearch.lastDonated.replace('{days}', String(ranked.daysSinceLastDonation))
              : t.donorSearch.neverDonated}
          </span>
        </div>

        {/* 5-Tier Location Breadcrumb */}
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson-700" />
          <span className="leading-relaxed font-medium">{location.fullBreadcrumb}</span>
        </div>
      </div>

      {/* Contact / Privacy Actions */}
      <div className="mt-4 border-t border-slate-100 pt-3.5">
        {isPhoneMasked ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                {t.donorSearch.phoneMaskedNotice}
              </span>
              <span className="font-mono font-bold">{displayPhone}</span>
            </div>
            <button
              type="button"
              onClick={() => onRequestMatchReveal(donor.id)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-crimson-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-crimson-800 transition"
            >
              <Unlock className="h-4 w-4" />
              <span>{t.donorSearch.requestMatchBtn}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {donor.hidePhoneNumber && (
              <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t.donorSearch.matchConfirmedBadge} ({displayPhone})
              </p>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${displayPhone}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-crimson-700 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-crimson-800 transition"
              >
                <Phone className="h-4 w-4" />
                <span>{t.common.callNow}</span>
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.common.whatsapp}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
