import { PrismaClient } from '@prisma/client';
import { computeHeroBadge, evaluateCooldown } from '../src/lib/cooldown';
import { calculateInitialExpiryDate } from '../src/lib/request-lifecycle';

const prisma = new PrismaClient();

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  console.log('Seeding RoktoBondhu BD database...');

  const usersSeed = [
    {
      id: 'usr-tanvir',
      fullName: 'Tanvir Mahmud Hasan',
      mobileNumber: '01711223344',
      isMobileVerified: true,
      whatsappNumber: '01711223344',
      bloodGroup: 'O_POS' as const,
      divisionId: 'div-6',
      districtId: 'dist-47',
      upazilaId: 'upz-m1',
      postOfficeId: 'po-1',
      villageId: 'po-1-area',
      manualAvailable: true,
      lastDonationDate: daysAgo(125),
      hidePhoneNumber: false,
      totalDonations: 6,
    },
    {
      id: 'usr-nusrat',
      fullName: 'Nusrat Jahan Mim',
      mobileNumber: '01812345678',
      isMobileVerified: true,
      whatsappNumber: '01812345678',
      bloodGroup: 'A_POS' as const,
      divisionId: 'div-6',
      districtId: 'dist-47',
      upazilaId: 'upz-m7',
      postOfficeId: 'po-9',
      villageId: 'po-9-area',
      manualAvailable: true,
      lastDonationDate: daysAgo(35),
      hidePhoneNumber: true,
      totalDonations: 4,
    },
    {
      id: 'usr-farhan',
      fullName: 'Farhan Sadik Chowdhury',
      mobileNumber: '01911998877',
      isMobileVerified: true,
      whatsappNumber: '01911998877',
      bloodGroup: 'O_NEG' as const,
      divisionId: 'div-6',
      districtId: 'dist-47',
      upazilaId: 'upz-m12',
      postOfficeId: 'po-15',
      villageId: 'po-15-area',
      manualAvailable: true,
      lastDonationDate: daysAgo(180),
      hidePhoneNumber: true,
      totalDonations: 11,
    },
    {
      id: 'usr-mehedi',
      fullName: 'Mehedi Hasan Rony',
      mobileNumber: '01611445566',
      isMobileVerified: true,
      whatsappNumber: '01611445566',
      bloodGroup: 'B_POS' as const,
      divisionId: 'div-1',
      districtId: 'dist-8',
      upazilaId: 'upz-m22',
      postOfficeId: 'po-636',
      villageId: 'po-636-area',
      manualAvailable: true,
      lastDonationDate: daysAgo(98),
      hidePhoneNumber: false,
      totalDonations: 3,
    },
    {
      id: 'usr-tasnim',
      fullName: 'Tasnim Tabassum',
      mobileNumber: '01552334455',
      isMobileVerified: true,
      whatsappNumber: '01552334455',
      bloodGroup: 'AB_POS' as const,
      divisionId: 'div-5',
      districtId: 'dist-36',
      upazilaId: 'upz-281',
      postOfficeId: 'po-336',
      villageId: 'po-336-area',
      manualAvailable: true,
      lastDonationDate: null,
      hidePhoneNumber: false,
      totalDonations: 1,
    },
    {
      id: 'usr-rakibul',
      fullName: 'Md. Rakibul Islam',
      mobileNumber: '01722889900',
      isMobileVerified: true,
      whatsappNumber: '01722889900',
      bloodGroup: 'O_POS' as const,
      divisionId: 'div-2',
      districtId: 'dist-15',
      upazilaId: 'upz-m24',
      postOfficeId: 'po-896',
      villageId: 'po-896-area',
      manualAvailable: true,
      lastDonationDate: daysAgo(110),
      hidePhoneNumber: false,
      totalDonations: 5,
    },
  ];

  for (const u of usersSeed) {
    const cooldown = evaluateCooldown(u.lastDonationDate, u.manualAvailable);
    const badge = computeHeroBadge(u.totalDonations);

    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        availabilityStatus: cooldown.effectiveStatus,
        heroBadge: badge,
      },
      create: {
        ...u,
        availabilityStatus: cooldown.effectiveStatus,
        heroBadge: badge,
        lastActiveAt: hoursAgo(2),
      },
    });
  }

  const reqCreated = hoursAgo(6);
  await prisma.bloodRequest.upsert({
    where: { id: 'req-dmch-01' },
    update: {},
    create: {
      id: 'req-dmch-01',
      requesterId: 'usr-nusrat',
      patientName: 'Md. Abdur Rahim (62y)',
      bloodGroupNeeded: 'O_POS',
      unitsRequired: 2,
      unitsFulfilled: 0,
      urgencyLevel: 'EMERGENCY',
      hospitalName: 'Dhaka Medical College Hospital (DMCH)',
      wardCabinBed: 'Cardiology Ward 202, Bed 18',
      divisionId: 'div-6',
      districtId: 'dist-47',
      upazilaId: 'upz-m1',
      postOfficeId: 'po-1',
      villageOrArea: 'Bakshibazar Emergency Gate',
      contactPersonName: 'Kamrul Hasan (Son)',
      primaryMobile: '01755667788',
      alternateMobile: '01855667788',
      medicalReason: 'Urgent cardiac bypass surgery',
      status: 'ACTIVE',
      isActive: true,
      expiresAt: calculateInitialExpiryDate(reqCreated),
      createdAt: reqCreated,
    },
  });

  const ctgCreated = hoursAgo(14);
  await prisma.bloodRequest.upsert({
    where: { id: 'req-cmch-02' },
    update: {},
    create: {
      id: 'req-cmch-02',
      requesterId: 'usr-mehedi',
      patientName: 'Baby Ayesha Siddika',
      bloodGroupNeeded: 'B_POS',
      unitsRequired: 1,
      unitsFulfilled: 0,
      urgencyLevel: 'WITHIN_24H',
      hospitalName: 'Chattogram Medical College Hospital',
      wardCabinBed: 'Pediatric Ward 9, Bed 4',
      divisionId: 'div-1',
      districtId: 'dist-8',
      upazilaId: 'upz-m22',
      postOfficeId: 'po-636',
      villageOrArea: 'K.B. Fazlul Kader Road',
      contactPersonName: 'Salma Begum (Mother)',
      primaryMobile: '01833445566',
      medicalReason: 'Beta-Thalassemia Major regular transfusion',
      status: 'IN_PROGRESS',
      isActive: true,
      expiresAt: calculateInitialExpiryDate(ctgCreated),
      createdAt: ctgCreated,
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
