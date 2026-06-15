/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Upload, ChevronLeft, AlertCircle, CheckCircle, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { PAGE_ROUTES } from '@/lib/constants';
import type { StudentImportData } from '@/lib/file-parser';

interface ImportPreview {
  preview: boolean;
  headers: string[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  validRows: (StudentImportData & { rowIndex: number })[];
  invalidRows: { rowIndex: number; data: any; errors: string[] }[];
  duplicateEmails: { email: string; rowIndices: number[] }[];
  message: string;
}

export default function StudentImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(csv|xlsx)$/i)) {
      toast.error('File must be CSV or XLSX format');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setFile(selectedFile);

    // Upload for preview
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('previewOnly', 'true');

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to preview file');
      }

      const data = (await response.json()) as ImportPreview;
      setPreview(data);
      setStep('preview');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process file';
      toast.error(message);
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file || !preview) return;

    try {
      setStep('importing');
      setImporting(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('confirmed', 'true');

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result = await response.json();
      setStep('success');
      toast.success(`Successfully imported ${result.summary.created} students!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      toast.error(message);
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href={PAGE_ROUTES.STUDENTS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Students
        </Link>
      </div>

      {/* Header */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Student directory
        </p>
        <h1 className="page-title">Import Students</h1>
        <p className="page-description">
          Upload a CSV or Excel file to import multiple students at once.
        </p>
      </div>

      {step === 'upload' && (
        <div className="space-y-6">
          {/* File upload zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`surface border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/20 hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Drag and drop your file here</h3>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
              </div>
              <p className="text-xs text-muted-foreground">CSV or Excel (.xlsx) • Max 5MB</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Choose File
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </div>

          {/* Format guide */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <h4 className="font-semibold text-sm mb-2">Expected file format:</h4>
            <div className="text-xs space-y-1 text-muted-foreground font-mono">
              <div>name, email, phone, whatsapp, division, institute, ...</div>
              <div>John Doe, john@example.com, 01700000000, 01700000000, ...</div>
              <div>Jane Smith, jane@example.com, 01800000000, 01800000000, ...</div>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && preview && (
        <div className="space-y-6">
          {/* Import stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="text-xs text-muted-foreground">Total Rows</div>
              <div className="text-2xl font-bold mt-1">{preview.totalRows}</div>
            </div>
            <div className="rounded-xl border border-success-border bg-success-soft p-4">
              <div className="text-xs font-medium text-success-foreground">Valid</div>
              <div className="mt-1 text-2xl font-bold text-success-foreground">
                {preview.validCount}
              </div>
            </div>
            {preview.invalidCount > 0 && (
              <div className="rounded-xl border border-danger-border bg-danger-soft p-4">
                <div className="text-xs font-medium text-danger-foreground">Invalid</div>
                <div className="mt-1 text-2xl font-bold text-danger-foreground">
                  {preview.invalidCount}
                </div>
              </div>
            )}
            {preview.duplicateCount > 0 && (
              <div className="rounded-xl border border-warning-border bg-warning-soft p-4">
                <div className="text-xs font-medium text-warning-foreground">Duplicates</div>
                <div className="mt-1 text-2xl font-bold text-warning-foreground">
                  {preview.duplicateCount}
                </div>
              </div>
            )}
          </div>

          {/* Errors if present */}
          {preview.invalidRows.length > 0 && (
            <div className="rounded-xl border border-danger-border bg-danger-soft p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-danger-foreground" />
                <h4 className="text-sm font-semibold text-danger-foreground">
                  Invalid Rows ({preview.invalidRows.length})
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                {preview.invalidRows.slice(0, 5).map((row, idx) => (
                  <div key={idx} className="text-danger-foreground">
                    <div className="font-mono text-xs">
                      Row {row.rowIndex + 1}: {row.errors.join(', ')}
                    </div>
                  </div>
                ))}
                {preview.invalidRows.length > 5 && (
                  <div className="text-muted-foreground italic">
                    ... and {preview.invalidRows.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duplicates if present */}
          {preview.duplicateEmails.length > 0 && (
            <div className="rounded-xl border border-warning-border bg-warning-soft p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-warning-foreground" />
                <h4 className="text-sm font-semibold text-warning-foreground">
                  Duplicate Emails ({preview.duplicateEmails.length})
                </h4>
              </div>
              <div className="space-y-1 text-sm text-warning-foreground">
                {preview.duplicateEmails.map((dup, idx) => (
                  <div key={idx} className="font-mono text-xs">
                    {dup.email} (rows: {dup.rowIndices.map((i) => i + 1).join(', ')})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview table */}
          <div>
            <h4 className="font-semibold mb-3">Preview (first 10 rows)</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    {preview.headers.map((header) => (
                      <th key={header} className="px-4 py-2 text-left font-medium text-xs">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.validRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      {preview.headers.map((header) => (
                        <td key={header} className="px-4 py-2 text-xs">
                          {String(row[header as keyof typeof row] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setPreview(null);
              }}
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Choose Different File
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Students'}
            </button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto animate-spin">
              <FileUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Importing students...</h3>
              <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && preview && (
        <div className="space-y-6">
          {/* Success message */}
          <div className="flex items-center gap-3 rounded-xl border border-success-border bg-success-soft p-4">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-success-foreground" />
            <div>
              <h3 className="font-semibold text-success-foreground">Import completed!</h3>
              <p className="mt-1 text-sm text-success-foreground">
                Your students have been successfully imported.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-success-border bg-success-soft p-4">
              <div className="text-xs font-medium text-success-foreground">Imported</div>
              <div className="mt-2 text-3xl font-bold text-success-foreground">
                {preview.validCount}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="text-xs text-muted-foreground">Skipped</div>
              <div className="text-3xl font-bold mt-2">
                {preview.invalidCount + preview.duplicateCount}
              </div>
            </div>
            <div className="rounded-xl border border-info-border bg-info-soft p-4">
              <div className="text-xs font-medium text-info-foreground">Total Processed</div>
              <div className="mt-2 text-3xl font-bold text-info-foreground">
                {preview.totalRows}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <Link
              href={PAGE_ROUTES.STUDENTS}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
            >
              View Students
            </Link>
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setPreview(null);
              }}
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
