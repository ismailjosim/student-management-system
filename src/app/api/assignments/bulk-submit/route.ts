/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, logger } from '@/lib/utils';
import { AssignmentBulkSubmitSchema } from '@/lib/validators';
import Student from '@/models/Student';
import Assignment from '@/models/Assignment';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = AssignmentBulkSubmitSchema.parse(body);

    const { assignmentNumber, emails, completedDate } = validatedData;
    const submissionDate = completedDate || new Date();

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

      // Check if assignment already exists
      const existingAssignment = await Assignment.findOne({
        studentId: student._id,
        assignmentNumber,
      });

      if (existingAssignment) {
        // Update existing assignment
        await Assignment.findByIdAndUpdate(existingAssignment._id, {
          status: 'SUBMITTED',
          completedDate: submissionDate,
        });
        updatedCount++;
      } else {
        // Create new assignment
        const newAssignment = new Assignment({
          assignmentNumber,
          status: 'SUBMITTED',
          completedDate: submissionDate,
          studentId: student._id,
        });
        await newAssignment.save();
        createdCount++;
      }

      // Update student's lastCompletedAssignment if needed
      const assignmentKey = `A-${String(assignmentNumber).padStart(2, '0')}`;
      const currentLast = student.lastCompletedAssignment || 'None';

      if (currentLast === 'None' || parseInt(currentLast.split('-')[1]) < assignmentNumber) {
        await Student.findByIdAndUpdate(student._id, {
          lastCompletedAssignment: assignmentKey,
        });
      }
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
