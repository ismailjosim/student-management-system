import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

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

  return { userId, response: null };
}
