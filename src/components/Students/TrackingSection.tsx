'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, TrendingDown, Zap, Flag } from 'lucide-react';
import type { StudentWithRelations } from '@/types';

import type { StudentStatus } from '@/models/Student';
import { studentApi } from '@/lib/api-client';
import { getCurrentActiveAssignment } from '@/lib/date-utils';
import toast from 'react-hot-toast';
import { StudentAssignment } from '@/interfaces/assignment.interface';

interface TrackingSectionProps {
  student: StudentWithRelations;
  assignments: StudentAssignment[];
  onUpdate: () => void;
}

const STATUS_OPTIONS: {
  value: StudentStatus;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: 'On Track',
    label: 'On Track',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle2,
  },
  {
    value: 'Behind',
    label: 'Behind',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: TrendingDown,
  },
  {
    value: 'At Risk',
    label: 'At Risk',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: AlertCircle,
  },
  {
    value: 'Dropped',
    label: 'Dropped',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: Flag,
  },
  {
    value: 'Completed',
    label: 'Completed',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: CheckCircle2,
  },
];

export function TrackingSection({ student, assignments, onUpdate }: TrackingSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoDetectMode, setAutoDetectMode] = useState(false);

  // Calculate auto-detected status
  const detectedStatus = useMemo(() => {
    if (!assignments || assignments.length === 0) {
      return student.currentStatus || 'On Track';
    }

    // Count incomplete assignments
    const incompleteCount = assignments.filter(
      (a) => a.status !== 'COMPLETED' && a.status !== 'SUBMITTED'
    ).length;

    // If more than 2 assignments not completed → At Risk
    if (incompleteCount > 2) {
      return 'At Risk';
    }

    // If current assignment not completed → Behind
    // The current assignment is the next one after lastCompletedAssignment
    const lastCompleted = student.lastCompletedAssignment;
    if (lastCompleted && lastCompleted !== 'None') {
      const lastCompletedNum = parseInt(lastCompleted.split('-')[1]);
      const currentAssignmentNum = lastCompletedNum + 1;

      // Check if current assignment exists and is not completed
      const currentAssignment = assignments.find(
        (a) => a.assignmentNumber === currentAssignmentNum
      );

      if (
        currentAssignment &&
        currentAssignment.status !== 'COMPLETED' &&
        currentAssignment.status !== 'SUBMITTED'
      ) {
        return 'Behind';
      }
    }

    return 'On Track';
  }, [assignments, student.lastCompletedAssignment, student.currentStatus]);

  const handleStatusUpdate = async (newStatus: StudentStatus) => {
    try {
      setIsUpdating(true);
      const response = await studentApi.update(student._id!, {
        currentStatus: newStatus,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success(`Status updated to ${newStatus}`);
      onUpdate();
      setAutoDetectMode(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = student.currentStatus || 'On Track';
  const statusOption = STATUS_OPTIONS.find((opt) => opt.value === currentStatus);
  const StatusIcon = statusOption?.icon || CheckCircle2;

  const lastCompletedNum = student.lastCompletedAssignment
    ? parseInt(student.lastCompletedAssignment.split('-')[1] || '0')
    : 0;
  const currentAssignmentNum = lastCompletedNum + 1;

  const completedCount = assignments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'SUBMITTED'
  ).length;

  // Use the current active assignment (based on weeks) as the total for progress calculation
  const currentActiveAssignment = getCurrentActiveAssignment();
  const totalAssignments = currentActiveAssignment;

  return (
    <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-linear-to-r from-primary/5 to-primary/10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Student Tracking
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Current Status
          </h3>
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${statusOption?.color || 'bg-gray-100 text-gray-700 border-gray-300'}`}
          >
            <StatusIcon className="w-5 h-5" />
            <span className="font-semibold">{currentStatus}</span>
            {autoDetectMode && (
              <span className="ml-auto text-xs font-medium opacity-70">(Manual)</span>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Progress Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Assignments Completed</p>
              <p className="text-2xl font-bold">
                {completedCount}/{totalAssignments}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((completedCount / totalAssignments) * 100)}%
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Current Assignment</p>
              <p className="text-2xl font-bold">
                A-{String(currentAssignmentNum).padStart(2, '0')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Target to complete</p>
            </div>
          </div>
        </div>

        {/* Auto-Detection Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-2">Auto-Detection Rules:</p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>
              More than 2 uncompleted assignments → <strong>At Risk</strong>
            </li>
            <li>
              Current assignment (A-{String(currentAssignmentNum).padStart(2, '0')}) not completed →{' '}
              <strong>Behind</strong>
            </li>
            <li>
              All assignments on track → <strong>On Track</strong>
            </li>
          </ul>
        </div>

        {/* Recommended Status */}
        {detectedStatus !== currentStatus && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 mb-3">
              Recommended Status: <strong>{detectedStatus}</strong>
            </p>
            <button
              onClick={() => handleStatusUpdate(detectedStatus as StudentStatus)}
              disabled={isUpdating}
              className="w-full px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : `Apply Recommended Status`}
            </button>
          </div>
        )}

        {/* Manual Status Update */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Update Status Manually
            </h3>
            {autoDetectMode && (
              <button
                onClick={() => setAutoDetectMode(false)}
                className="text-xs text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setAutoDetectMode(opt.value !== detectedStatus);
                  handleStatusUpdate(opt.value);
                }}
                disabled={isUpdating}
                className={`p-3 rounded-lg border font-medium text-sm transition-all ${
                  currentStatus === opt.value
                    ? `${opt.color} border-current`
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border-transparent'
                } disabled:opacity-50`}
              >
                <div className="flex flex-col items-center gap-1">
                  <opt.icon className="w-4 h-4" />
                  <span className="text-xs">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Status Summary */}
        <div className="space-y-3 border-t pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Assignment Status
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => {
              const assignmentNum = i + 1;
              const assignment = assignments.find((a) => a.assignmentNumber === assignmentNum);
              const isCompleted =
                assignment?.status === 'COMPLETED' || assignment?.status === 'SUBMITTED';
              const isCurrent = assignmentNum === currentAssignmentNum;

              return (
                <div
                  key={assignmentNum}
                  className={`flex items-center justify-center h-10 rounded border font-semibold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : isCurrent
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}
                  title={
                    isCompleted ? 'Completed' : isCurrent ? 'Current Assignment' : 'Not Started'
                  }
                >
                  A-{String(assignmentNum).padStart(2, '0')}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded mr-2" />
            Completed &nbsp;
            <span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2" />
            Current &nbsp;
            <span className="inline-block w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2" />
            Not Started
          </p>
        </div>
      </div>
    </div>
  );
}
