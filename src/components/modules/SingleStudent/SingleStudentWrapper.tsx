import StudentPageHeader from './StudentPageHeader';
import SingleStudentDetails from './SingleStudentDetails';
import type { StudentWithRelations } from '@/types';

interface SingleStudentWrapperProps {
  student: StudentWithRelations;
}

const SingleStudentWrapper = ({ student }: SingleStudentWrapperProps) => {
  return (
    <section className="my-6 space-y-6 animate-in fade-in duration-300">
      <StudentPageHeader student={student} />
      <SingleStudentDetails student={student} />
    </section>
  );
};

export default SingleStudentWrapper;
