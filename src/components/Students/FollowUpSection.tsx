'use client';

import { useState } from 'react';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { FollowUp } from '@/interfaces/followUp.interface';

interface FollowUpSectionProps {
  followUps: FollowUp[];
  studentId: string;
}

export function FollowUpSection({ followUps, studentId: _studentId }: FollowUpSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', note: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: followUpApi.create({ ...form, studentId })
    console.log('Submit follow-up:', form);
    setShowForm(false);
    setForm({ date: '', note: '' });
  };

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold">Follow-Up Schedule</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-medium hover:bg-muted transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule
        </button>
      </div>

      {showForm && (
        <div className="px-6 py-5 border-b bg-muted/10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Follow-Up Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-medium">Note</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="What to check on follow-up..."
                required
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-border">
        {followUps.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground italic text-sm">
            No follow-ups scheduled.
          </div>
        ) : (
          followUps.map((f) => (
            <div
              key={f._id}
              className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarClock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.note}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(f.date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
                title="Delete follow-up"
                onClick={() => {
                  // In production: followUpApi.delete(f._id!)
                  console.log('Delete follow-up:', f._id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
