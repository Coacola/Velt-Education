import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getClassesForStudent } from "@/lib/services/classes";
import { getTeachers } from "@/lib/services/teachers";
import { StudentClassesClient } from "@/components/student/StudentClassesClient";

export default async function StudentClassesPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const [classes, teachers] = await Promise.all([
    getClassesForStudent(session.user.tenantId, student.id),
    getTeachers(session.user.tenantId),
  ]);

  // Build teacher name map
  const teacherMap = Object.fromEntries(
    teachers.map(t => [t.id, `${t.firstName} ${t.lastName}`])
  );

  return <StudentClassesClient classes={classes} teacherMap={teacherMap} />;
}
