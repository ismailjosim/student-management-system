import { TrackingSection } from '@/components/Students/TrackingSection';
import type { Assignment } from '@/interfaces/assignment.interface';
import type { StudentWithRelations } from '@/types';

interface StudentTrackingPanelProps {
  assignments: Assignment[];
  onUpdate: () => void;
  student: StudentWithRelations;
}

const StudentTrackingPanel = ({ assignments, onUpdate, student }: StudentTrackingPanelProps) => {
  return <TrackingSection assignments={assignments} onUpdate={onUpdate} student={student} />;
};

export default StudentTrackingPanel;
