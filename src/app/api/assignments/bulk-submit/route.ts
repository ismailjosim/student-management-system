/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, logger } from '@/lib/utils';
import { AssignmentBulkSubmitSchema } from '@/lib/validators';
import Student from '@/models/Student';
import { Settings } from '@/models/Settings';
import { revalidateCacheTags } from '@/lib/server-cache';
import { CACHE_INVALIDATION_TRIGGERS } from '@/lib/cache';
import { requireCurrentUserId } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';

const parseAssignmentNumber = (assignment: string | undefined) => {
  if (!assignment) return null;

  const assignmentNumber = parseInt(assignment.split('-')[1], 10);

  return Number.isNaN(assignmentNumber) ? null : assignmentNumber;
};

const isAssignmentSubmitted = (assignment: any) =>
  assignment?.status === 'SUBMITTED' || assignment?.status === 'COMPLETED';

const getMissedReleasedAssignmentCount = (assignments: any[] = [], currentAssignment: number) =>
  Array.from({ length: currentAssignment }, (_, index) => index + 1).filter((assignmentNumber) => {
    const assignment = assignments.find((item) => item.assignmentNumber === assignmentNumber);

    return !isAssignmentSubmitted(assignment);
  }).length;

const getStatusFromMissedCount = (missedCount: number) => {
  if (missedCount === 0) return 'On Track';
  if (missedCount === 1) return 'Behind';
  return 'At Risk';
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    const body = await request.json();
    const validatedData = AssignmentBulkSubmitSchema.parse(body);

    const { assignmentNumber, emails, submittedDate } = validatedData;
    const submissionDate = submittedDate || new Date();
    const settings = await Settings.findOne({ ownerId: userId }).lean();
    const currentAssignmentNumber = parseAssignmentNumber(settings?.currentAssignment);

    // Normalize emails to lowercase
    const normalizedEmails = emails.map((email: string) => email.toLowerCase().trim());

    // Find all matching students
    const students = await Student.find({
      ownerId: userId,
      email: { $in: normalizedEmails },
    });

    const studentMap = new Map(students.map((s: any) => [s.email.toLowerCase(), s]));
    const matchedEmails = new Set<string>();
    const unmatchedEmails: string[] = [];

    // Track results
    let createdCount = 0;
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

      // Initialize assignments array if needed
      if (!student.assignments) {
        student.assignments = [];
      }

      // Check if assignment already exists in embedded array
      const existingIndex = student.assignments.findIndex(
        (a: any) => a.assignmentNumber === assignmentNumber
      );

      if (existingIndex >= 0) {
        // Update existing embedded assignment
        student.assignments[existingIndex] = {
          assignmentNumber,
          status: 'SUBMITTED',
          date: submissionDate,
        };
        updatedCount++;
      } else {
        // Add new embedded assignment
        student.assignments.push({
          assignmentNumber,
          status: 'SUBMITTED',
          date: submissionDate,
        });
        createdCount++;
      }

      // Update student's lastCompletedAssignment if needed
      const assignmentKey = `A-${String(assignmentNumber).padStart(2, '0')}`;
      const currentLast = student.lastCompletedAssignment || 'None';

      if (currentLast === 'None' || parseInt(currentLast.split('-')[1]) < assignmentNumber) {
        student.lastCompletedAssignment = assignmentKey;
      }

      if (
        currentAssignmentNumber &&
        assignmentNumber <= currentAssignmentNumber &&
        student.currentStatus !== 'Dropped' &&
        student.currentStatus !== 'Completed'
      ) {
        const missedAssignmentCount = getMissedReleasedAssignmentCount(
          student.assignments,
          currentAssignmentNumber
        );

        student.currentStatus = getStatusFromMissedCount(missedAssignmentCount);
      }

      // Save the updated student document
      await student.save();
    }

    logger.info('POST /api/assignments/bulk-submit', {
      assignmentNumber,
      matched: matchedEmails.size,
      unmatched: unmatchedEmails.length,
      created: createdCount,
      updated: updatedCount,
    });

    const response = createResponse(200, 'Bulk submit completed successfully', {
      matched: {
        count: matchedStudents.length,
        students: matchedStudents,
      },
      unmatched: {
        count: unmatchedEmails.length,
        emails: unmatchedEmails,
      },
      created: createdCount,
      updated: updatedCount,
      total: {
        processed: normalizedEmails.length,
        successfulMatches: matchedStudents.length,
      },
    });

    revalidateCacheTags(CACHE_INVALIDATION_TRIGGERS.updateAssignment);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const errorData = handleZodError(error as any);
      return NextResponse.json(
        createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
        { status: errorData.statusCode }
      );
    }

    logger.error('POST /api/assignments/bulk-submit failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
