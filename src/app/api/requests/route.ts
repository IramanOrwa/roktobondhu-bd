import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateInitialExpiryDate } from '@/lib/request-lifecycle';
import { isValidBangladeshMobile, normalizeBangladeshMobile } from '@/lib/validation';
import type { BloodGroupCode, UrgencyLevel } from '@/types';

export async function GET() {
  try {
    const now = new Date();

    // Enforce 48-hour auto-expiry across active/in-progress requests
    await prisma.bloodRequest.updateMany({
      where: {
        status: { in: ['ACTIVE', 'IN_PROGRESS'] },
        expiresAt: { lte: now },
      },
      data: {
        status: 'EXPIRED',
        isActive: false,
      },
    });

    const requests = await prisma.bloodRequest.findMany({
      orderBy: [{ urgencyLevel: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Requests GET error:', error);
    return NextResponse.json({ error: 'Failed to load blood requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requesterId,
      patientName,
      bloodGroupNeeded,
      unitsRequired,
      urgencyLevel,
      hospitalName,
      wardCabinBed,
      divisionId,
      districtId,
      upazilaId,
      postOfficeId,
      villageOrArea,
      contactPersonName,
      primaryMobile,
      alternateMobile,
      medicalReason,
    } = body as {
      requesterId: string;
      patientName: string;
      bloodGroupNeeded: BloodGroupCode;
      unitsRequired: number;
      urgencyLevel: UrgencyLevel;
      hospitalName: string;
      wardCabinBed: string;
      divisionId: string;
      districtId: string;
      upazilaId: string;
      postOfficeId?: string;
      villageOrArea?: string;
      contactPersonName: string;
      primaryMobile: string;
      alternateMobile?: string;
      medicalReason: string;
    };

    if (
      !requesterId ||
      !patientName?.trim() ||
      !hospitalName?.trim() ||
      !wardCabinBed?.trim() ||
      !divisionId ||
      !districtId ||
      !upazilaId ||
      !contactPersonName?.trim() ||
      !medicalReason?.trim()
    ) {
      return NextResponse.json({ error: 'Missing required request fields.' }, { status: 400 });
    }

    if (!isValidBangladeshMobile(primaryMobile)) {
      return NextResponse.json({ error: 'Invalid Bangladesh primary mobile.' }, { status: 400 });
    }

    const units = Number(unitsRequired);
    if (!Number.isInteger(units) || units < 1 || units > 15) {
      return NextResponse.json({ error: 'Units required must be 1 to 15.' }, { status: 400 });
    }

    const now = new Date();
    const created = await prisma.bloodRequest.create({
      data: {
        requesterId,
        patientName: patientName.trim(),
        bloodGroupNeeded,
        unitsRequired: units,
        urgencyLevel: urgencyLevel ?? 'EMERGENCY',
        hospitalName: hospitalName.trim(),
        wardCabinBed: wardCabinBed.trim(),
        divisionId,
        districtId,
        upazilaId,
        postOfficeId: postOfficeId || null,
        villageOrArea: villageOrArea?.trim() || null,
        contactPersonName: contactPersonName.trim(),
        primaryMobile: normalizeBangladeshMobile(primaryMobile),
        alternateMobile: alternateMobile?.trim()
          ? normalizeBangladeshMobile(alternateMobile)
          : null,
        medicalReason: medicalReason.trim(),
        status: 'ACTIVE',
        isActive: true,
        expiresAt: calculateInitialExpiryDate(now),
      },
    });

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error) {
    console.error('Requests POST error:', error);
    return NextResponse.json({ error: 'Failed to create blood request' }, { status: 500 });
  }
}
