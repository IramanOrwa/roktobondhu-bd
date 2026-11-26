'use client';

import React, { useMemo, useState } from 'react';
import { Activity, Droplets, MapPin, PlusCircle, Search } from 'lucide-react';
import { AuthOtpModal } from '@/components/dashboard/AuthOtpModal';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';
import { DonorSearchSection } from '@/components/donor/DonorSearchSection';
import { BloodDonationGuidelines } from '@/components/guidelines/BloodDonationGuidelines';
import { Footer } from '@/components/layout/Footer';
import { type ActiveTab, Header } from '@/components/layout/Header';
import { ActiveRequestsBoard } from '@/components/request/ActiveRequestsBoard';
import { EmergencyRequestModal } from '@/components/request/EmergencyRequestModal';
import { useAppState } from '@/context/AppStateContext';
import { useTranslation } from '@/i18n/context';
import { getEffectiveRequestStatus } from '@/lib/request-lifecycle';

export default function HomePage() {
  const { t } = useTranslation();
  const { users, requests } = useAppState();

  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const stats = useMemo(() => {
    const eligibleCount = users.filter((u) => u.availabilityStatus === 'AVAILABLE').length;
    const activeReqCount = requests.filter((r) => {
      const s = getEffectiveRequestStatus(r);
      return s === 'ACTIVE' || s === 'IN_PROGRESS';
    }).length;
    return { eligibleCount, activeReqCount };
  }, [users, requests]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenRequestModal={() => setRequestModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Compact Medical Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-crimson-800 via-crimson-700 to-slate-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                {t.hero.title}
              </h1>
              <p className="text-sm leading-relaxed text-crimson-100 sm:text-base">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-crimson-800 shadow-sm hover:bg-crimson-50 transition"
                >
                  <Search className="h-4 w-4" />
                  <span>{t.hero.ctaFindDonor}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{t.hero.ctaPostRequest}</span>
                </button>
              </div>
            </div>

            {/* Live Network KPI Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:w-96 shrink-0">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur">
                <Droplets className="h-4 w-4 text-emerald-300" />
                <p className="mt-2 text-2xl font-extrabold">{stats.eligibleCount}</p>
                <p className="text-[11px] font-medium text-crimson-100">
                  {t.hero.statActiveDonors}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur">
                <Activity className="h-4 w-4 text-amber-300" />
                <p className="mt-2 text-2xl font-extrabold">{stats.activeReqCount}</p>
                <p className="text-[11px] font-medium text-crimson-100">
                  {t.hero.statEmergencyRequests}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur">
                <MapPin className="h-4 w-4 text-sky-300" />
                <p className="mt-2 text-2xl font-extrabold">8</p>
                <p className="text-[11px] font-medium text-crimson-100">
                  {t.hero.statDistrictsCovered}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Active View */}
        {activeTab === 'search' && (
          <DonorSearchSection
            onOpenRequestModal={() => setRequestModalOpen(true)}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'requests' && (
          <ActiveRequestsBoard
            onOpenRequestModal={() => setRequestModalOpen(true)}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <UnifiedDashboard onOpenAuthModal={() => setAuthModalOpen(true)} />
        )}

        {activeTab === 'guidelines' && <BloodDonationGuidelines />}
      </main>

      <Footer />

      <EmergencyRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onCreated={() => setActiveTab('requests')}
      />

      <AuthOtpModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
