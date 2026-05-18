/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, logger } from '@/lib/utils';
import { AssignmentBulkSubmitSchema } from '@/lib/validators';
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
    const validatedData = AssignmentBulkSubmitSchema.parse(body);

    const { assignmentNumber, emails, submittedDate } = validatedData;
    const submissionDate = submittedDate || new Date();

    // Normalize emails to lowercase
    const normalizedEmails = emails.map((email) => email.toLowerCase().trim());

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
