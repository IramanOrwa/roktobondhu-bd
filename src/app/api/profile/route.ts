import { NextRequest, NextResponse } from 'next/server';
import { computeHeroBadge, evaluateCooldown } from '@/lib/cooldown';
import { prisma } from '@/lib/prisma';
import { isFutureDate } from '@/lib/validation';
import type { BloodGroupCode } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cooldown = evaluateCooldown(user.lastDonationDate, user.manualAvailable);
    if (cooldown.effectiveStatus !== user.availabilityStatus) {
      await prisma.user.update({
        where: { id: user.id },
        data: { availabilityStatus: cooldown.effectiveStatus },
      });
    }

    return NextResponse.json({
      user: { ...user, availabilityStatus: cooldown.effectiveStatus },
      cooldown,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      fullName,
      whatsappNumber,
      secondaryPhone,
      bloodGroup,
      divisionId,
      districtId,
      upazilaId,
      postOfficeId,
      villageId,
      manualAvailable,
      hidePhoneNumber,
      externalDonationDate,
      hospitalOrCenter,
    } = body as {
      userId: string;
      fullName?: string;
      whatsappNumber?: string;
      secondaryPhone?: string;
      bloodGroup?: BloodGroupCode;
      divisionId?: string;
      districtId?: string;
      upazilaId?: string;
      postOfficeId?: string;
      villageId?: string;
      manualAvailable?: boolean;
      hidePhoneNumber?: boolean;
      externalDonationDate?: string;
      hospitalOrCenter?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let nextLastDonationDate = existing.lastDonationDate;
    let nextTotalDonations = existing.totalDonations;

    if (externalDonationDate) {
      if (isFutureDate(externalDonationDate)) {
        return NextResponse.json(
          { error: 'Donation date cannot be in the future.' },
          { status: 400 }
        );
      }

      const donatedAt = new Date(externalDonationDate);
      if (!nextLastDonationDate || donatedAt.getTime() > nextLastDonationDate.getTime()) {
        nextLastDonationDate = donatedAt;
      }
      nextTotalDonations += 1;

      await prisma.donationLog.create({
        data: {
          donorId: userId,
          source: 'EXTERNAL_LOG',
          donatedAt,
          hospitalOrCenter: hospitalOrCenter?.trim() || null,
        },
      });
    }

    const nextManualAvailable =
      typeof manualAvailable === 'boolean' ? manualAvailable : existing.manualAvailable;
    const cooldown = evaluateCooldown(nextLastDonationDate, nextManualAvailable);
    const nextBadge = computeHeroBadge(nextTotalDonations);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName?.trim() || existing.fullName,
        whatsappNumber: whatsappNumber !== undefined ? whatsappNumber.trim() : existing.whatsappNumber,
        secondaryPhone: secondaryPhone !== undefined ? secondaryPhone.trim() : existing.secondaryPhone,
        bloodGroup: bloodGroup ?? existing.bloodGroup,
        divisionId: divisionId ?? existing.divisionId,
        districtId: districtId ?? existing.districtId,
        upazilaId: upazilaId ?? existing.upazilaId,
        postOfficeId: postOfficeId ?? existing.postOfficeId,
        villageId: villageId ?? existing.villageId,
        manualAvailable: nextManualAvailable,
        availabilityStatus: cooldown.effectiveStatus,
        lastDonationDate: nextLastDonationDate,
        hidePhoneNumber:
          typeof hidePhoneNumber === 'boolean' ? hidePhoneNumber : existing.hidePhoneNumber,
        totalDonations: nextTotalDonations,
        heroBadge: nextBadge,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ user: updated, cooldown });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
