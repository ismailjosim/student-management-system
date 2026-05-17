/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import type { StudentWithRelations } from '@/types';

/**
 * Export data to Excel file
 */
export function exportToExcel(data: Record<string, unknown>[]): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Convert to binary and create blob
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Export data to CSV file
 */
export function exportToCSV(data: Record<string, unknown>[]): Blob {
  if (data.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8;' });
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (value === null || value === undefined) return '';
          const strValue = String(value).replace(/"/g, '""');
          return strValue.includes(',') ? `"${strValue}"` : strValue;
        })
        .join(',')
    ),
  ].join('\n');

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generate call list for export
 */
export function generateCallList(students: StudentWithRelations[]): Record<string, any>[] {
  return students.map((student) => ({
    name: student.name,
    email: student.email,
    phone: student.phone,
    whatsapp: student.whatsapp || '',
    lastCalled: (student as any).callLogs?.[0]?.date
      ? new Date((student as any).callLogs[0].date).toLocaleDateString()
      : '',
    currentStatus: student.currentStatus || 'On Track',
    division: student.division || '',
    institute: student.institute || '',
  }));
}

/**
 * Generate student roster for export
 */
export function generateStudentReport(students: StudentWithRelations[]): Record<string, any>[] {
  return students.map((student) => ({
    name: student.name,
    email: student.email,
    phone: student.phone,
    whatsapp: student.whatsapp || '',
    division: student.division || '',
    institute: student.institute || '',
    educationalBackground: student.educationalBackground || '',
    currentYear: student.currentYear || '',
    workingDevice: student.workingDevice || '',
    currentStatus: student.currentStatus || 'On Track',
    createdAt: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '',
  }));
}

/**
 * Generate progress report for export
 */
export function generateProgressReport(students: StudentWithRelations[]): Record<string, any>[] {
  return students.map((student) => {
    const assignments = student.assignments || []; // Now in format ['A-05','A-06'...]
    const completed = assignments.length;
    const total = 10;

    return {
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      status: student.currentStatus || 'On Track',
      lastCompletedAssignment: student.lastCompletedAssignment || 'None',
      completedAssignments: assignments.join(', '),
      completionRate: `${Math.round((completed / total) * 100)}%`,
      completedCount: completed,
      totalCount: total,
      createdAt: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '',
    };
  });
}

/**
 * Trigger file download in browser
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate filename with current date
 */
export function generateExportFilename(prefix: string, ext: string = 'xlsx'): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `MentorTrack-${prefix}-${dateStr}.${ext}`;
}
