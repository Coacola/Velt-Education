import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getStudents } from "@/lib/services/students";
import { TeacherStudentsClient } from "@/components/teacher/TeacherStudentsClient";

export default async function TeacherStudentsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, allStudents] = await Promise.all([
    getClassesForTeacher(tenantId, teacher.id),
    getStudents(tenantId),
  ]);

  const myStudentIds = new Set(classes.flatMap(c => c.studentIds));
  const myStudents = allStudents.filter(s => myStudentIds.has(s.id));

  return <TeacherStudentsClient students={myStudents} classes={classes} />;
}
