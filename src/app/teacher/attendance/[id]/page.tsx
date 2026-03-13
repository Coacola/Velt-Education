import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getSessionById } from "@/lib/services/attendance";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getStudents } from "@/lib/services/students";
import { TeacherSessionDetailClient } from "@/components/teacher/TeacherSessionDetailClient";

export default async function TeacherSessionDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const attSession = await getSessionById(tenantId, params.id);
  if (!attSession) notFound();

  // Verify this session belongs to one of teacher's classes
  const teacherClasses = await getClassesForTeacher(tenantId, teacher.id);
  const myClassIds = new Set(teacherClasses.map(c => c.id));
  if (!myClassIds.has(attSession.classId)) notFound();

  // If session has no records yet (newly created), populate with enrolled students
  if (attSession.records.length === 0) {
    const cls = teacherClasses.find(c => c.id === attSession.classId);
    if (cls && cls.studentIds.length > 0) {
      const allStudents = await getStudents(tenantId);
      const enrolledStudents = allStudents.filter(s => cls.studentIds.includes(s.id));
      attSession.records = enrolledStudents.map(s => ({
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        status: "absent" as const,
      }));
    }
  }

  return <TeacherSessionDetailClient session={attSession} />;
}
