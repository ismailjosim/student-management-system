/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { requireCurrentUserId } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    const body = await request.json();
    const { emails } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(createResponse(400, 'Emails array is required'), { status: 400 });
    }

    // Normalize emails for matching
    const normalizedEmails = emails.map((e: string) => e.trim().toLowerCase());

    // Find students by email
    const students = await Student.find({
      ownerId: userId,
      email: { $in: normalizedEmails },
    }).select('_id email name');

    const matchedEmails = students.map((s: any) => s.email.toLowerCase());
    const unmatchedEmails = normalizedEmails.filter(
      (email: string) => !matchedEmails.includes(email)
    );

    logger.info('POST /api/students/bulk-match', {
      totalEmails: emails.length,
      matched: matchedEmails.length,
      unmatched: unmatchedEmails.length,
    });

    const response = createResponse(200, 'Emails matched successfully', {
      matched: students.map((s: any) => ({
        studentId: s._id,
        email: s.email,
        name: s.name,
      })),
      unmatched: unmatchedEmails,
      stats: {
        matched: students.length,
        unmatched: unmatchedEmails.length,
        total: emails.length,
      },
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('POST /api/students/bulk-match failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
