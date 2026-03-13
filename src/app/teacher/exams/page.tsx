import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getExams } from "@/lib/services/exams";
import { getStudents } from "@/lib/services/students";
import { TeacherExamsClient } from "@/components/teacher/TeacherExamsClient";

export default async function TeacherExamsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, allExams, allStudents] = await Promise.all([
    getClassesForTeacher(tenantId, teacher.id),
    getExams(tenantId),
    getStudents(tenantId),
  ]);

  const myClassIds = new Set(classes.map(c => c.id));
  const myExams = allExams.filter(e => myClassIds.has(e.classId));

  // Only include students enrolled in teacher's classes
  const myStudentIds = new Set(classes.flatMap(c => c.studentIds));
  const myStudents = allStudents.filter(s => myStudentIds.has(s.id));

  return <TeacherExamsClient exams={myExams} classes={classes} students={myStudents} />;
}
