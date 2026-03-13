import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { StudentProfileClient } from "@/components/students/StudentProfileClient";
import { getStudentById } from "@/lib/services/students";
import { getClassesForStudent } from "@/lib/services/classes";
import { getInvoicesForStudent } from "@/lib/services/invoices";
import { getSessions } from "@/lib/services/attendance";
import { getExams } from "@/lib/services/exams";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const student = await getStudentById(tenantId, params.id);
  if (!student) notFound();

  const [classes, invoices, allSessions, allExams] = await Promise.all([
    getClassesForStudent(tenantId, student.id),
    getInvoicesForStudent(tenantId, student.id),
    getSessions(tenantId),
    getExams(tenantId),
  ]);

  const sessions = allSessions.filter(s => s.records.some(r => r.studentId === student.id));
  const exams = allExams.filter(e => e.grades.some(g => g.studentId === student.id));

  return (
    <StudentProfileClient
      student={student}
      classes={classes}
      invoices={invoices}
      sessions={sessions}
      exams={exams}
    />
  );
}
