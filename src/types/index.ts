export type Language = 'en' | 'bn';

export type BloodGroupCode =
  | 'A_POS'
  | 'A_NEG'
  | 'B_POS'
  | 'B_NEG'
  | 'AB_POS'
  | 'AB_NEG'
  | 'O_POS'
  | 'O_NEG';

export type BloodGroupLabel = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type DonorAvailability = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_COOLDOWN';

export type HeroBadgeTier = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'LIFESAVER';

export type UrgencyLevel = 'EMERGENCY' | 'WITHIN_24H' | 'SCHEDULED';

export type RequestStatus = 'ACTIVE' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export type MatchStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface LocationSelection {
  divisionId: string;
  districtId: string;
  upazilaId: string;
  postOfficeId: string;
  villageId: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  mobileNumber: string;
  isMobileVerified: boolean;
  secondaryPhone?: string | null;
  whatsappNumber?: string | null;
  bloodGroup: BloodGroupCode;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  postOfficeId: string;
  villageId: string;
  manualAvailable: boolean;
  availabilityStatus: DonorAvailability;
  lastDonationDate: string | null;
  hidePhoneNumber: boolean;
  totalDonations: number;
  heroBadge: HeroBadgeTier;
  lastActiveAt: string;
  createdAt: string;
}

export interface RankedDonor {
  donor: UserProfile;
  matchScore: 1 | 2 | 3 | 4;
  matchTierLabel: 'exact_thana' | 'same_district' | 'same_division' | 'national';
  isExactBloodMatch: boolean;
  displayPhone: string;
  displayWhatsapp: string | null;
  isPhoneMasked: boolean;
  daysSinceLastDonation: number | null;
}

export interface BloodRequestItem {
  id: string;
  requesterId: string;
  patientName: string;
  bloodGroupNeeded: BloodGroupCode;
  unitsRequired: number;
  unitsFulfilled: number;
  urgencyLevel: UrgencyLevel;
  hospitalName: string;
  wardCabinBed: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  postOfficeId?: string | null;
  villageOrArea?: string | null;
  contactPersonName: string;
  primaryMobile: string;
  alternateMobile?: string | null;
  medicalReason: string;
  status: RequestStatus;
  isActive: boolean;
  expiresAt: string;
  extensionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyMatchRecord {
  id: string;
  requestId: string;
  donorId: string;
  status: MatchStatus;
  phoneRevealed: boolean;
  confirmedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface DonationLogRecord {
  id: string;
  donorId: string;
  requestId?: string | null;
  source: 'INTERNAL_MATCH' | 'EXTERNAL_LOG';
  donatedAt: string;
  hospitalOrCenter?: string | null;
  notes?: string | null;
}
