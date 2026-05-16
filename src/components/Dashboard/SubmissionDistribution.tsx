/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type { StudentWithRelations } from '@/types';
import { getLastAssignmentNumber } from '@/lib/ui-helpers';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SubmissionDistributionProps {
  students: StudentWithRelations[];
}

// Color palette for different assignment completion levels
const COLORS = [
  '#3b82f6',
  '#0ea5e9',
  '#06b6d4',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#ef4444',
  '#dc2626',
  '#991b1b',
];

export function SubmissionDistribution({ students }: SubmissionDistributionProps) {
  // Count how many students completed each assignment (1–10)
  const distribution = Array.from(
    { length: 10 },
    (_, i) => students.filter((s) => getLastAssignmentNumber(s.lastCompletedAssignment) > i).length
  );

  const total = students.length || 1;

  // Prepare data for Recharts
  const chartData = distribution.map((count, i) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      name: `A-${String(i + 1).padStart(2, '0')}`,
      students: count,
      percentage: pct,
    };
  });

  return (
    <div className="bg-background rounded-xl border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Assignment Submission Overview
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {total} students total • Showing completion by assignment
        </p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 50, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground) / 0.7)"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground) / 0.7)"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              label={{
                value: 'Students',
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'hsl(var(--foreground))' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '2px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={
                ((value: number | string, name: string) => {
                  if (name === 'students') {
                    return [`${value} students`, 'Completed'];
                  }
                  return [value, name];
                }) as any
              }
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="students" radius={[8, 8, 0, 0]} name="Completed">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground font-medium mb-1">Total Students</p>
            <p className="text-xl font-bold">{total}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-medium mb-1">
              Completed All (A-10)
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {chartData[9]?.students || 0}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <p className="text-amber-700 dark:text-amber-300 font-medium mb-1">Latest Completed</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              A-{String(Math.max(...distribution.map((_, i) => i + 1))).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground font-medium mb-1">Average Progress</p>
            <p className="text-xl font-bold">
              {Math.round(distribution.reduce((a, b) => a + b, 0) / 10)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
