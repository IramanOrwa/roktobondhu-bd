'use client';

import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import { BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';
import { isValidBangladeshMobile } from '@/lib/validation';

interface AuthOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthOtpModal({ isOpen, onClose }: AuthOtpModalProps) {
  const { t } = useTranslation();
  const { users, signInWithUser, registerOrLoginByMobile } = useAppState();
  const { showToast } = useToast();

  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = () => {
    if (!isValidBangladeshMobile(mobile)) {
      setError(t.validation.invalidBdMobile);
      return;
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setEnteredOtp(otp);
    setError(null);
    showToast(t.toasts.otpSent, 'info');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBangladeshMobile(mobile)) {
      setError(t.validation.invalidBdMobile);
      return;
    }
    if (!generatedOtp || enteredOtp.trim() !== generatedOtp) {
      setError(t.validation.invalidOtp);
      return;
    }

    registerOrLoginByMobile({
      mobileNumber: mobile,
      fullName: fullName.trim() || undefined,
    });
    showToast(t.toasts.signedIn, 'success');
    setGeneratedOtp(null);
    setEnteredOtp('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.modalTitle}
      subtitle={t.auth.modalSubtitle}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-5">
        {/* Instant Demo Account Switcher */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <p className="mb-2 text-xs font-bold text-slate-700">{t.auth.quickDemoLabel}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  signInWithUser(u.id);
                  showToast(t.toasts.signedIn, 'success');
                  onClose();
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:border-crimson-300 hover:bg-crimson-50 transition"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{u.fullName}</p>
                  <p className="text-[11px] text-slate-500">
                    {u.mobileNumber} • {t.availability[u.availabilityStatus]}
                  </p>
                </div>
                <span className="ml-2 shrink-0 rounded-lg bg-crimson-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {BLOOD_GROUP_LABELS[u.bloodGroup]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Simulated OTP Flow */}
        <form onSubmit={handleVerify} className="space-y-3.5 border-t border-slate-100 pt-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.auth.mobileLabel}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={t.auth.mobilePlaceholder}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-crimson-600 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                {generatedOtp ? t.auth.resendOtp : t.auth.sendOtpBtn}
              </button>
            </div>
          </div>

          {generatedOtp && (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="mr-1.5 inline h-4 w-4" />
                {t.auth.otpSentBanner.replace('{otp}', generatedOtp)}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {t.auth.otpLabel}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder={t.auth.otpPlaceholder}
                      className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 font-mono text-sm focus:border-crimson-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {t.auth.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.auth.fullNamePlaceholder}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-crimson-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-crimson-700 py-2.5 text-sm font-bold text-white hover:bg-crimson-800"
              >
                {t.auth.verifyLoginBtn}
              </button>
            </>
          )}

          {error && <p className="text-xs font-semibold text-crimson-700">{error}</p>}
        </form>
      </div>
    </Modal>
  );
}
