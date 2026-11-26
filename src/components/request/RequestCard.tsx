'use client';

import React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  RefreshCw,
  Share2,
} from 'lucide-react';
import {
  BloodGroupBadge,
  RequestStatusPill,
  UrgencyPill,
} from '@/components/ui/Badge';
import { resolveLocationNames } from '@/data/bangladesh-locations';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import { getEffectiveRequestStatus, getRemainingHours } from '@/lib/request-lifecycle';
import type { BloodRequestItem } from '@/types';

interface RequestCardProps {
  request: BloodRequestItem;
  onShareClick: (request: BloodRequestItem) => void;
  onOpenAuthModal: () => void;
}

export function RequestCard({ request, onShareClick, onOpenAuthModal }: RequestCardProps) {
  const { lang, t } = useTranslation();
  const {
    currentUser,
    updateRequestStatus,
    extendRequestExpiry,
    createOrConfirmEmergencyMatch,
  } = useAppState();
  const { showToast } = useToast();

  const effectiveStatus = getEffectiveRequestStatus(request);
  const hoursRemaining = getRemainingHours(request.expiresAt);
  const isOwner = currentUser?.id === request.requesterId;

  const loc = resolveLocationNames(
    {
      divisionId: request.divisionId,
      districtId: request.districtId,
      upazilaId: request.upazilaId,
      postOfficeId: request.postOfficeId ?? undefined,
      villageOrArea: request.villageOrArea,
    },
    lang
  );

  const handleOfferDonation = () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    createOrConfirmEmergencyMatch(request.id, currentUser.id, false);
    showToast(t.toasts.matchCreated, 'success');
  };

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <BloodGroupBadge group={request.bloodGroupNeeded} />
            <div>
              <h3 className="text-base font-bold text-slate-900">{request.patientName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <RequestStatusPill status={effectiveStatus} />
                <UrgencyPill level={request.urgencyLevel} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-800">
              {request.unitsFulfilled}/{request.unitsRequired} {t.common.bags}
            </span>
          </div>
        </div>

        {/* Hospital & Location */}
        <div className="mt-4 space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-crimson-700" />
            <div>
              <p className="font-bold text-slate-900">{request.hospitalName}</p>
              <p className="text-slate-600">
                {t.requestBoard.wardLabel}: {request.wardCabinBed}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <span>{loc.fullBreadcrumb || loc.compact}</span>
          </div>

          <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
            <strong className="text-slate-900">{t.requestBoard.reasonLabel}:</strong>{' '}
            {request.medicalReason}
          </p>
        </div>

        {/* Expiry Banner */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          {effectiveStatus === 'EXPIRED' ? (
            <span className="font-semibold text-amber-800">{t.requestBoard.expiredNotice}</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              {t.requestBoard.autoExpireNote}:{' '}
              <strong className="text-slate-900">
                {hoursRemaining} {t.common.hoursLeft}
              </strong>
            </span>
          )}

          {(isOwner || effectiveStatus === 'EXPIRED') &&
            effectiveStatus !== 'FULFILLED' &&
            effectiveStatus !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => {
                  extendRequestExpiry(request.id);
                  showToast(t.toasts.requestExtended, 'success');
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-200"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{t.requestBoard.extendExpiryBtn}</span>
              </button>
            )}
        </div>
      </div>

      {/* Contact & Lifecycle Action Buttons */}
      <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">
            {t.requestBoard.contactLabel}:{' '}
            <strong className="text-slate-900">{request.contactPersonName}</strong>
          </span>
          <a
            href={`tel:${request.primaryMobile}`}
            className="inline-flex items-center gap-1 font-mono font-bold text-crimson-700 hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            {request.primaryMobile}
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onShareClick(request)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            <Share2 className="h-3.5 w-3.5 text-crimson-700" />
            <span>{t.requestBoard.shareCardBtn}</span>
          </button>

          {!isOwner &&
            (effectiveStatus === 'ACTIVE' || effectiveStatus === 'IN_PROGRESS') && (
              <button
                type="button"
                onClick={handleOfferDonation}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>{t.requestBoard.offerToDonateBtn}</span>
              </button>
            )}

          {isOwner && effectiveStatus !== 'FULFILLED' && effectiveStatus !== 'CANCELLED' && (
            <>
              {effectiveStatus === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => {
                    updateRequestStatus(request.id, 'IN_PROGRESS');
                    showToast(t.toasts.statusUpdated, 'info');
                  }}
                  className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-200"
                >
                  {t.requestBoard.markInProgressBtn}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  updateRequestStatus(request.id, 'FULFILLED');
                  showToast(t.toasts.statusUpdated, 'success');
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t.requestBoard.markFulfilledBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  updateRequestStatus(request.id, 'CANCELLED');
                  showToast(t.toasts.statusUpdated, 'info');
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                {t.requestBoard.cancelRequestBtn}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
