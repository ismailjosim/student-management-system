import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/utils';
import CallLog from '@/models/CallLog';
import FollowUp from '@/models/FollowUp';
import Student from '@/models/Student';

const legacyOwnershipClaimed = new Set<string>();

const missingOwnerFilter = {
  $or: [{ ownerId: { $exists: false } }, { ownerId: null }, { ownerId: '' }],
};

async function claimLegacyRecordsForUser(userId: string) {
  if (legacyOwnershipClaimed.has(userId)) return;

  try {
    const [students, callLogs, followUps] = await Promise.all([
      Student.updateMany(missingOwnerFilter, { $set: { ownerId: userId } }),
      CallLog.updateMany(missingOwnerFilter, { $set: { ownerId: userId } }),
      FollowUp.updateMany(missingOwnerFilter, { $set: { ownerId: userId } }),
    ]);

    const claimedCount = students.modifiedCount + callLogs.modifiedCount + followUps.modifiedCount;

    if (claimedCount > 0) {
      logger.info('Claimed legacy records for authenticated user', {
        students: students.modifiedCount,
        callLogs: callLogs.modifiedCount,
        followUps: followUps.modifiedCount,
      });
    }
  } catch (error) {
    logger.error('Failed to claim legacy records for authenticated user', error);
  } finally {
    legacyOwnershipClaimed.add(userId);
  }
}

export async function getCurrentUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      userId: null,
      response: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    };
  }

  await claimLegacyRecordsForUser(userId);

  return { userId, response: null };
}
