import { Student } from '@/interfaces/student.interface';
import StudentPageHeader from './StudentPageHeader';
import { StudentProfileCard } from '@/components/Students/StudentProfileCard';
import { AssignmentChecklist } from '@/components/Students/AssignmentChecklist';

const SingleStudentWrapper = ({ student }: { student: Student }) => {
  const assignments = student.assignments || [];
  const callLogs = student.callLogs || [];
  const followUps = student.followUps || [];
  return (
    <section className="space-y-4 my-6 animate-in fade-in duration-300">
      <StudentPageHeader student={student} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* <StudentProfileCard student={student} onUpdate={() => fetchStudent(studentId)} /> */}
          {/* <AssignmentChecklist
            assignments={assignments}
            studentId={studentId}
            onUpdate={() => fetchStudent(studentId)}
          /> */}
        </div>
      </div>
    </section>
  );
};

export default SingleStudentWrapper;
