'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Smartphone, User } from 'lucide-react';
import { CascadingLocationSelect } from '@/components/location/CascadingLocationSelect';
import { Modal } from '@/components/ui/Modal';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import { BLOOD_GROUP_CODES, BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';
import { isValidBangladeshMobile } from '@/lib/validation';
import type { BloodGroupCode, LocationSelection } from '@/types';

interface AuthOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthOtpModal({ isOpen, onClose }: AuthOtpModalProps) {
  const { t } = useTranslation();
  const { loginWithPassword, registerWithPassword } = useAppState();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroupCode>('O_POS');
  const [location, setLocation] = useState<LocationSelection>({
    divisionId: 'div-dhaka',
    districtId: 'dist-dhaka',
    upazilaId: 'upz-dhanmondi',
    postOfficeId: 'po-dhanmondi-1205',
    villageId: 'vil-kalabagan',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBangladeshMobile(mobile)) {
      setError(t.validation.invalidBdMobile);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }

    if (mode === 'login') {
      const res = loginWithPassword(mobile, password);
      if (!res.ok) {
        setError(t.auth.invalidCredentials);
        return;
      }
      showToast(t.toasts.signedIn, 'success');
      setError(null);
      setPassword('');
      onClose();
      return;
    }

    if (!fullName.trim()) {
      setError(t.validation.requiredField);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }
    if (!location.divisionId || !location.districtId || !location.upazilaId) {
      setError(t.validation.selectLocationRequired);
      return;
    }

    const res = registerWithPassword({
      mobileNumber: mobile,
      password,
      fullName,
      bloodGroup,
      location,
    });
    if (!res.ok) {
      setError(t.auth.accountAlreadyExists);
      return;
    }

    showToast(t.toasts.signedIn, 'success');
    setError(null);
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.modalTitle}
      subtitle={t.auth.modalSubtitle}
      maxWidthClass="max-w-xl"
    >
      {/* Sign In / Create Account Tabs */}
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`rounded-lg py-2 text-xs font-bold transition ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          {t.auth.signInTab}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`rounded-lg py-2 text-xs font-bold transition ${
            mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          {t.auth.registerTab}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {t.auth.mobileLabel} *
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder={t.auth.mobilePlaceholder}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-crimson-600 focus:outline-none focus:ring-2 focus:ring-crimson-100"
            />
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 ${mode === 'register' ? 'sm:grid-cols-2' : ''}`}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.auth.passwordLabel} *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-9 py-2 text-sm focus:border-crimson-600 focus:outline-none focus:ring-2 focus:ring-crimson-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {t.auth.confirmPasswordLabel} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPasswordPlaceholder}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-crimson-600 focus:outline-none focus:ring-2 focus:ring-crimson-100"
                />
              </div>
            </div>
          )}
        </div>

        {mode === 'register' && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  {t.auth.fullNameLabel} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.auth.fullNamePlaceholder}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-crimson-600 focus:outline-none focus:ring-2 focus:ring-crimson-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  {t.bloodGroup.label} *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroupCode)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-crimson-600 focus:outline-none"
                >
                  {BLOOD_GROUP_CODES.map((code) => (
                    <option key={code} value={code}>
                      {BLOOD_GROUP_LABELS[code]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <CascadingLocationSelect
                value={location}
                onChange={setLocation}
                allowAll={false}
                requiredTiers={5}
              />
            </div>
          </>
        )}

        {error && <p className="text-xs font-semibold text-crimson-700">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-crimson-700 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-crimson-800 transition"
        >
          {mode === 'login' ? t.auth.signInSubmitBtn : t.auth.registerSubmitBtn}
        </button>
      </form>
    </Modal>
  );
}
