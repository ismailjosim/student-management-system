/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import { z } from 'zod';

/**
 * Student import validation schema
 */
const StudentDataSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  whatsapp: z.string().optional(),
  division: z.string().optional(),
  institute: z.string().optional(),
  educationalBackground: z.string().optional(),
  currentYear: z.string().optional(),
  group: z.string().optional(),
  device: z.string().optional(),
});

export type StudentImportData = z.infer<typeof StudentDataSchema>;

/**
 * Assignment import validation schema
 */
const AssignmentDataSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type AssignmentImportData = z.infer<typeof AssignmentDataSchema>;

/**
 * Parse CSV file to JSON array
 */
export async function parseCSV(file: File): Promise<Record<string, any>[]> {
  const text = await file.text();
  const workbook = XLSX.read(text, { type: 'string' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('No sheet found in CSV file');

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

  if (data.length === 0) throw new Error('CSV file is empty');
  return data;
}

/**
 * Parse XLSX file to JSON array
 */
export async function parseXLSX(file: File): Promise<Record<string, any>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('No sheet found in Excel file');

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

  if (data.length === 0) throw new Error('Excel file is empty');
  return data;
}

/**
 * Normalize phone number - remove non-digits and ensure 10+ digits
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length < 10) return '';
  // Keep only last 11 digits (for BD: 01xxx format)
  return cleaned.slice(-11) || cleaned;
}

/**
 * Normalize email - lowercase and trim
 */
export function normalizeEmail(email: string | undefined): string {
  if (!email) return '';
  return email.toString().toLowerCase().trim();
}

/**
 * Normalize field names by converting to lowercase and removing spaces
 */
function normalizeFieldName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

/**
 * Try to detect and map columns from headers
 */
export function detectColumnMapping(
  headers: string[],
  targetFields: string[]
): Record<string, number> {
  const mapping: Record<string, number> = {};
  const normalizedHeaders = headers.map(normalizeFieldName);

  for (const field of targetFields) {
    const normalizedField = normalizeFieldName(field);
    const index = normalizedHeaders.findIndex(
      (h) => h.includes(normalizedField) || normalizedField.includes(h)
    );
    if (index !== -1) {
      mapping[field] = index;
    }
  }

  return mapping;
}

/**
 * Validate student import data
 */
export function validateStudentData(row: any): {
  valid: boolean;
  data?: StudentImportData;
  errors?: string[];
} {
  try {
    // Normalize all keys to lowercase first
    const normalizedRow: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      normalizedRow[key.toLowerCase().trim()] = row[key];
    }

    const normalized = {
      name: normalizedRow.name?.toString().trim() || '',
      email: normalizeEmail(normalizedRow.email),
      phone: formatPhoneNumber(normalizedRow.phone),
      whatsapp: formatPhoneNumber(normalizedRow.whatsapp),
      division: normalizedRow.division?.toString().trim(),
      institute: normalizedRow.institute?.toString().trim(),
      educationalBackground: normalizedRow.educationalbackground?.toString().trim(),
      currentYear: normalizedRow.currentyear?.toString().trim(),
      group: normalizedRow.group?.toString().trim(),
      device: normalizedRow.device?.toString().trim(),
    };

    const result = StudentDataSchema.parse(normalized);
    return { valid: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log({ error });
      return {
        valid: false,
        // errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}
/**
 * Validate assignment import data (email only)
 */
export function validateAssignmentData(row: any): {
  valid: boolean;
  data?: AssignmentImportData;
  error?: string;
} {
  try {
    const normalized = {
      email: normalizeEmail(row.email),
    };

    const result = AssignmentDataSchema.parse(normalized);
    return { valid: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: (error as any).errors.map((e: any) => e.message).join(', '),
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
}

/**
 * Process student import file - returns preview with validation results
 */
export async function processStudentImportFile(file: File): Promise<{
  valid: boolean;
  headers: string[];
  rows: number;
  preview: any[];
  validRows: (StudentImportData & { rowIndex: number })[];
  invalidRows: { rowIndex: number; data: any; errors: string[] }[];
  duplicateEmails: { email: string; rowIndices: number[] }[];
}> {
  // Validate file type and size
  if (!file.name.match(/\.(csv|xlsx)$/i)) {
    throw new Error('File must be CSV or XLSX format');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be under 5MB');
  }

  // Parse file
  let data: Record<string, any>[] = [];
  if (file.name.endsWith('.csv')) {
    data = await parseCSV(file);
  } else if (file.name.endsWith('.xlsx')) {
    data = await parseXLSX(file);
  } else {
    throw new Error('Unsupported file format');
  }

  const headers = Object.keys(data[0] || {});
  const validRows: (StudentImportData & { rowIndex: number })[] = [];
  const invalidRows: { rowIndex: number; data: any; errors: string[] }[] = [];
  const emailMap: Record<string, number[]> = {};

  // Validate each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const validation = validateStudentData(row);

    if (validation.valid && validation.data) {
      validRows.push({ ...validation.data, rowIndex: i });
      if (!emailMap[validation.data.email]) {
        emailMap[validation.data.email] = [];
      }
      emailMap[validation.data.email].push(i);
    } else {
      invalidRows.push({
        rowIndex: i,
        data: row,
        errors: validation.errors || [],
      });
    }
  }

  // Find duplicate emails
  const duplicateEmails = Object.entries(emailMap)
    .filter(([, indices]) => indices.length > 1)
    .map(([email, indices]) => ({ email, rowIndices: indices }));

  return {
    valid: invalidRows.length === 0 && duplicateEmails.length === 0,
    headers,
    rows: data.length,
    preview: data.slice(0, 10),
    validRows,
    invalidRows,
    duplicateEmails,
  };
}

/**
 * Process assignment import file - returns preview with validation results
 */
export async function processAssignmentImportFile(file: File): Promise<{
  valid: boolean;
  headers: string[];
  rows: number;
  preview: any[];
  validEmails: string[];
  invalidRows: { rowIndex: number; data: any; error: string }[];
}> {
  // Validate file type and size
  if (!file.name.match(/\.(csv|xlsx)$/i)) {
    throw new Error('File must be CSV or XLSX format');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be under 5MB');
  }

  // Parse file
  let data: Record<string, any>[] = [];
  if (file.name.endsWith('.csv')) {
    data = await parseCSV(file);
  } else if (file.name.endsWith('.xlsx')) {
    data = await parseXLSX(file);
  } else {
    throw new Error('Unsupported file format');
  }

  const headers = Object.keys(data[0] || {});
  const validEmails: string[] = [];
  const invalidRows: { rowIndex: number; data: any; error: string }[] = [];

  // Validate each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const validation = validateAssignmentData(row);

    if (validation.valid && validation.data) {
      validEmails.push(validation.data.email);
    } else {
      invalidRows.push({
        rowIndex: i,
        data: row,
        error: validation.error || 'Invalid row',
      });
    }
  }

  return {
    valid: invalidRows.length === 0,
    headers,
    rows: data.length,
    preview: data.slice(0, 10),
    validEmails,
    invalidRows,
  };
}
