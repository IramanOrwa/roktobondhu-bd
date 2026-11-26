export const BD_MOBILE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

export function normalizeBangladeshMobile(input: string): string {
  const digits = input.replace(/[^\d]/g, '');
  if (digits.startsWith('8801') && digits.length === 13) {
    return `0${digits.slice(2)}`;
  }
  if (digits.startsWith('01') && digits.length === 11) {
    return digits;
  }
  return input.trim();
}

export function isValidBangladeshMobile(input: string): boolean {
  return BD_MOBILE_REGEX.test(input.replace(/[\s-]/g, ''));
}

export function isFutureDate(dateStr: string): boolean {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() > Date.now();
}

export function calculateAgeYears(dobStr: string, refDate: Date = new Date()): number | null {
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return null;
  let age = refDate.getFullYear() - dob.getFullYear();
  const monthDiff = refDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function isEligibleDonorAge(dobStr: string): boolean {
  const age = calculateAgeYears(dobStr);
  return age !== null && age >= 18 && age <= 65;
}
