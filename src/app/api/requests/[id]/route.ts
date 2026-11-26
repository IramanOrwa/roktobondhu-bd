import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateExtendedExpiryDate } from '@/lib/request-lifecycle';
import type { RequestStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const body = await req.json();
    const { action, status } = body as {
      action: 'extend' | 'status';
      status?: RequestStatus;
    };

    const existing = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
    if (!existing) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    if (action === 'extend') {
      const nextExpiry = calculateExtendedExpiryDate(new Date());
      const updated = await prisma.bloodRequest.update({
        where: { id: requestId },
        data: {
          expiresAt: nextExpiry,
          status: existing.status === 'EXPIRED' ? 'ACTIVE' : existing.status,
          isActive: true,
          extensionCount: { increment: 1 },
        },
      });
      return NextResponse.json({ request: updated });
    }

    if (action === 'status' && status) {
      const isActive = status === 'ACTIVE' || status === 'IN_PROGRESS';
      const updated = await prisma.bloodRequest.update({
        where: { id: requestId },
        data: { status, isActive },
      });
      return NextResponse.json({ request: updated });
    }

    return NextResponse.json({ error: 'Invalid request lifecycle action' }, { status: 400 });
  } catch (error) {
    console.error('Request PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update blood request' }, { status: 500 });
  }
}
