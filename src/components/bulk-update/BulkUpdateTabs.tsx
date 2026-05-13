'use client';

import { useState, useRef } from 'react';
import { Zap, UserPlus, CheckCircle2, XCircle, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/cn';
import { processAssignmentImportFile } from '@/lib/file-parser';

type Tab = 'assignment' | 'student';

interface BulkResult {
  matched: number;
  unmatched: number;
  unmatchedEmails: string[];
}

const ASSIGNMENTS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `A-${String(i + 1).padStart(2, '0')}`,
}));

export function BulkUpdateTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('assignment');
  const [result, setResult] = useState<BulkResult | null>(null);
  const [committed, setCommitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Assignment update state
  const [assignmentNum, setAssignmentNum] = useState(1);
  const [emailsText, setEmailsText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Student upsert state
  const [studentData, setStudentData] = useState('');

  const parseEmails = (text: string) =>
    text
      .split('\n')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

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
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(csv|xlsx)$/i)) {
      toast.error('File must be CSV or XLSX format');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setFile(selectedFile);
    setEmailsText('');
  };

  const handleProcessAssignment = async () => {
    try {
      setProcessing(true);
      setError(null);

      let emails: string[] = [];

      // Process file or text input
      if (file) {
        const fileData = await processAssignmentImportFile(file);
        emails = fileData.validEmails;
        if (fileData.invalidRows.length > 0) {
          setError(`${fileData.invalidRows.length} invalid rows found`);
        }
      } else {
        emails = parseEmails(emailsText);
        if (emails.length === 0) {
          setError('Please enter at least one email');
          return;
        }
      }

      // Mock matching - in production would call API
      const matchedCount = Math.floor(emails.length * 0.8);
      const unmatchedEmails = emails.slice(matchedCount);

      setResult({
        matched: matchedCount,
        unmatched: unmatchedEmails.length,
        unmatchedEmails,
      });
      setCommitted(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process file';
      setError(message);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCommitAssignment = async () => {
    try {
      setProcessing(true);
      const emails = file
        ? await processAssignmentImportFile(file).then((f) => f.validEmails)
        : parseEmails(emailsText);

      // In production: Call API
      // const response = await fetch('/api/assignments/bulk-submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ emails, assignmentNumber: assignmentNum })
      // })

      toast.success(
        `Successfully updated ${result?.matched ?? 0} students for ${ASSIGNMENTS[assignmentNum - 1].label}`
      );
      setCommitted(true);
      setResult(null);
      setEmailsText('');
      setFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to commit update';
      setError(message);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessStudents = async () => {
    try {
      setProcessing(true);
      setError(null);

      const lines = studentData
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        setError('Please enter at least one student record');
        return;
      }

      // In production: Parse CSV and call studentApi bulk upsert
      toast.success(`Processing ${lines.length} student records`);
      setCommitted(true);
      setStudentData('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process students';
      setError(message);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        {(
          [
            { key: 'assignment', label: 'Assignment Update', icon: Zap },
            { key: 'student', label: 'Student Upsert', icon: UserPlus },
          ] as { key: Tab; label: string; icon: React.ElementType }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setResult(null);
              setCommitted(false);
            }}
            className={cn(
              'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === key
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">
        {committed && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">
              {activeTab === 'assignment'
                ? `Successfully updated ${result?.matched ?? 0} students for ${ASSIGNMENTS[assignmentNum - 1].label}.`
                : 'Student records processed successfully.'}
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {activeTab === 'assignment' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Select Assignment</label>
              <select
                value={assignmentNum}
                onChange={(e) => setAssignmentNum(Number(e.target.value))}
                disabled={processing}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-full md:w-64 disabled:opacity-50"
              >
                {ASSIGNMENTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/20 hover:border-primary/50'
              } ${file ? 'bg-green-50 border-green-300' : ''}`}
            >
              {file ? (
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-600">{file.name}</p>
                    <p className="text-xs text-green-500">
                      {parseEmails(emailsText).length} emails ready
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Drag file here or click to select</p>
                    <p className="text-xs text-muted-foreground">CSV or Excel</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Or paste emails below (one per line)
              </span>
              {file && (
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear file
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-semibold">Email List</label>
                <span className="text-xs text-muted-foreground">
                  {file
                    ? `${parseEmails(emailsText).length} emails from file`
                    : 'One email per line'}
                </span>
              </div>
              <textarea
                value={emailsText}
                onChange={(e) => {
                  setEmailsText(e.target.value);
                  setResult(null);
                  setCommitted(false);
                }}
                disabled={file !== null || processing}
                placeholder={
                  file
                    ? 'Emails from file shown above'
                    : 'student1@example.com\nstudent2@example.com\nstudent3@example.com'
                }
                rows={8}
                className="border rounded-md px-3 py-2 text-sm font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-50"
              />
            </div>

            {/* Result Preview */}
            {result && !committed && (
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <p className="text-sm font-semibold">Preview</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      <strong>{result.matched}</strong> matched
                    </span>
                  </div>
                  {result.unmatched > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span>
                        <strong>{result.unmatched}</strong> not found
                      </span>
                    </div>
                  )}
                </div>
                {result.unmatchedEmails.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Unmatched ({result.unmatchedEmails.length}):
                    </p>
                    <div className="text-xs font-mono text-red-600 space-y-0.5 max-h-40 overflow-y-auto">
                      {result.unmatchedEmails.map((e) => (
                        <div key={e}>{e}</div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCommitAssignment}
                    disabled={processing}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {processing ? 'Updating...' : 'Confirm & Apply'}
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    disabled={processing}
                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!result && !committed && (
              <div className="flex justify-end">
                <button
                  onClick={handleProcessAssignment}
                  disabled={(!file && parseEmails(emailsText).length === 0) || processing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  {processing ? 'Processing...' : 'Process'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'student' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <span className="font-bold shrink-0">Format:</span>
              <code>Name, Email, Phone, Division, Status (one per line)</code>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-semibold">Student Records</label>
                <span className="text-xs text-muted-foreground font-mono italic">CSV Format</span>
              </div>
              <textarea
                value={studentData}
                onChange={(e) => {
                  setStudentData(e.target.value);
                  setCommitted(false);
                }}
                placeholder={
                  'John Doe, john@example.com, +880 1712 000111, Dhaka, On Track\nJane Smith, jane@example.com, +880 1812 000222, Chittagong, Behind'
                }
                rows={8}
                className="border rounded-md px-3 py-2 text-sm font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {studentData.split('\n').filter((l) => l.trim()).length} record
                {studentData.split('\n').filter((l) => l.trim()).length !== 1 ? 's' : ''} entered
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleProcessStudents}
                disabled={!studentData.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Process Student Upsert
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
