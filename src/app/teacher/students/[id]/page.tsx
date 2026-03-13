import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { StudentProfileClient } from "@/components/students/StudentProfileClient";
import { getStudentById } from "@/lib/services/students";
import { getClassesForStudent } from "@/lib/services/classes";
import { getInvoicesForStudent } from "@/lib/services/invoices";
import { getSessions } from "@/lib/services/attendance";
import { getExams } from "@/lib/services/exams";

export default async function TeacherStudentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;

  // Verify this student is in one of the teacher's classes
  const teacherClasses = await getClassesForTeacher(tenantId, teacher.id);
  const teacherStudentIds = new Set(teacherClasses.flatMap(c => c.studentIds));

  if (!teacherStudentIds.has(params.id)) notFound();

  const student = await getStudentById(tenantId, params.id);
  if (!student) notFound();

  const [classes, invoices, allSessions, allExams] = await Promise.all([
    getClassesForStudent(tenantId, student.id),
    getInvoicesForStudent(tenantId, student.id),
    getSessions(tenantId),
    getExams(tenantId),
  ]);

  // Scope sessions/exams to teacher's classes only
  const teacherClassIds = new Set(teacherClasses.map(c => c.id));
  const sessions = allSessions.filter(s => teacherClassIds.has(s.classId) && s.records.some(r => r.studentId === student.id));
  const exams = allExams.filter(e => teacherClassIds.has(e.classId) && e.grades.some(g => g.studentId === student.id));
  const scopedClasses = classes.filter(c => teacherClassIds.has(c.id));

  return (
    <StudentProfileClient
      student={student}
      classes={scopedClasses}
      invoices={invoices}
      sessions={sessions}
      exams={exams}
      basePath="/teacher"
    />
  );
}
