import type { Language, LocationSelection } from '@/types';
import bdLocationsRaw from './bd-locations.json';

export interface VillageNode {
  id: string;
  en: string;
  bn: string;
}

export interface PostOfficeNode {
  id: string;
  en: string;
  bn: string;
  postCode: string;
  villages: VillageNode[];
}

export interface UpazilaNode {
  id: string;
  en: string;
  bn: string;
  postOffices: PostOfficeNode[];
}

export interface DistrictNode {
  id: string;
  en: string;
  bn: string;
  upazilas: UpazilaNode[];
}

export interface DivisionNode {
  id: string;
  en: string;
  bn: string;
  districts: DistrictNode[];
}

interface RawDivision {
  id: string;
  en: string;
  bn: string;
}
interface RawDistrict {
  id: string;
  divId: string;
  en: string;
  bn: string;
}
interface RawUpazila {
  id: string;
  distId: string;
  en: string;
  bn: string;
}
interface RawPostOffice {
  id: string;
  distId: string;
  upzId: string;
  en: string;
  bn: string;
  postCode: string;
}
interface RawUnion {
  id: string;
  upzId: string;
  en: string;
  bn: string;
}

interface RawBundle {
  divisions: RawDivision[];
  districts: RawDistrict[];
  upazilas: RawUpazila[];
  postOffices: RawPostOffice[];
  unions: RawUnion[];
}

const bdData = bdLocationsRaw as RawBundle;

export function getDivisions(): DivisionNode[] {
  return bdData.divisions.map((d) => ({
    id: d.id,
    en: d.en,
    bn: d.bn,
    districts: [],
  }));
}

export function getDistrictsByDivision(divisionId: string): DistrictNode[] {
  if (!divisionId) return [];
  return bdData.districts
    .filter((d) => d.divId === divisionId)
    .map((d) => ({
      id: d.id,
      en: d.en,
      bn: d.bn,
      upazilas: [],
    }));
}

export function getUpazilasByDistrict(_divisionId: string, districtId: string): UpazilaNode[] {
  if (!districtId) return [];
  return bdData.upazilas
    .filter((u) => u.distId === districtId)
    .map((u) => ({
      id: u.id,
      en: u.en,
      bn: u.bn,
      postOffices: [],
    }));
}

export function getPostOfficesByUpazila(
  _divisionId: string,
  districtId: string,
  upazilaId: string
): PostOfficeNode[] {
  if (!upazilaId) return [];
  const exact = bdData.postOffices.filter((po) => po.upzId === upazilaId);
  const source = exact.length > 0 ? exact : bdData.postOffices.filter((po) => po.distId === districtId);
  return source.map((po) => ({
    id: po.id,
    en: po.en,
    bn: po.bn,
    postCode: po.postCode,
    villages: [],
  }));
}

export function getVillagesByPostOffice(
  _divisionId: string,
  _districtId: string,
  upazilaId: string,
  postOfficeId: string
): VillageNode[] {
  if (!upazilaId) return [];
  const unions = bdData.unions.filter((u) => u.upzId === upazilaId);
  if (unions.length > 0) {
    return unions.map((u) => ({ id: u.id, en: u.en, bn: u.bn }));
  }

  // Fallback area node for City Corporation Metro Thanas without rural unions
  const po = bdData.postOffices.find((p) => p.id === postOfficeId);
  const upz = bdData.upazilas.find((u) => u.id === upazilaId);
  if (po) {
    return [{ id: `${po.id}-area`, en: `${po.en} Area`, bn: `${po.en} এলাকা` }];
  }
  if (upz) {
    return [{ id: `${upz.id}-area`, en: `${upz.en} Area`, bn: `${upz.bn} এলাকা` }];
  }
  return [];
}

export interface ResolvedLocationNames {
  division: string;
  district: string;
  upazila: string;
  postOffice: string;
  postCode?: string;
  village: string;
  compact: string;
  fullBreadcrumb: string;
}

export function resolveLocationNames(
  loc: Partial<LocationSelection> & { villageOrArea?: string | null },
  lang: Language = 'en'
): ResolvedLocationNames {
  const div = bdData.divisions.find((d) => d.id === loc.divisionId);
  const dist = bdData.districts.find((d) => d.id === loc.districtId);
  const upz = bdData.upazilas.find((u) => u.id === loc.upazilaId);
  const po = bdData.postOffices.find((p) => p.id === loc.postOfficeId);
  const vil = bdData.unions.find((v) => v.id === loc.villageId);

  const division = div ? div[lang] : '';
  const district = dist ? dist[lang] : '';
  const upazila = upz ? upz[lang] : '';
  const postOffice = po ? `${po[lang]} (${po.postCode})` : '';
  const village = vil ? vil[lang] : loc.villageOrArea || '';

  const compactParts = [upazila, district].filter(Boolean);
  const fullParts = [village, postOffice, upazila, district, division].filter(Boolean);

  return {
    division,
    district,
    upazila,
    postOffice,
    postCode: po?.postCode,
    village,
    compact: compactParts.join(', '),
    fullBreadcrumb: fullParts.join(' → '),
  };
}
