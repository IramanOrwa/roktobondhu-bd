'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Globe,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  UserCheck,
  X,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import { BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';

export type ActiveTab = 'search' | 'requests' | 'dashboard' | 'guidelines';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenRequestModal: () => void;
  onOpenAuthModal: () => void;
}

export function Header({
  activeTab,
  onSelectTab,
  onOpenRequestModal,
  onOpenAuthModal,
}: HeaderProps) {
  const { lang, toggleLang, t } = useTranslation();
  const { currentUser, signOut } = useAppState();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'search', label: t.nav.findDonors },
    { id: 'requests', label: t.nav.emergencyBoard },
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'guidelines', label: t.nav.guidelines },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => handleNavClick('search')}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-crimson-700 text-white shadow-sm">
            <Droplets className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                {t.brand.name}
              </span>
              <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 sm:inline-block">
                {t.brand.emergencyBadge}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">{t.brand.tagline}</p>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                activeTab === item.id
                  ? 'bg-crimson-50 text-crimson-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Bilingual EN / বাংলা Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5 text-crimson-700" />
            <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenRequestModal}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-crimson-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-crimson-800 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t.nav.postEmergency}</span>
          </button>

          {currentUser ? (
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="max-w-[110px] truncate">{currentUser.fullName}</span>
                <span className="rounded bg-crimson-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {BLOOD_GROUP_LABELS[currentUser.bloodGroup]}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  showToast(t.toasts.signedOut, 'info');
                }}
                title={t.nav.signOut}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{t.nav.signIn}</span>
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                  activeTab === item.id
                    ? 'bg-crimson-50 text-crimson-700'
                    : 'bg-slate-50 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRequestModal();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-crimson-700 px-3 py-2 text-xs font-bold text-white"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t.nav.postEmergency}</span>
            </button>
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  signOut();
                  showToast(t.toasts.signedOut, 'info');
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.nav.signOut}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
              >
                <LogIn className="h-4 w-4" />
                <span>{t.nav.signIn}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
