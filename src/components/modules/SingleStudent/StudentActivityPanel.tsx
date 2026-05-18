import { CallLogSection } from '@/components/Students/CallLogSection';
import { FollowUpSection } from '@/components/Students/FollowUpSection';
import type { CallLog } from '@/interfaces/callLog.interface';
import type { FollowUp } from '@/interfaces/followUp.interface';

interface StudentActivityPanelProps {
  callLogs: CallLog[];
  followUps: FollowUp[];
  studentId: string;
}

const StudentActivityPanel = ({ callLogs, followUps, studentId }: StudentActivityPanelProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="md:col-span-1">
        <CallLogSection callLogs={callLogs} studentId={studentId} />
      </div>

      <div className="md:col-span-1">
        <FollowUpSection followUps={followUps} studentId={studentId} />
      </div>

      {/* <div className="md:col-span-1">
        <StudentOutreachCard />
      </div> */}
    </div>
  );
};

export default StudentActivityPanel;
