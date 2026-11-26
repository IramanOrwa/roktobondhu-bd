import { NextRequest, NextResponse } from 'next/server';
import { computeHeroBadge, evaluateCooldown } from '@/lib/cooldown';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, donorId } = body as { requestId: string; donorId: string };

    if (!requestId || !donorId) {
      return NextResponse.json({ error: 'requestId and donorId are required' }, { status: 400 });
    }

    const match = await prisma.emergencyMatch.upsert({
      where: { requestId_donorId: { requestId, donorId } },
      update: {},
      create: {
        requestId,
        donorId,
        status: 'PENDING',
        phoneRevealed: false,
      },
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    console.error('Match POST error:', error);
    return NextResponse.json({ error: 'Failed to create emergency match' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, action } = body as {
      matchId: string;
      action: 'confirm' | 'complete' | 'cancel';
    };

    const existing = await prisma.emergencyMatch.findUnique({
      where: { id: matchId },
      include: { request: true, donor: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (action === 'confirm') {
      const updated = await prisma.emergencyMatch.update({
        where: { id: matchId },
        data: {
          status: 'CONFIRMED',
          phoneRevealed: true,
          confirmedAt: new Date(),
        },
      });
      await prisma.bloodRequest.update({
        where: { id: existing.requestId },
        data: { status: 'IN_PROGRESS', isActive: true },
      });
      return NextResponse.json({ match: updated });
    }

    if (action === 'complete') {
      const now = new Date();
      const updatedMatch = await prisma.emergencyMatch.update({
        where: { id: matchId },
        data: { status: 'COMPLETED', completedAt: now, phoneRevealed: true },
      });

      const nextDonations = existing.donor.totalDonations + 1;
      const cooldown = evaluateCooldown(now, existing.donor.manualAvailable, now);
      const nextBadge = computeHeroBadge(nextDonations);

      const updatedDonor = await prisma.user.update({
        where: { id: existing.donorId },
        data: {
          lastDonationDate: now,
          availabilityStatus: cooldown.effectiveStatus, // Automatically ON_COOLDOWN for 90 days
          totalDonations: nextDonations,
          heroBadge: nextBadge,
        },
      });

      await prisma.donationLog.create({
        data: {
          donorId: existing.donorId,
          requestId: existing.requestId,
          source: 'INTERNAL_MATCH',
          donatedAt: now,
          hospitalOrCenter: existing.request.hospitalName,
        },
      });

      const nextFulfilled = existing.request.unitsFulfilled + 1;
      const isFulfilled = nextFulfilled >= existing.request.unitsRequired;
      await prisma.bloodRequest.update({
        where: { id: existing.requestId },
        data: {
          unitsFulfilled: nextFulfilled,
          status: isFulfilled ? 'FULFILLED' : 'IN_PROGRESS',
          isActive: !isFulfilled,
        },
      });

      return NextResponse.json({ match: updatedMatch, donor: updatedDonor });
    }

    if (action === 'cancel') {
      const updated = await prisma.emergencyMatch.update({
        where: { id: matchId },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({ match: updated });
    }

    return NextResponse.json({ error: 'Invalid match action' }, { status: 400 });
  } catch (error) {
    console.error('Match PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update emergency match' }, { status: 500 });
  }
}
