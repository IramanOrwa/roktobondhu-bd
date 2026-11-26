import type { UserProfile } from '@/types';

/**
 * Masks a Bangladesh phone number preserving prefix & last 2 digits:
 * e.g., "+8801712345678" -> "+88017******78" or "01712345678" -> "0171*****78"
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.trim();
  if (cleaned.length <= 5) return '*****';
  const prefixLen = cleaned.startsWith('+880') ? 6 : 4;
  const start = cleaned.slice(0, prefixLen);
  const end = cleaned.slice(-2);
  const maskedMiddle = '*'.repeat(Math.max(4, cleaned.length - prefixLen - 2));
  return `${start}${maskedMiddle}${end}`;
}

export function normalizeBangladeshWhatsappUrl(phone: string, prefillText?: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  let e164 = digits;
  if (digits.startsWith('01') && digits.length === 11) {
    e164 = `88${digits}`;
  } else if (digits.startsWith('880') && digits.length === 13) {
    e164 = digits;
  }
  const base = `https://wa.me/${e164}`;
  return prefillText ? `${base}?text=${encodeURIComponent(prefillText)}` : base;
}

export function formatDonorContact(
  donor: Pick<UserProfile, 'mobileNumber' | 'whatsappNumber' | 'hidePhoneNumber'>,
  isEmergencyMatchConfirmed: boolean
): {
  displayPhone: string;
  displayWhatsapp: string | null;
  isMasked: boolean;
} {
  const shouldMask = donor.hidePhoneNumber && !isEmergencyMatchConfirmed;
  const rawWhatsapp = donor.whatsappNumber || donor.mobileNumber;

  if (shouldMask) {
    return {
      displayPhone: maskPhoneNumber(donor.mobileNumber),
      displayWhatsapp: rawWhatsapp ? maskPhoneNumber(rawWhatsapp) : null,
      isMasked: true,
    };
  }

  return {
    displayPhone: donor.mobileNumber,
    displayWhatsapp: rawWhatsapp,
    isMasked: false,
  };
}
