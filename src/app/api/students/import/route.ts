/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Student from '@/models/Student';
import { processStudentImportFile } from '@/lib/file-parser';
import { connectDB } from '@/lib/mongodb';
import { revalidateCacheTags } from '@/lib/server-cache';
import { CACHE_INVALIDATION_TRIGGERS } from '@/lib/cache';
import { requireCurrentUserId } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Process and validate import file
    const fileData = await processStudentImportFile(file);

    // For preview mode - just return validation results
    const previewOnly = formData.get('previewOnly') === 'true';
    if (previewOnly) {
      return NextResponse.json({
        preview: true,
        headers: fileData.headers,
        totalRows: fileData.rows,
        validCount: fileData.validRows.length,
        invalidCount: fileData.invalidRows.length,
        duplicateCount: fileData.duplicateEmails.length,
        validRows: fileData.validRows.slice(0, 10), // First 10 for preview
        invalidRows: fileData.invalidRows.slice(0, 5), // First 5 errors for preview
        duplicateEmails: fileData.duplicateEmails,
        message: fileData.valid ? 'File is valid' : 'File has validation errors',
      });
    }

    // Actual import - check for existing emails
    const importConfirmed = formData.get('confirmed') === 'true';
    if (!importConfirmed) {
      return NextResponse.json({ error: 'Import not confirmed' }, { status: 400 });
    }

    // Check for duplicate emails in database
    const emails = fileData.validRows.map((r) => r.email);
    const existingStudents = await Student.find({ ownerId: userId, email: { $in: emails } });
    const existingEmails = existingStudents.map((s: any) => s.email);

    const toCreate = fileData.validRows.filter((row) => !existingEmails.includes(row.email));
    const toUpdate = fileData.validRows.filter((row) => existingEmails.includes(row.email));

    // Create new students
    const created = await Student.insertMany(
      toCreate.map((student) => ({ ...student, ownerId: userId }))
    );

    // Update existing students
    let updated = 0;
    for (const student of toUpdate) {
      await Student.updateOne({ ownerId: userId, email: student.email }, student, {
        runValidators: true,
      });
      updated++;
    }

    // Invalidate student-related caches after bulk import/update
    if (created.length > 0 || updated > 0) {
      revalidateCacheTags(CACHE_INVALIDATION_TRIGGERS.updateStudent);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: fileData.validRows.length,
        created: created.length,
        updated: updated,
        skipped: fileData.invalidRows.length + fileData.duplicateEmails.length,
        createdIds: created.map((s: any) => s._id),
      },
      message: `Imported ${created.length} new students, updated ${updated} existing students`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to import students',
      },
      { status: 500 }
    );
  }
}
