import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidBangladeshMobile, normalizeBangladeshMobile } from '@/lib/validation';
import type { BloodGroupCode } from '@/types';

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, mobileNumber, otpCode, fullName, bloodGroup, location } = body as {
      action: 'send' | 'verify';
      mobileNumber: string;
      otpCode?: string;
      fullName?: string;
      bloodGroup?: BloodGroupCode;
      location?: {
        divisionId: string;
        districtId: string;
        upazilaId: string;
        postOfficeId: string;
        villageId: string;
      };
    };

    if (!mobileNumber || !isValidBangladeshMobile(mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid Bangladesh mobile number format.' },
        { status: 400 }
      );
    }

    const normalizedMobile = normalizeBangladeshMobile(mobileNumber);

    if (action === 'send') {
      const simulatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const existing = await prisma.user.findUnique({
        where: { mobileNumber: normalizedMobile },
      });

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            otpCodeHash: hashOtp(simulatedOtp),
            otpExpiresAt: expiresAt,
          },
        });
      }

      return NextResponse.json({
        success: true,
        mobileNumber: normalizedMobile,
        expiresAt: expiresAt.toISOString(),
        simulatedOtp: process.env.OTP_SIMULATION_MODE !== 'false' ? simulatedOtp : undefined,
      });
    }

    if (action === 'verify') {
      if (!otpCode || otpCode.trim().length !== 6) {
        return NextResponse.json({ error: '6-digit OTP is required.' }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({
        where: { mobileNumber: normalizedMobile },
      });

      if (existing) {
        const isExpired = !existing.otpExpiresAt || existing.otpExpiresAt.getTime() < Date.now();
        const isMatch = existing.otpCodeHash === hashOtp(otpCode.trim());
        if (isExpired || !isMatch) {
          return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 401 });
        }

        const updated = await prisma.user.update({
          where: { id: existing.id },
          data: {
            isMobileVerified: true,
            otpCodeHash: null,
            otpExpiresAt: null,
            lastActiveAt: new Date(),
          },
        });

        return NextResponse.json({ user: updated });
      }

      if (!fullName?.trim()) {
        return NextResponse.json(
          { error: 'Full name is required for new registration.' },
          { status: 400 }
        );
      }

      const created = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          mobileNumber: normalizedMobile,
          whatsappNumber: normalizedMobile,
          isMobileVerified: true,
          bloodGroup: bloodGroup ?? 'O_POS',
          divisionId: location?.divisionId ?? 'div-dhaka',
          districtId: location?.districtId ?? 'dist-dhaka',
          upazilaId: location?.upazilaId ?? 'upz-dhanmondi',
          postOfficeId: location?.postOfficeId ?? 'po-dhanmondi-1205',
          villageId: location?.villageId ?? 'vil-kalabagan',
          manualAvailable: true,
          availabilityStatus: 'AVAILABLE',
          totalDonations: 0,
          heroBadge: 'NONE',
        },
      });

      return NextResponse.json({ user: created }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (error) {
    console.error('OTP route error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 500 });
  }
}
