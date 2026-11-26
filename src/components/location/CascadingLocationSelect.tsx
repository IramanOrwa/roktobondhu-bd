'use client';

import React from 'react';
import {
  getDistrictsByDivision,
  getDivisions,
  getPostOfficesByUpazila,
  getUpazilasByDistrict,
  getVillagesByPostOffice,
} from '@/data/bangladesh-locations';
import { useTranslation } from '@/i18n/context';
import type { LocationSelection } from '@/types';

interface CascadingLocationSelectProps {
  value: LocationSelection;
  onChange: (next: LocationSelection) => void;
  allowAll?: boolean;
  requiredTiers?: 3 | 5;
  compact?: boolean;
}

export function CascadingLocationSelect({
  value,
  onChange,
  allowAll = true,
  requiredTiers = 5,
  compact = false,
}: CascadingLocationSelectProps) {
  const { lang, t } = useTranslation();

  const divisions = getDivisions();
  const districts = value.divisionId ? getDistrictsByDivision(value.divisionId) : [];
  const upazilas =
    value.divisionId && value.districtId
      ? getUpazilasByDistrict(value.divisionId, value.districtId)
      : [];
  const postOffices =
    value.divisionId && value.districtId && value.upazilaId
      ? getPostOfficesByUpazila(value.divisionId, value.districtId, value.upazilaId)
      : [];
  const villages =
    value.divisionId && value.districtId && value.upazilaId && value.postOfficeId
      ? getVillagesByPostOffice(
          value.divisionId,
          value.districtId,
          value.upazilaId,
          value.postOfficeId
        )
      : [];

  const handleDivisionChange = (divisionId: string) => {
    onChange({
      divisionId,
      districtId: '',
      upazilaId: '',
      postOfficeId: '',
      villageId: '',
    });
  };

  const handleDistrictChange = (districtId: string) => {
    onChange({
      ...value,
      districtId,
      upazilaId: '',
      postOfficeId: '',
      villageId: '',
    });
  };

  const handleUpazilaChange = (upazilaId: string) => {
    onChange({
      ...value,
      upazilaId,
      postOfficeId: '',
      villageId: '',
    });
  };

  const handlePostOfficeChange = (postOfficeId: string) => {
    onChange({
      ...value,
      postOfficeId,
      villageId: '',
    });
  };

  const selectClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-crimson-600 focus:outline-none focus:ring-2 focus:ring-crimson-100 disabled:bg-slate-100 disabled:text-slate-400';

  const labelClass = 'mb-1 block text-xs font-semibold text-slate-700';

  return (
    <div
      className={`grid gap-3 ${
        compact
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
          : 'grid-cols-1 sm:grid-cols-2'
      }`}
    >
      {/* Tier 1: Division */}
      <div>
        <label className={labelClass}>{t.location.division}</label>
        <select
          value={value.divisionId}
          onChange={(e) => handleDivisionChange(e.target.value)}
          className={selectClass}
        >
          <option value="">
            {allowAll ? t.location.allDivisions : t.common.selectOption}
          </option>
          {divisions.map((div) => (
            <option key={div.id} value={div.id}>
              {div[lang]}
            </option>
          ))}
        </select>
      </div>

      {/* Tier 2: District */}
      <div>
        <label className={labelClass}>{t.location.district}</label>
        <select
          value={value.districtId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!value.divisionId}
          className={selectClass}
        >
          <option value="">
            {!value.divisionId
              ? t.location.selectDivisionFirst
              : allowAll
                ? t.location.allDistricts
                : t.common.selectOption}
          </option>
          {districts.map((dist) => (
            <option key={dist.id} value={dist.id}>
              {dist[lang]}
            </option>
          ))}
        </select>
      </div>

      {/* Tier 3: Upazila / Thana */}
      <div>
        <label className={labelClass}>{t.location.upazila}</label>
        <select
          value={value.upazilaId}
          onChange={(e) => handleUpazilaChange(e.target.value)}
          disabled={!value.districtId}
          className={selectClass}
        >
          <option value="">
            {!value.districtId
              ? t.location.selectDistrictFirst
              : allowAll
                ? t.location.allUpazilas
                : t.common.selectOption}
          </option>
          {upazilas.map((upz) => (
            <option key={upz.id} value={upz.id}>
              {upz[lang]}
            </option>
          ))}
        </select>
      </div>

      {/* Tier 4: Post Office */}
      {requiredTiers >= 5 || postOffices.length > 0 ? (
        <div>
          <label className={labelClass}>{t.location.postOffice}</label>
          <select
            value={value.postOfficeId}
            onChange={(e) => handlePostOfficeChange(e.target.value)}
            disabled={!value.upazilaId}
            className={selectClass}
          >
            <option value="">
              {!value.upazilaId
                ? t.location.selectUpazilaFirst
                : allowAll
                  ? t.location.allPostOffices
                  : t.common.selectOption}
            </option>
            {postOffices.map((po) => (
              <option key={po.id} value={po.id}>
                {po[lang]} ({po.postCode})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Tier 5: Village / Area */}
      {requiredTiers >= 5 || villages.length > 0 ? (
        <div>
          <label className={labelClass}>{t.location.village}</label>
          <select
            value={value.villageId}
            onChange={(e) => onChange({ ...value, villageId: e.target.value })}
            disabled={!value.postOfficeId}
            className={selectClass}
          >
            <option value="">
              {!value.postOfficeId
                ? t.location.selectPostOfficeFirst
                : allowAll
                  ? t.location.allVillages
                  : t.common.selectOption}
            </option>
            {villages.map((vil) => (
              <option key={vil.id} value={vil.id}>
                {vil[lang]}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
