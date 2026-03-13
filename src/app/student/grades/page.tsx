import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getClassesForStudent } from "@/lib/services/classes";
import { getGradesForStudent } from "@/lib/services/student-grades";
import { StudentGradesClient } from "@/components/student/StudentGradesClient";

export default async function StudentGradesPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const classes = await getClassesForStudent(session.user.tenantId, student.id);
  const enrolledClassIds = classes.map(c => c.id);
  const grades = await getGradesForStudent(session.user.tenantId, student.id, enrolledClassIds);

  return <StudentGradesClient grades={grades} />;
}
