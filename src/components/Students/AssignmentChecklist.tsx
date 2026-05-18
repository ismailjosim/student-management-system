'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, Circle, Clock, Loader2, Trash2 } from 'lucide-react';
import type { Assignment } from '@/interfaces/assignment.interface';
import { cn } from '@/lib/cn';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/Modal';
import { assignmentApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface AssignmentChecklistProps {
  assignments: Assignment[];
  studentId: string;
  onUpdate?: () => void;
}

const TOTAL = 10;

export function AssignmentChecklist({
  assignments,
  studentId: _studentId,
  onUpdate,
}: AssignmentChecklistProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  // Build a map for quick lookup
  const assignmentMap = new Map(assignments.map((a) => [a.assignmentNumber, a]));

  const completed = assignments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'SUBMITTED'
  ).length;
  const pct = Math.round((completed / TOTAL) * 100);

  const handleAssignmentClick = (assignment: Assignment | undefined, num: number) => {
    const a = assignment || {
      assignmentNumber: num,
      status: 'NOT_DEFINED' as const,
      studentId: _studentId,
    };
    setSelectedAssignment(a as Assignment);
    setNewStatus(a?.status || 'NOT_DEFINED');
    setIsModalOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedAssignment) return;

    try {
      setIsLoading(true);
      let response;

      const existingAssignment = assignments.some(
        (assignment) => assignment.assignmentNumber === selectedAssignment.assignmentNumber
      );

      if (newStatus === 'NOT_DEFINED') {
        if (existingAssignment) {
          response = await assignmentApi.delete(_studentId, selectedAssignment.assignmentNumber);
        } else {
          setIsModalOpen(false);
          return;
        }
      } else {
        const payload = {
          assignmentNumber: selectedAssignment.assignmentNumber,
          status: newStatus,
          date: new Date(),
        };

        if (existingAssignment) {
          response = await assignmentApi.update(_studentId, payload);
        } else {
          response = await assignmentApi.create(_studentId, payload);
        }
      }

      if (response?.error) {
        throw new Error(response.error);
      }

      toast.success(`Assignment updated to ${newStatus}`);
      setIsModalOpen(false);
      onUpdate?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update assignment';
      toast.error(message);
      console.error('Assignment update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = useCallback(async () => {
    if (!selectedAssignment) return;

    try {
      setIsLoading(true);
      const response = await assignmentApi.delete(_studentId, selectedAssignment.assignmentNumber);

      if (response?.error) {
        throw new Error(response.error);
      }

      toast.success('Assignment removed successfully');
      setIsModalOpen(false);
      onUpdate?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove assignment';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [_studentId, selectedAssignment, onUpdate]);

  return (
    <>
      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Course Progress</h3>
            <span className="text-sm font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {completed} of {TOTAL} assignments done
          </p>
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: TOTAL }, (_, i) => {
            const num = i + 1;
            const a = assignmentMap.get(num);
            const isDone = a?.status === 'COMPLETED' || a?.status === 'SUBMITTED';
            const isPending = a?.status === 'PENDING';

            return (
              <div
                key={num}
                onClick={() => handleAssignmentClick(a, num)}
                className={cn(
                  'flex items-center justify-between px-5 py-3 text-sm transition-colors cursor-pointer',
                  isDone ? 'bg-success-soft/70 hover:bg-success-soft' : 'hover:bg-muted/30'
                )}
              >
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : isPending ? (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn('font-medium', isDone && 'text-success-foreground')}>
                    Assignment {String(num).padStart(2, '0')}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded',
                    isDone
                      ? 'status-success'
                      : isPending
                        ? 'status-warning'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isDone
                    ? a?.status === 'SUBMITTED'
                      ? 'Submitted'
                      : 'Done'
                    : isPending
                      ? 'Pending'
                      : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignment Update Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader
          title={`Assignment ${String(selectedAssignment?.assignmentNumber).padStart(2, '0')}`}
          onClose={() => setIsModalOpen(false)}
        />
        <ModalBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Current Status</p>
              <p className="text-sm text-muted-foreground">
                {selectedAssignment?.status === 'COMPLETED'
                  ? 'Completed'
                  : selectedAssignment?.status === 'SUBMITTED'
                    ? 'Submitted'
                    : selectedAssignment?.status === 'PENDING'
                      ? 'Pending'
                      : 'Not defined'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Update Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
              >
                <option value="NOT_DEFINED">Not Defined</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {selectedAssignment?.date && (
              <div>
                <p className="text-sm font-medium text-foreground">Updated Date</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedAssignment.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setIsModalOpen(false)}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {selectedAssignment &&
            assignments.some(
              (assignment) => assignment.assignmentNumber === selectedAssignment.assignmentNumber
            ) && (
              <button
                onClick={handleRemove}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}

          <button
            onClick={handleStatusChange}
            disabled={
              isLoading || (selectedAssignment ? newStatus === selectedAssignment.status : false)
            }
            className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
