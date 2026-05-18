import { NextResponse } from 'next/server';
import Student from '@/models/Student';
import { connectDB } from '@/lib/mongodb';
import { generateCallList, exportToExcel, generateExportFilename } from '@/lib/export';
import { requireCurrentUserId } from '@/lib/auth-utils';

export async function GET() {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    // Fetch students with call logs, ordered by last call date
    const students = await Student.find({ ownerId: userId })
      .populate('callLogs', 'date status')
      .lean()
      .sort({ 'callLogs.0.date': -1 });

    // Generate call list data
    const callListData = generateCallList(students);

    // Export to Excel
    const blob = exportToExcel(callListData);
    const buffer = await blob.arrayBuffer();

    // Create filename with date
    const filename = generateExportFilename('CallList', 'xlsx');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to export call list',
      },
      { status: 500 }
    );
  }
}
