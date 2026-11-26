'use client';

import React, { useMemo, useState } from 'react';
import { RotateCcw, Search, ShieldAlert } from 'lucide-react';
import { CascadingLocationSelect } from '@/components/location/CascadingLocationSelect';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import {
  BLOOD_GROUP_CODES,
  BLOOD_GROUP_LABELS,
  rankMatchingDonors,
} from '@/lib/donor-ranking';
import type { BloodGroupCode, LocationSelection } from '@/types';
import { DonorCard } from './DonorCard';

const EMPTY_LOCATION: LocationSelection = {
  divisionId: '',
  districtId: '',
  upazilaId: '',
  postOfficeId: '',
  villageId: '',
};

interface DonorSearchSectionProps {
  onOpenRequestModal: () => void;
  onOpenAuthModal: () => void;
}

export function DonorSearchSection({
  onOpenRequestModal,
  onOpenAuthModal,
}: DonorSearchSectionProps) {
  const { t } = useTranslation();
  const {
    users,
    currentUser,
    requests,
    confirmedDonorIdsForCurrentUser,
    createOrConfirmEmergencyMatch,
  } = useAppState();
  const { showToast } = useToast();

  const [bloodGroup, setBloodGroup] = useState<BloodGroupCode>('O_POS');
  const [includeCompatible, setIncludeCompatible] = useState<boolean>(true);
  const [location, setLocation] = useState<LocationSelection>({
    divisionId: 'div-dhaka',
    districtId: 'dist-dhaka',
    upazilaId: '',
    postOfficeId: '',
    villageId: '',
  });

  const rankedDonors = useMemo(
    () =>
      rankMatchingDonors(users, {
        bloodGroupNeeded: bloodGroup,
        includeCompatible,
        divisionId: location.divisionId || undefined,
        districtId: location.districtId || undefined,
        upazilaId: location.upazilaId || undefined,
        postOfficeId: location.postOfficeId || undefined,
        villageId: location.villageId || undefined,
        confirmedDonorIds: confirmedDonorIdsForCurrentUser,
        excludeUserId: currentUser?.id,
      }),
    [
      users,
      bloodGroup,
      includeCompatible,
      location,
      confirmedDonorIdsForCurrentUser,
      currentUser?.id,
    ]
  );

  const handleReset = () => {
    setLocation(EMPTY_LOCATION);
    setIncludeCompatible(true);
  };

  const handleMatchReveal = (donorId: string) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    const activeUserRequest = requests.find(
      (r) =>
        r.requesterId === currentUser.id &&
        (r.status === 'ACTIVE' || r.status === 'IN_PROGRESS')
    );

    const targetRequestId = activeUserRequest?.id ?? requests[0]?.id;
    if (!targetRequestId) {
      onOpenRequestModal();
      return;
    }

    // Confirm emergency match to unlock masked phone number per privacy requirement
    createOrConfirmEmergencyMatch(targetRequestId, donorId, true);
    showToast(t.toasts.matchConfirmed, 'success');
  };

  return (
    <section className="space-y-6">
      {/* Search Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t.donorSearch.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.donorSearch.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.donorSearch.resetBtn}</span>
          </button>
        </div>

        {/* Blood Group Quick Selector Pills */}
        <div className="mt-5">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
            {t.bloodGroup.label}
          </label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {BLOOD_GROUP_CODES.map((code) => {
              const selected = bloodGroup === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setBloodGroup(code)}
                  className={`rounded-xl border py-2.5 text-sm font-extrabold transition ${
                    selected
                      ? 'border-crimson-700 bg-crimson-700 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-crimson-300 hover:bg-crimson-50'
                  }`}
                >
                  {BLOOD_GROUP_LABELS[code]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Tier Cascading Location Filter */}
        <div className="mt-5">
          <CascadingLocationSelect value={location} onChange={setLocation} allowAll compact />
        </div>

        {/* Emergency Compatibility Toggle */}
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-crimson-100 bg-crimson-50/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-crimson-700" />
            <div>
              <p className="text-sm font-bold text-slate-900">{t.donorSearch.compatibleToggle}</p>
              <p className="text-xs text-slate-600">{t.donorSearch.compatibleHint}</p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center self-start sm:self-center">
            <input
              type="checkbox"
              checked={includeCompatible}
              onChange={(e) => setIncludeCompatible(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-crimson-700 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
          <Search className="h-4 w-4 text-crimson-700" />
          <span>{t.donorSearch.resultsCount.replace('{count}', String(rankedDonors.length))}</span>
        </div>
      </div>

      {/* Ranked Donor Grid */}
      {rankedDonors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-base font-bold text-slate-900">{t.donorSearch.noResultsTitle}</h3>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
            {t.donorSearch.noResultsDesc}
          </p>
          <button
            type="button"
            onClick={onOpenRequestModal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-crimson-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-crimson-800"
          >
            {t.hero.ctaPostRequest}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rankedDonors.map((ranked) => (
            <DonorCard
              key={ranked.donor.id}
              ranked={ranked}
              onRequestMatchReveal={handleMatchReveal}
            />
          ))}
        </div>
      )}
    </section>
  );
}
