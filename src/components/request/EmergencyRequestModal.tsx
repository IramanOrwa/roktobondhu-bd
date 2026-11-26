'use client';

import React, { useState } from 'react';
import { CascadingLocationSelect } from '@/components/location/CascadingLocationSelect';
import { Modal } from '@/components/ui/Modal';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/i18n/context';
import { BLOOD_GROUP_CODES, BLOOD_GROUP_LABELS } from '@/lib/donor-ranking';
import { isValidBangladeshMobile } from '@/lib/validation';
import type { BloodGroupCode, LocationSelection, UrgencyLevel } from '@/types';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function EmergencyRequestModal({
  isOpen,
  onClose,
  onCreated,
}: EmergencyRequestModalProps) {
  const { t } = useTranslation();
  const { currentUser, createBloodRequest } = useAppState();
  const { showToast } = useToast();

  const [patientName, setPatientName] = useState('');
  const [bloodGroupNeeded, setBloodGroupNeeded] = useState<BloodGroupCode>('O_POS');
  const [unitsRequired, setUnitsRequired] = useState<number>(1);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('EMERGENCY');
  const [hospitalName, setHospitalName] = useState('');
  const [wardCabinBed, setWardCabinBed] = useState('');
  const [location, setLocation] = useState<LocationSelection>({
    divisionId: currentUser?.divisionId || 'div-dhaka',
    districtId: currentUser?.districtId || 'dist-dhaka',
    upazilaId: currentUser?.upazilaId || 'upz-shahbagh',
    postOfficeId: currentUser?.postOfficeId || '',
    villageId: '',
  });
  const [villageOrArea, setVillageOrArea] = useState('');
  const [contactPersonName, setContactPersonName] = useState(currentUser?.fullName || '');
  const [primaryMobile, setPrimaryMobile] = useState(currentUser?.mobileNumber || '');
  const [alternateMobile, setAlternateMobile] = useState(currentUser?.whatsappNumber || '');
  const [medicalReason, setMedicalReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!patientName.trim()) next.patientName = t.validation.requiredField;
    if (!hospitalName.trim()) next.hospitalName = t.validation.requiredField;
    if (!wardCabinBed.trim()) next.wardCabinBed = t.validation.requiredField;
    if (!contactPersonName.trim()) next.contactPersonName = t.validation.requiredField;
    if (!medicalReason.trim()) next.medicalReason = t.validation.requiredField;
    if (unitsRequired < 1 || unitsRequired > 15) next.unitsRequired = t.validation.invalidUnits;
    if (!isValidBangladeshMobile(primaryMobile)) {
      next.primaryMobile = t.validation.invalidBdMobile;
    }
    if (alternateMobile.trim() && !isValidBangladeshMobile(alternateMobile)) {
      next.alternateMobile = t.validation.invalidBdMobile;
    }
    if (!location.divisionId || !location.districtId || !location.upazilaId) {
      next.location = t.validation.selectLocationRequired;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createBloodRequest({
      patientName,
      bloodGroupNeeded,
      unitsRequired,
      urgencyLevel,
      hospitalName,
      wardCabinBed,
      divisionId: location.divisionId,
      districtId: location.districtId,
      upazilaId: location.upazilaId,
      postOfficeId: location.postOfficeId || undefined,
      villageOrArea: villageOrArea.trim() || undefined,
      contactPersonName,
      primaryMobile,
      alternateMobile: alternateMobile.trim() || undefined,
      medicalReason,
    });

    showToast(t.toasts.requestCreated, 'success');
    setPatientName('');
    setHospitalName('');
    setWardCabinBed('');
    setMedicalReason('');
    setErrors({});
    onClose();
    onCreated?.();
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-crimson-600 focus:outline-none focus:ring-2 focus:ring-crimson-100';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.requestForm.modalTitle}
      subtitle={t.requestForm.modalSubtitle}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.patientName} *
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder={t.requestForm.patientNamePlaceholder}
              className={inputClass}
            />
            {errors.patientName && (
              <p className="mt-1 text-xs text-crimson-700">{errors.patientName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {t.requestForm.bloodGroupNeeded} *
              </label>
              <select
                value={bloodGroupNeeded}
                onChange={(e) => setBloodGroupNeeded(e.target.value as BloodGroupCode)}
                className={inputClass}
              >
                {BLOOD_GROUP_CODES.map((code) => (
                  <option key={code} value={code}>
                    {BLOOD_GROUP_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {t.requestForm.unitsRequired} *
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(Number(e.target.value))}
                className={inputClass}
              />
              {errors.unitsRequired && (
                <p className="mt-1 text-xs text-crimson-700">{errors.unitsRequired}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.urgencyLevel} *
            </label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
              className={inputClass}
            >
              <option value="EMERGENCY">{t.requestForm.urgencyOptions.EMERGENCY}</option>
              <option value="WITHIN_24H">{t.requestForm.urgencyOptions.WITHIN_24H}</option>
              <option value="SCHEDULED">{t.requestForm.urgencyOptions.SCHEDULED}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.hospitalName} *
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder={t.requestForm.hospitalNamePlaceholder}
              className={inputClass}
            />
            {errors.hospitalName && (
              <p className="mt-1 text-xs text-crimson-700">{errors.hospitalName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.wardCabinBed} *
            </label>
            <input
              type="text"
              value={wardCabinBed}
              onChange={(e) => setWardCabinBed(e.target.value)}
              placeholder={t.requestForm.wardCabinBedPlaceholder}
              className={inputClass}
            />
            {errors.wardCabinBed && (
              <p className="mt-1 text-xs text-crimson-700">{errors.wardCabinBed}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.villageOrArea}
            </label>
            <input
              type="text"
              value={villageOrArea}
              onChange={(e) => setVillageOrArea(e.target.value)}
              placeholder={t.requestForm.villageOrAreaPlaceholder}
              className={inputClass}
            />
          </div>
        </div>

        {/* 5-Tier Hospital Location */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <p className="mb-2.5 text-xs font-bold text-slate-800">
            {t.requestForm.hospitalLocationTitle} *
          </p>
          <CascadingLocationSelect
            value={location}
            onChange={setLocation}
            allowAll={false}
            requiredTiers={5}
          />
          {errors.location && (
            <p className="mt-2 text-xs text-crimson-700">{errors.location}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.contactPersonName} *
            </label>
            <input
              type="text"
              value={contactPersonName}
              onChange={(e) => setContactPersonName(e.target.value)}
              placeholder={t.requestForm.contactPersonPlaceholder}
              className={inputClass}
            />
            {errors.contactPersonName && (
              <p className="mt-1 text-xs text-crimson-700">{errors.contactPersonName}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.primaryMobile} *
            </label>
            <input
              type="tel"
              value={primaryMobile}
              onChange={(e) => setPrimaryMobile(e.target.value)}
              placeholder={t.requestForm.primaryMobilePlaceholder}
              className={inputClass}
            />
            {errors.primaryMobile && (
              <p className="mt-1 text-xs text-crimson-700">{errors.primaryMobile}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              {t.requestForm.alternateMobile}
            </label>
            <input
              type="tel"
              value={alternateMobile}
              onChange={(e) => setAlternateMobile(e.target.value)}
              placeholder={t.requestForm.alternateMobilePlaceholder}
              className={inputClass}
            />
            {errors.alternateMobile && (
              <p className="mt-1 text-xs text-crimson-700">{errors.alternateMobile}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {t.requestForm.medicalReason} *
          </label>
          <textarea
            rows={2}
            value={medicalReason}
            onChange={(e) => setMedicalReason(e.target.value)}
            placeholder={t.requestForm.medicalReasonPlaceholder}
            className={inputClass}
          />
          {errors.medicalReason && (
            <p className="mt-1 text-xs text-crimson-700">{errors.medicalReason}</p>
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            className="rounded-xl bg-crimson-700 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-crimson-800 transition"
          >
            {t.requestForm.submitBtn}
          </button>
        </div>
      </form>
    </Modal>
  );
}
