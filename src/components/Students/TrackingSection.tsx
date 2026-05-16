'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, TrendingDown, Zap, Flag, Sparkles, X } from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import type { Assignment } from '@/interfaces/assignment.interface';
import type { StudentStatus } from '@/models/Student';
import { studentApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface TrackingSectionProps {
  student: StudentWithRelations;
  assignments: Assignment[];
  onUpdate: () => void;
}

interface AnalysisResult {
  totalStudents: number;
  completedAssignment: number;
  completedCount: number;
  notCompletedCount: number;
  updatedCount: number;
  students: Array<{
    id: string;
    name: string;
    completed: boolean;
    previousStatus: string;
    newStatus: string;
  }>;
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
  const [selectedAssignment, setSelectedAssignment] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

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

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const response = await fetch(`/api/students/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentNumber: selectedAssignment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to analyze');
      }

      const data = await response.json();
      setAnalysisResult(data.data);
      setShowAnalysisModal(true);
      toast.success('Analysis completed!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze students';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
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
  const totalAssignments = assignments.length || 10;

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

        {/* Analyze Students Section */}
        <div className="space-y-4 border-t pt-6 bg-linear-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Analyze All Students
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Set the current assignment and analyze all students to automatically update their
              statuses based on completion.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Select Current Assignment
              </label>
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(parseInt(e.target.value))}
                disabled={isAnalyzing}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    A-{String(num).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze All Students'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results Modal */}
      {showAnalysisModal && analysisResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 border-b bg-linear-to-r from-purple-50 to-blue-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Analysis Results
              </h2>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-blue-700">{analysisResult.totalStudents}</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Assignment Analyzed</p>
                  <p className="text-3xl font-bold text-purple-700">
                    A-{String(analysisResult.completedAssignment).padStart(2, '0')}
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-700">
                    {analysisResult.completedCount}{' '}
                    <span className="text-sm text-muted-foreground">
                      (
                      {Math.round(
                        (analysisResult.completedCount / analysisResult.totalStudents) * 100
                      )}
                      %)
                    </span>
                  </p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Not Completed</p>
                  <p className="text-3xl font-bold text-orange-700">
                    {analysisResult.notCompletedCount}{' '}
                    <span className="text-sm text-muted-foreground">
                      (
                      {Math.round(
                        (analysisResult.notCompletedCount / analysisResult.totalStudents) * 100
                      )}
                      %)
                    </span>
                  </p>
                </div>
              </div>

              {/* Updated Students */}
              {analysisResult.updatedCount > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-semibold text-amber-900">
                    ✓ {analysisResult.updatedCount} student
                    {analysisResult.updatedCount !== 1 ? 's' : ''} status updated
                  </p>
                </div>
              )}

              {/* Detailed List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Student Details
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysisResult.students.map((student, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        student.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.completed ? (
                              <span className="text-green-700 font-medium">✓ Completed</span>
                            ) : (
                              <span className="text-orange-700 font-medium">✗ Not Completed</span>
                            )}
                          </p>
                        </div>
                        {student.previousStatus !== student.newStatus && (
                          <div className="text-xs">
                            <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded mr-2 font-medium">
                              {student.previousStatus}
                            </span>
                            <span className="inline-block px-2 py-1 bg-purple-200 text-purple-700 rounded font-medium">
                              {student.newStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t bg-muted/20 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAnalysisModal(false);
                  onUpdate();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
