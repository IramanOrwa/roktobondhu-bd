import { resolveLocationNames } from '@/data/bangladesh-locations';
import type { BloodRequestItem, Language, RequestStatus } from '@/types';
import { BLOOD_GROUP_LABELS } from './donor-ranking';

export const REQUEST_EXPIRY_HOURS = 48;
const MS_PER_HOUR = 1000 * 60 * 60;

export function calculateInitialExpiryDate(createdAt: Date = new Date()): Date {
  return new Date(createdAt.getTime() + REQUEST_EXPIRY_HOURS * MS_PER_HOUR);
}

export function calculateExtendedExpiryDate(fromDate: Date = new Date()): Date {
  return new Date(fromDate.getTime() + REQUEST_EXPIRY_HOURS * MS_PER_HOUR);
}

export function isRequestExpired(
  request: Pick<BloodRequestItem, 'expiresAt' | 'status'>,
  now: Date = new Date()
): boolean {
  if (request.status === 'FULFILLED' || request.status === 'CANCELLED' || request.status === 'EXPIRED') {
    return request.status === 'EXPIRED';
  }
  return new Date(request.expiresAt).getTime() <= now.getTime();
}

export function getEffectiveRequestStatus(
  request: BloodRequestItem,
  now: Date = new Date()
): RequestStatus {
  if (
    (request.status === 'ACTIVE' || request.status === 'IN_PROGRESS') &&
    new Date(request.expiresAt).getTime() <= now.getTime()
  ) {
    return 'EXPIRED';
  }
  return request.status;
}

export function getRemainingHours(expiresAt: string | Date, now: Date = new Date()): number {
  const target = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / MS_PER_HOUR);
}

export function buildSocialShareTemplate(request: BloodRequestItem, lang: Language): string {
  const bg = BLOOD_GROUP_LABELS[request.bloodGroupNeeded];
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

  if (lang === 'bn') {
    const urgencyMap = {
      EMERGENCY: 'জরুরি (এখনই প্রয়োজন)',
      WITHIN_24H: '২৪ ঘণ্টার মধ্যে প্রয়োজন',
      SCHEDULED: 'নির্ধারিত সময়সূচি অনুযায়ী',
    };
    return [
      `🩸 জরুরি রক্তের প্রয়োজন (${bg}) 🩸`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `রোগীর নাম: ${request.patientName}`,
      `রক্তের গ্রুপ: ${bg} (${request.unitsRequired} ব্যাগ)`,
      `জরুরিতার মাত্রা: ${urgencyMap[request.urgencyLevel]}`,
      `হাসপাতাল: ${request.hospitalName}`,
      `ওয়ার্ড/কেবিন/বেড: ${request.wardCabinBed}`,
      `এলাকা: ${loc.fullBreadcrumb || loc.compact}`,
      `কারণ: ${request.medicalReason}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `যোগাযোগ: ${request.contactPersonName}`,
      `মোবাইল: ${request.primaryMobile}${request.alternateMobile ? ` / ${request.alternateMobile}` : ''}`,
      ``,
      `দয়া করে শেয়ার করে একটি জীবন বাঁচাতে সাহায্য করুন। #রক্তবন্ধু #BloodDonationBD`,
    ].join('\n');
  }

  const urgencyEn = {
    EMERGENCY: 'EMERGENCY (Immediate)',
    WITHIN_24H: 'Within 24 Hours',
    SCHEDULED: 'Scheduled Transfusion',
  };

  return [
    `🩸 URGENT BLOOD NEEDED (${bg}) 🩸`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Patient: ${request.patientName}`,
    `Blood Group: ${bg} (${request.unitsRequired} Bag/Unit${request.unitsRequired > 1 ? 's' : ''})`,
    `Urgency: ${urgencyEn[request.urgencyLevel]}`,
    `Hospital: ${request.hospitalName}`,
    `Ward/Cabin/Bed: ${request.wardCabinBed}`,
    `Location: ${loc.fullBreadcrumb || loc.compact}`,
    `Medical Reason: ${request.medicalReason}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Contact: ${request.contactPersonName}`,
    `Phone: ${request.primaryMobile}${request.alternateMobile ? ` / ${request.alternateMobile}` : ''}`,
    ``,
    `Please share to help save a life! #RoktoBondhuBD #DonateBlood`,
  ].join('\n');
}
