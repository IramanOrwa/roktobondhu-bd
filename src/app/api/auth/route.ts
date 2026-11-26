import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isEligibleDonorAge, isValidBangladeshMobile, normalizeBangladeshMobile } from '@/lib/validation';
import type { BloodGroupCode } from '@/types';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, mobileNumber, password, fullName, dateOfBirth, bloodGroup, location } = body as {
      action: 'login' | 'register';
      mobileNumber: string;
      password: string;
      fullName?: string;
      dateOfBirth?: string;
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

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const normalizedMobile = normalizeBangladeshMobile(mobileNumber);

    if (action === 'login') {
      const user = await prisma.user.findUnique({
        where: { mobileNumber: normalizedMobile },
      });
      if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json(
          { error: 'Invalid mobile number or password.' },
          { status: 401 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      const { passwordHash: _ph, otpCodeHash: _oh, ...safeUser } = updated;
      return NextResponse.json({ user: safeUser });
    }

    if (action === 'register') {
      const existing = await prisma.user.findUnique({
        where: { mobileNumber: normalizedMobile },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this mobile number already exists. Please sign in.' },
          { status: 409 }
        );
      }

      if (!fullName?.trim()) {
        return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
      }
      if (!dateOfBirth || !isEligibleDonorAge(dateOfBirth)) {
        return NextResponse.json(
          { error: 'Valid Date of Birth is required (age must be between 18 and 65).' },
          { status: 400 }
        );
      }

      const created = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          mobileNumber: normalizedMobile,
          whatsappNumber: normalizedMobile,
          dateOfBirth: new Date(dateOfBirth),
          passwordHash: hashPassword(password),
          isMobileVerified: true,
          bloodGroup: bloodGroup ?? 'O_POS',
          divisionId: location?.divisionId ?? 'div-6',
          districtId: location?.districtId ?? 'dist-47',
          upazilaId: location?.upazilaId ?? 'upz-m7',
          postOfficeId: location?.postOfficeId ?? 'po-9',
          villageId: location?.villageId ?? 'po-9-area',
          manualAvailable: true,
          availabilityStatus: 'AVAILABLE',
          totalDonations: 0,
          heroBadge: 'NONE',
        },
      });

      const { passwordHash: _ph, otpCodeHash: _oh, ...safeUser } = created;
      return NextResponse.json({ user: safeUser }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported auth action.' }, { status: 400 });
  } catch (error) {
    console.error('Auth route error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 500 });
  }
}
