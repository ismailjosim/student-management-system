/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for mentorship bulk update
const MentorshipBulkUpdateSchema = z.object({
  emails: z
    .array(z.string().email('Invalid email format'))
    .min(1, 'At least one email is required'),
  mentorshipJoiningStatus: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = MentorshipBulkUpdateSchema.parse(body);

    const { emails, mentorshipJoiningStatus } = validatedData;

    // Normalize emails to lowercase
    const normalizedEmails = emails.map((email) => email.toLowerCase().trim());

    // Find all matching students
    const students = await Student.find({
      email: { $in: normalizedEmails },
    }).lean();

    const studentMap = new Map(students.map((s: any) => [s.email.toLowerCase(), s]));
    const matchedEmails = new Set<string>();
    const unmatchedEmails: string[] = [];

    // Track results
    let updatedCount = 0;
    const matchedStudents: any[] = [];

    // Process each email
    for (const email of normalizedEmails) {
      if (!email) continue;

      const student = studentMap.get(email);

      if (!student) {
        unmatchedEmails.push(email);
        continue;
      }

      matchedEmails.add(email);
      matchedStudents.push({
        email: student.email,
        name: student.name,
        id: student._id.toString(),
      });

      // Update student's mentorshipJoiningStatus
      await Student.findByIdAndUpdate(student._id, {
        mentorshipJoiningStatus,
      });
      updatedCount++;
    }

    logger.info('POST /api/students/bulk-update-mentorship', {
      mentorshipJoiningStatus,
      matched: matchedEmails.size,
      unmatched: unmatchedEmails.length,
      updated: updatedCount,
    });

    const response = createResponse(200, 'Mentorship status updated successfully', {
      matched: matchedStudents,
      unmatched: unmatchedEmails,
      stats: {
        matched: matchedEmails.size,
        unmatched: unmatchedEmails.length,
        updated: updatedCount,
        total: emails.length,
      },
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('POST /api/students/bulk-update-mentorship failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
