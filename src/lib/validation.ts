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
