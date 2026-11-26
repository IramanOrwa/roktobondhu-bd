import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidBangladeshMobile, normalizeBangladeshMobile } from '@/lib/validation';
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
    const { action, mobileNumber, password, fullName, bloodGroup, location } = body as {
      action: 'login' | 'register';
      mobileNumber: string;
      password: string;
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

      const created = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          mobileNumber: normalizedMobile,
          whatsappNumber: normalizedMobile,
          passwordHash: hashPassword(password),
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

      const { passwordHash: _ph, otpCodeHash: _oh, ...safeUser } = created;
      return NextResponse.json({ user: safeUser }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported auth action.' }, { status: 400 });
  } catch (error) {
    console.error('Auth route error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 500 });
  }
}
