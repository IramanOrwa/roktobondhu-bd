'use client';

import React, { useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { useTranslation } from '@/i18n/context';
import { BLOOD_GROUP_CODES, BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';
import { getEffectiveRequestStatus } from '@/lib/request-lifecycle';
import type { BloodGroupCode, BloodRequestItem, RequestStatus } from '@/types';
import { RequestCard } from './RequestCard';
import { SocialShareModal } from './SocialShareModal';

interface ActiveRequestsBoardProps {
  onOpenRequestModal: () => void;
  onOpenAuthModal: () => void;
}

export function ActiveRequestsBoard({
  onOpenRequestModal,
  onOpenAuthModal,
}: ActiveRequestsBoardProps) {
  const { t } = useTranslation();
  const { requests } = useAppState();

  const [statusFilter, setStatusFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [bloodFilter, setBloodFilter] = useState<'ALL' | BloodGroupCode>('ALL');
  const [shareTarget, setShareTarget] = useState<BloodRequestItem | null>(null);

  const filteredRequests = useMemo(
    () =>
      requests.filter((req) => {
        const eff = getEffectiveRequestStatus(req);
        if (statusFilter !== 'ALL' && eff !== statusFilter) return false;
        if (bloodFilter !== 'ALL' && req.bloodGroupNeeded !== bloodFilter) return false;
        return true;
      }),
    [requests, statusFilter, bloodFilter]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{t.requestBoard.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.requestBoard.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | RequestStatus)}
            aria-label={t.requestBoard.filterStatus}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">
              {t.requestBoard.filterStatus}: {t.common.all}
            </option>
            {(['ACTIVE', 'IN_PROGRESS', 'FULFILLED', 'EXPIRED', 'CANCELLED'] as RequestStatus[]).map(
              (st) => (
                <option key={st} value={st}>
                  {t.requestBoard.statuses[st]}
                </option>
              )
            )}
          </select>

          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value as 'ALL' | BloodGroupCode)}
            aria-label={t.requestBoard.filterBlood}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">
              {t.requestBoard.filterBlood}: {t.common.all}
            </option>
            {BLOOD_GROUP_CODES.map((code) => (
              <option key={code} value={code}>
                {BLOOD_GROUP_LABELS[code]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenRequestModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-crimson-700 px-4 py-2 text-xs font-bold text-white hover:bg-crimson-800"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t.nav.postEmergency}</span>
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-base font-bold text-slate-900">{t.requestBoard.emptyTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.requestBoard.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onShareClick={setShareTarget}
              onOpenAuthModal={onOpenAuthModal}
            />
          ))}
        </div>
      )}

      <SocialShareModal request={shareTarget} onClose={() => setShareTarget(null)} />
    </section>
  );
}
