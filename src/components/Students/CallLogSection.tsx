'use client';

import { useState } from 'react';
import { Phone, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import type { CallLog } from '@/interfaces/callLog.interface';
import { getCallLogStatusLabel, getCallLogStatusClass } from '@/lib/ui-helpers';

interface CallLogSectionProps {
  callLogs: CallLog[];
  studentId: string;
}

const CALL_STATUSES: CallLog['status'][] = [
  'RECEIVED',
  'NOT_RECEIVED',
  'PHONE_OFF',
  'SWITCHED_OFF',
  'FOREIGN_NUMBER',
];

export function CallLogSection({ callLogs, studentId: _studentId }: CallLogSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const [form, setForm] = useState({
    status: 'RECEIVED' as CallLog['status'],
    issues: '',
    promised: '',
    notes: '',
    calledBy: '',
  });

  const latestFollowUp = callLogs[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: callLogApi.create({ ...form, studentId, date: new Date() })
    console.log('Submit call log:', form);
    setShowForm(false);
    setForm({ status: 'RECEIVED', issues: '', promised: '', notes: '', calledBy: '' });
  };

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold">Call Log & Outreach</h3>
        </div>
        <div className="flex items-center gap-3">
          {latestFollowUp && (
            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
              Last: {format(new Date(latestFollowUp.date), 'MMM d, yyyy')}
            </span>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Log
          </button>
        </div>
      </div>

      {/* Add Log Form */}
      {showForm && (
        <div className="px-6 py-5 border-b bg-muted/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            New Call Entry
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Call Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CallLog['status'] })}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {getCallLogStatusLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Called By</label>
              <input
                type="text"
                value={form.calledBy}
                onChange={(e) => setForm({ ...form, calledBy: e.target.value })}
                placeholder="Mentor name"
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Issue Mentioned</label>
              <input
                type="text"
                value={form.issues}
                onChange={(e) => setForm({ ...form, issues: e.target.value })}
                placeholder="e.g. Too busy at work"
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Promise Made</label>
              <input
                type="text"
                value={form.promised}
                onChange={(e) => setForm({ ...form, promised: e.target.value })}
                placeholder="e.g. Finish A6 by Saturday"
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional call notes..."
                rows={3}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Save Log
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Call Log History */}
      <div className="divide-y divide-border">
        {callLogs.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground italic text-sm">
            No call history recorded yet.
          </div>
        ) : (
          callLogs.map((log) => {
            const logId = log._id!;
            const isExpanded = expandedLog === logId;
            return (
              <div key={logId} className="px-6 py-4">
                <button
                  className="w-full flex items-center justify-between gap-3 text-left"
                  onClick={() => setExpandedLog(isExpanded ? null : logId)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded ${getCallLogStatusClass(log.status)}`}
                    >
                      {getCallLogStatusLabel(log.status)}
                    </span>
                    <span className="text-sm font-medium">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </span>
                    {log.calledBy && (
                      <span className="text-xs text-muted-foreground">by {log.calledBy}</span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {log.issues && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Issue</p>
                        <p>{log.issues}</p>
                      </div>
                    )}
                    {log.promised && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Promise</p>
                        <p>{log.promised}</p>
                      </div>
                    )}
                    {log.notes && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground font-medium">Notes</p>
                        <p className="text-muted-foreground">{log.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
