import { NextRequest, NextResponse } from 'next/server';
import { COMPATIBLE_DONOR_MAP, rankMatchingDonors } from '@/lib/donor-ranking';
import { prisma } from '@/lib/prisma';
import type { BloodGroupCode, UserProfile } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const bloodGroup = (sp.get('bloodGroup') || 'O_POS') as BloodGroupCode;
    const includeCompatible = sp.get('includeCompatible') === 'true';
    const divisionId = sp.get('divisionId') || undefined;
    const districtId = sp.get('districtId') || undefined;
    const upazilaId = sp.get('upazilaId') || undefined;
    const postOfficeId = sp.get('postOfficeId') || undefined;
    const villageId = sp.get('villageId') || undefined;
    const requesterId = sp.get('requesterId') || undefined;

    const acceptedGroups = includeCompatible
      ? COMPATIBLE_DONOR_MAP[bloodGroup]
      : [bloodGroup];

    const dbDonors = await prisma.user.findMany({
      where: {
        bloodGroup: { in: acceptedGroups },
        manualAvailable: true,
      },
    });

    let confirmedDonorIds = new Set<string>();
    if (requesterId) {
      const confirmedMatches = await prisma.emergencyMatch.findMany({
        where: {
          phoneRevealed: true,
          request: { requesterId },
        },
        select: { donorId: true },
      });
      confirmedDonorIds = new Set(confirmedMatches.map((m) => m.donorId));
    }

    const mappedDonors: UserProfile[] = dbDonors.map((d) => ({
      ...d,
      lastDonationDate: d.lastDonationDate ? d.lastDonationDate.toISOString() : null,
      lastActiveAt: d.lastActiveAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
    }));

    const ranked = rankMatchingDonors(mappedDonors, {
      bloodGroupNeeded: bloodGroup,
      includeCompatible,
      divisionId,
      districtId,
      upazilaId,
      postOfficeId,
      villageId,
      confirmedDonorIds,
      excludeUserId: requesterId,
    });

    return NextResponse.json({
      count: ranked.length,
      donors: ranked,
    });
  } catch (error) {
    console.error('Donor search error:', error);
    return NextResponse.json({ error: 'Failed to search donors' }, { status: 500 });
  }
}
