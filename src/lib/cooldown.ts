import type { DonorAvailability, HeroBadgeTier } from '@/types';

export const COOLDOWN_DAYS = 90;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface CooldownEvaluation {
  daysElapsed: number | null;
  daysRemaining: number;
  isOnCooldown: boolean;
  eligibleDate: Date | null;
  effectiveStatus: DonorAvailability;
}

/**
 * Evaluates the 90-Day Auto Cooldown Algorithm:
 * - DaysElapsed = floor((CurrentDate - LastDonationDate) / 1 day)
 * - If DaysElapsed < 90 -> Status = "ON_COOLDOWN" (excluded from active donor searches)
 * - Else -> Respects user's manual availability toggle ("AVAILABLE" | "UNAVAILABLE")
 */
export function evaluateCooldown(
  lastDonationDate: string | Date | null | undefined,
  manualAvailable: boolean,
  referenceDate: Date = new Date()
): CooldownEvaluation {
  if (!lastDonationDate) {
    return {
      daysElapsed: null,
      daysRemaining: 0,
      isOnCooldown: false,
      eligibleDate: null,
      effectiveStatus: manualAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
    };
  }

  const parsedDate = lastDonationDate instanceof Date ? lastDonationDate : new Date(lastDonationDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      daysElapsed: null,
      daysRemaining: 0,
      isOnCooldown: false,
      eligibleDate: null,
      effectiveStatus: manualAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
    };
  }

  const diffMs = referenceDate.getTime() - parsedDate.getTime();
  // Guard against future timestamps being treated as negative elapsed days
  const daysElapsed = Math.max(0, Math.floor(diffMs / MS_PER_DAY));
  const isOnCooldown = daysElapsed < COOLDOWN_DAYS;
  const daysRemaining = isOnCooldown ? COOLDOWN_DAYS - daysElapsed : 0;
  const eligibleDate = new Date(parsedDate.getTime() + COOLDOWN_DAYS * MS_PER_DAY);

  const effectiveStatus: DonorAvailability = isOnCooldown
    ? 'ON_COOLDOWN'
    : manualAvailable
      ? 'AVAILABLE'
      : 'UNAVAILABLE';

  return {
    daysElapsed,
    daysRemaining,
    isOnCooldown,
    eligibleDate,
    effectiveStatus,
  };
}

/**
 * Hero Badge Gamification Tiers:
 * - Bronze: 1+
 * - Silver: 3+
 * - Gold: 5+
 * - LifeSaver: 10+
 */
export function computeHeroBadge(totalDonations: number): HeroBadgeTier {
  if (totalDonations >= 10) return 'LIFESAVER';
  if (totalDonations >= 5) return 'GOLD';
  if (totalDonations >= 3) return 'SILVER';
  if (totalDonations >= 1) return 'BRONZE';
  return 'NONE';
}

export function getNextBadgeTarget(totalDonations: number): {
  nextTier: HeroBadgeTier | null;
  donationsNeeded: number;
} {
  if (totalDonations < 1) return { nextTier: 'BRONZE', donationsNeeded: 1 - totalDonations };
  if (totalDonations < 3) return { nextTier: 'SILVER', donationsNeeded: 3 - totalDonations };
  if (totalDonations < 5) return { nextTier: 'GOLD', donationsNeeded: 5 - totalDonations };
  if (totalDonations < 10) return { nextTier: 'LIFESAVER', donationsNeeded: 10 - totalDonations };
  return { nextTier: null, donationsNeeded: 0 };
}
