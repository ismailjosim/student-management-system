import SingleStudentWrapper from '@/components/modules/SingleStudent/SingleStudentWrapper';
import { getSingleStudent } from '@/services/student.service';
import StudentNotFound from '@/components/modules/SingleStudent/StudentNotFound';

interface SingleStudentPageProps {
  params: Promise<{ id: string }>;
}

const SingleStudentPage = async ({ params }: SingleStudentPageProps) => {
  const { id } = await params;
  const singleStudentRes = await getSingleStudent(id);
  const student = singleStudentRes?.data;

  if (!singleStudentRes.success || !student) {
    return <StudentNotFound />;
  }

  return <SingleStudentWrapper student={student} />;
};

export default SingleStudentPage;
