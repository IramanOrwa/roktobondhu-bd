'use client';

import React, { useEffect, useState } from 'react';
import {
  Award,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Lock,
  LogIn,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { CascadingLocationSelect } from '@/components/location/CascadingLocationSelect';
import { RequestCard } from '@/components/request/RequestCard';
import { SocialShareModal } from '@/components/request/SocialShareModal';
import {
  AvailabilityBadge,
  BloodGroupBadge,
  HeroBadgePill,
} from '@/components/ui/Badge';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import { COOLDOWN_DAYS, evaluateCooldown, getNextBadgeTarget } from '@/lib/cooldown';
import { BLOOD_GROUP_CODES, BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';
import { isFutureDate } from '@/lib/validation';
import type { BloodGroupCode, BloodRequestItem, LocationSelection } from '@/types';

interface UnifiedDashboardProps {
  onOpenAuthModal: () => void;
}

export function UnifiedDashboard({ onOpenAuthModal }: UnifiedDashboardProps) {
  const { t } = useTranslation();
  const {
    currentUser,
    users,
    requests,
    matches,
    updateCurrentUserProfile,
    logExternalDonation,
    confirmMatch,
    completeMatchDonation,
  } = useAppState();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroupCode>('O_POS');
  const [location, setLocation] = useState<LocationSelection>({
    divisionId: 'div-dhaka',
    districtId: 'dist-dhaka',
    upazilaId: 'upz-dhanmondi',
    postOfficeId: 'po-dhanmondi-1205',
    villageId: 'vil-kalabagan',
  });

  const [externalDate, setExternalDate] = useState('');
  const [externalCenter, setExternalCenter] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<BloodRequestItem | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setFullName(currentUser.fullName);
    setDateOfBirth(currentUser.dateOfBirth || '');
    setWhatsappNumber(currentUser.whatsappNumber || currentUser.mobileNumber);
    setBloodGroup(currentUser.bloodGroup);
    setLocation({
      divisionId: currentUser.divisionId,
      districtId: currentUser.districtId,
      upazilaId: currentUser.upazilaId,
      postOfficeId: currentUser.postOfficeId,
      villageId: currentUser.villageId,
    });
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">{t.dashboard.notSignedInTitle}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          {t.dashboard.notSignedInDesc}
        </p>
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-crimson-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-crimson-800"
        >
          <LogIn className="h-4 w-4" />
          <span>{t.dashboard.openAuthBtn}</span>
        </button>
      </section>
    );
  }

  const cooldown = evaluateCooldown(currentUser.lastDonationDate, currentUser.manualAvailable);
  const progressPercent = cooldown.isOnCooldown && cooldown.daysElapsed !== null
    ? Math.min(100, Math.round((cooldown.daysElapsed / COOLDOWN_DAYS) * 100))
    : 100;
  const nextBadge = getNextBadgeTarget(currentUser.totalDonations);

  const myRequests = requests.filter((r) => r.requesterId === currentUser.id);
  const myRequestIds = new Set(myRequests.map((r) => r.id));
  const relevantMatches = matches.filter(
    (m) => m.donorId === currentUser.id || myRequestIds.has(m.requestId)
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      fullName,
      dateOfBirth: dateOfBirth || undefined,
      whatsappNumber,
      bloodGroup,
      location,
    });
    showToast(t.toasts.profileSaved, 'success');
  };

  const handleLogDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalDate) {
      setDateError(t.validation.requiredField);
      return;
    }
    if (isFutureDate(externalDate)) {
      setDateError(t.validation.futureDateNotAllowed);
      return;
    }
    setDateError(null);
    logExternalDonation(externalDate, externalCenter);
    setExternalDate('');
    setExternalCenter('');
    showToast(t.toasts.donationLogged, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Identity & Gamification Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <BloodGroupBadge group={currentUser.bloodGroup} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{currentUser.fullName}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t.dashboard.unifiedRoleNote}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <AvailabilityBadge status={cooldown.effectiveStatus} />
                <HeroBadgePill tier={currentUser.heroBadge} />
                <span className="text-xs font-semibold text-slate-600">
                  {t.badges.donationsCount.replace('{count}', String(currentUser.totalDonations))}
                </span>
              </div>
              {nextBadge.nextTier && (
                <p className="mt-1 text-xs text-slate-500">
                  <Award className="mr-1 inline h-3.5 w-3.5 text-amber-600" />
                  {t.badges.nextBadgeHint
                    .replace('{needed}', String(nextBadge.donationsNeeded))
                    .replace('{tier}', t.badges[nextBadge.nextTier])}
                </p>
              )}
            </div>
          </div>

          {/* Availability & Privacy Quick Switches */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div>
                <p className="text-xs font-bold text-slate-800">{t.availability.toggleLabel}</p>
                <p className="text-[11px] text-slate-500">
                  {cooldown.isOnCooldown
                    ? t.availability.eligibleIn.replace('{days}', String(cooldown.daysRemaining))
                    : t.availability[cooldown.effectiveStatus]}
                </p>
              </div>
              <input
                type="checkbox"
                disabled={cooldown.isOnCooldown}
                checked={currentUser.manualAvailable && !cooldown.isOnCooldown}
                onChange={(e) => {
                  updateCurrentUserProfile({ manualAvailable: e.target.checked });
                  showToast(t.toasts.availabilityUpdated, 'info');
                }}
                className="h-5 w-5 accent-crimson-700 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{t.dashboard.hidePhoneLabel}</p>
                  <p className="text-[11px] text-slate-500">
                    {currentUser.hidePhoneNumber ? 'ON' : 'OFF'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.hidePhoneNumber}
                onChange={(e) => {
                  updateCurrentUserProfile({ hidePhoneNumber: e.target.checked });
                  showToast(t.toasts.privacyUpdated, 'info');
                }}
                className="h-5 w-5 accent-crimson-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 90-Day Cooldown + External Donation Logger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock
              className={`h-5 w-5 ${
                cooldown.isOnCooldown ? 'text-amber-600' : 'text-emerald-600'
              }`}
            />
            <h3 className="text-base font-bold text-slate-900">{t.dashboard.cooldownTitle}</h3>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className={cooldown.isOnCooldown ? 'text-amber-800' : 'text-emerald-700'}>
                {cooldown.isOnCooldown
                  ? t.availability.eligibleIn.replace('{days}', String(cooldown.daysRemaining))
                  : t.availability.eligibleNow}
              </span>
              <span className="text-xs text-slate-500">
                {cooldown.daysElapsed ?? 90}/{COOLDOWN_DAYS} {t.common.days}
              </span>
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  cooldown.isOnCooldown ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
              {cooldown.isOnCooldown
                ? t.dashboard.cooldownActiveDesc
                : t.dashboard.cooldownReadyDesc}
            </p>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            <Lock className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
            {t.dashboard.hidePhoneDesc}
          </p>
        </section>

        {/* Log Past / External Donation */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-crimson-700" />
            <h3 className="text-base font-bold text-slate-900">{t.dashboard.logDonationTitle}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">{t.dashboard.logDonationDesc}</p>

          <form onSubmit={handleLogDonation} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  {t.dashboard.donationDateLabel}
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={externalDate}
                  onChange={(e) => setExternalDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  {t.dashboard.donationCenterLabel}
                </label>
                <input
                  type="text"
                  value={externalCenter}
                  onChange={(e) => setExternalCenter(e.target.value)}
                  placeholder={t.dashboard.donationCenterPlaceholder}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            {dateError && <p className="text-xs font-semibold text-crimson-700">{dateError}</p>}
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              {t.dashboard.logDonationBtn}
            </button>
          </form>
        </section>
      </div>

      {/* Unified Profile & 5-Tier Home Location Editor */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-crimson-700" />
          <h3 className="text-base font-bold text-slate-900">{t.dashboard.profileTitle}</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {t.dashboard.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {t.auth.dateOfBirthLabel}
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {t.dashboard.whatsappNumber}
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {t.bloodGroup.label}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroupCode)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                {BLOOD_GROUP_CODES.map((code) => (
                  <option key={code} value={code}>
                    {BLOOD_GROUP_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <CascadingLocationSelect value={location} onChange={setLocation} allowAll={false} compact />

          <button
            type="submit"
            className="rounded-xl bg-crimson-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-crimson-800"
          >
            {t.dashboard.saveProfileBtn}
          </button>
        </form>
      </section>

      {/* Emergency Matches Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">{t.dashboard.myMatchesTitle}</h3>
        {relevantMatches.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t.dashboard.noMatchesText}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {relevantMatches.map((match) => {
              const req = requests.find((r) => r.id === match.requestId);
              const donor = users.find((u) => u.id === match.donorId);
              return (
                <div
                  key={match.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-xs">
                    <p className="text-sm font-bold text-slate-900">
                      {req?.patientName || match.requestId} — {req?.hospitalName}
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      Donor: <strong>{donor?.fullName}</strong> ({donor?.mobileNumber}) • Status:{' '}
                      <span className="font-bold text-crimson-700">{match.status}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => {
                          confirmMatch(match.id);
                          showToast(t.toasts.matchConfirmed, 'success');
                        }}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        {t.dashboard.confirmMatchBtn}
                      </button>
                    )}
                    {match.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => {
                          completeMatchDonation(match.id);
                          showToast(t.toasts.donationCompleted, 'success');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-crimson-700 px-3 py-2 text-xs font-bold text-white hover:bg-crimson-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t.dashboard.completeDonationBtn}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My Posted Blood Requests */}
      {myRequests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">{t.dashboard.myRequestsTitle}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onShareClick={setShareTarget}
                onOpenAuthModal={onOpenAuthModal}
              />
            ))}
          </div>
        </section>
      )}

      <SocialShareModal request={shareTarget} onClose={() => setShareTarget(null)} />
    </div>
  );
}
