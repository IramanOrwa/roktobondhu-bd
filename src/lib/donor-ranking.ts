import type { BloodGroupCode, BloodGroupLabel, RankedDonor, UserProfile } from '@/types';
import { evaluateCooldown } from './cooldown';
import { formatDonorContact } from './privacy';

export const BLOOD_GROUP_LABELS: Record<BloodGroupCode, BloodGroupLabel> = {
  A_POS: 'A+',
  A_NEG: 'A-',
  B_POS: 'B+',
  B_NEG: 'B-',
  AB_POS: 'AB+',
  AB_NEG: 'AB-',
  O_POS: 'O+',
  O_NEG: 'O-',
};

export const BLOOD_GROUP_CODES: BloodGroupCode[] = [
  'A_POS',
  'A_NEG',
  'B_POS',
  'B_NEG',
  'AB_POS',
  'AB_NEG',
  'O_POS',
  'O_NEG',
];

/**
 * Standard Red Blood Cell (RBC) Donor Compatibility Map:
 * Key = Recipient blood group needed
 * Value = List of compatible donor blood groups (ordered by clinical preference)
 */
export const COMPATIBLE_DONOR_MAP: Record<BloodGroupCode, BloodGroupCode[]> = {
  O_NEG: ['O_NEG'],
  O_POS: ['O_POS', 'O_NEG'],
  A_NEG: ['A_NEG', 'O_NEG'],
  A_POS: ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  B_NEG: ['B_NEG', 'O_NEG'],
  B_POS: ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  AB_NEG: ['AB_NEG', 'A_NEG', 'B_NEG', 'O_NEG'],
  AB_POS: ['AB_POS', 'AB_NEG', 'A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
};

export interface DonorSearchCriteria {
  bloodGroupNeeded: BloodGroupCode;
  includeCompatible: boolean;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  postOfficeId?: string;
  villageId?: string;
  confirmedDonorIds?: Set<string>;
  excludeUserId?: string;
  referenceDate?: Date;
}

/**
 * Priority Match & Ranking Algorithm:
 * 1. Filters out donors on 90-day cooldown or marked unavailable.
 * 2. Matches exact blood group (or compatible groups when emergency toggle is ON).
 * 3. Ranks by 3-tier geographic proximity:
 *    - Score 1 (Top): Exact match on Thana/Upazila and District.
 *    - Score 2: Same District, different Thana.
 *    - Score 3: Same Division, different District.
 *    - Score 4: Nationwide fallback (when no division filter or broader search).
 *    Tie-breakers: Post Office match -> Village match -> Exact blood group -> Total donations -> Recent activity.
 */
export function rankMatchingDonors(
  donors: UserProfile[],
  criteria: DonorSearchCriteria
): RankedDonor[] {
  const refDate = criteria.referenceDate ?? new Date();
  const acceptedBloodGroups = criteria.includeCompatible
    ? COMPATIBLE_DONOR_MAP[criteria.bloodGroupNeeded]
    : [criteria.bloodGroupNeeded];

  const results: RankedDonor[] = [];

  for (const donor of donors) {
    if (criteria.excludeUserId && donor.id === criteria.excludeUserId) {
      continue;
    }

    if (!acceptedBloodGroups.includes(donor.bloodGroup)) {
      continue;
    }

    const cooldown = evaluateCooldown(donor.lastDonationDate, donor.manualAvailable, refDate);
    if (cooldown.effectiveStatus !== 'AVAILABLE') {
      continue;
    }

    let matchScore: 1 | 2 | 3 | 4 = 4;
    let matchTierLabel: RankedDonor['matchTierLabel'] = 'national';

    const sameDivision = Boolean(criteria.divisionId && donor.divisionId === criteria.divisionId);
    const sameDistrict = Boolean(criteria.districtId && donor.districtId === criteria.districtId);
    const sameUpazila = Boolean(criteria.upazilaId && donor.upazilaId === criteria.upazilaId);

    if (sameDistrict && sameUpazila) {
      matchScore = 1;
      matchTierLabel = 'exact_thana';
    } else if (sameDistrict) {
      matchScore = 2;
      matchTierLabel = 'same_district';
    } else if (sameDivision) {
      matchScore = 3;
      matchTierLabel = 'same_division';
    } else if (criteria.divisionId) {
      // If user explicitly filtered by Division without choosing District/Upazila, keep same-division matches prioritized
      // and exclude out-of-division donors only when searching strictly within a Division unless nationwide fallback needed.
      matchScore = 4;
      matchTierLabel = 'national';
    }

    const isMatchConfirmed = criteria.confirmedDonorIds?.has(donor.id) ?? false;
    const contact = formatDonorContact(donor, isMatchConfirmed);

    results.push({
      donor,
      matchScore,
      matchTierLabel,
      isExactBloodMatch: donor.bloodGroup === criteria.bloodGroupNeeded,
      displayPhone: contact.displayPhone,
      displayWhatsapp: contact.displayWhatsapp,
      isPhoneMasked: contact.isMasked,
      daysSinceLastDonation: cooldown.daysElapsed,
    });
  }

  return results.sort((a, b) => {
    // 1. Primary: Geographic Score (1 -> 2 -> 3 -> 4)
    if (a.matchScore !== b.matchScore) {
      return a.matchScore - b.matchScore;
    }
    // 2. Finer-grain PO / Village sub-match within Score 1
    const aPoMatch = criteria.postOfficeId && a.donor.postOfficeId === criteria.postOfficeId ? 1 : 0;
    const bPoMatch = criteria.postOfficeId && b.donor.postOfficeId === criteria.postOfficeId ? 1 : 0;
    if (aPoMatch !== bPoMatch) return bPoMatch - aPoMatch;

    const aVilMatch = criteria.villageId && a.donor.villageId === criteria.villageId ? 1 : 0;
    const bVilMatch = criteria.villageId && b.donor.villageId === criteria.villageId ? 1 : 0;
    if (aVilMatch !== bVilMatch) return bVilMatch - aVilMatch;

    // 3. Exact Blood Group over compatible alternative
    if (a.isExactBloodMatch !== b.isExactBloodMatch) {
      return a.isExactBloodMatch ? -1 : 1;
    }

    // 4. Higher donation experience / reliability
    if (a.donor.totalDonations !== b.donor.totalDonations) {
      return b.donor.totalDonations - a.donor.totalDonations;
    }

    // 5. Most recently active donor
    return new Date(b.donor.lastActiveAt).getTime() - new Date(a.donor.lastActiveAt).getTime();
  });
}
