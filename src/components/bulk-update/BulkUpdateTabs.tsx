'use client';

import { useState } from 'react';
import { Zap, UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tab = 'assignment' | 'student';

interface BulkResult {
  matched: number;
  unmatched: number;
  unmatchedEmails: string[];
}

// Demo student emails for matching simulation
const DEMO_EMAILS = [
  'john@example.com',
  'jane@example.com',
  'robert@example.com',
  'emily@example.com',
  'marcus@example.com',
  'priya@example.com',
  'amir@example.com',
  'sara@example.com',
];

const ASSIGNMENTS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `Assignment ${String(i + 1).padStart(2, '0')}`,
}));

export function BulkUpdateTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('assignment');
  const [result, setResult] = useState<BulkResult | null>(null);
  const [committed, setCommitted] = useState(false);

  // Assignment update state
  const [assignmentNum, setAssignmentNum] = useState(8);
  const [emailsText, setEmailsText] = useState('');

  // Student upsert state
  const [studentData, setStudentData] = useState('');

  const parseEmails = (text: string) =>
    text
      .split('\n')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

  const handleProcessAssignment = () => {
    const emails = parseEmails(emailsText);
    if (emails.length === 0) return;

    const matched = emails.filter((e) => DEMO_EMAILS.includes(e));
    const unmatchedEmails = emails.filter((e) => !DEMO_EMAILS.includes(e));
    setResult({ matched: matched.length, unmatched: unmatchedEmails.length, unmatchedEmails });
    setCommitted(false);
  };

  const handleCommitAssignment = () => {
    // In production: call assignmentApi.bulkUpdate({ emails, assignmentNumber: assignmentNum })
    console.log('Committing bulk assignment update:', {
      assignmentNum,
      emails: parseEmails(emailsText),
    });
    setCommitted(true);
    setResult(null);
    setEmailsText('');
  };

  const handleProcessStudents = () => {
    const lines = studentData
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    // In production: parse CSV and call studentApi bulk upsert
    console.log('Processing student upsert for', lines.length, 'rows');
    setCommitted(true);
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
                ? `Successfully updated ${result?.matched ?? 0} students for Assignment ${String(assignmentNum).padStart(2, '0')}.`
                : 'Student records processed successfully.'}
            </span>
          </div>
        )}

        {activeTab === 'assignment' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Select Assignment</label>
              <select
                value={assignmentNum}
                onChange={(e) => setAssignmentNum(Number(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-full md:w-64"
              >
                {ASSIGNMENTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-semibold">Email List</label>
                <span className="text-xs text-muted-foreground">One email per line</span>
              </div>
              <textarea
                value={emailsText}
                onChange={(e) => {
                  setEmailsText(e.target.value);
                  setResult(null);
                  setCommitted(false);
                }}
                placeholder={'student1@example.com\nstudent2@example.com\nstudent3@example.com'}
                rows={8}
                className="border rounded-md px-3 py-2 text-sm font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {parseEmails(emailsText).length} email
                {parseEmails(emailsText).length !== 1 ? 's' : ''} entered
              </p>
            </div>

            {/* Result Preview */}
            {result && !committed && (
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <p className="text-sm font-semibold">Confirmation Preview</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      <strong>{result.matched}</strong> students matched
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span>
                      <strong>{result.unmatched}</strong> not found
                    </span>
                  </div>
                </div>
                {result.unmatchedEmails.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Unrecognized emails:
                    </p>
                    <ul className="text-xs font-mono text-red-600 space-y-0.5">
                      {result.unmatchedEmails.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCommitAssignment}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Confirm & Apply
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
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
                  disabled={parseEmails(emailsText).length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Process Assignment Bulk
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
