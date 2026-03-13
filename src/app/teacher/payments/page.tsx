import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getStudents } from "@/lib/services/students";
import { getInvoices } from "@/lib/services/invoices";
import { TeacherPaymentsClient } from "@/components/teacher/TeacherPaymentsClient";

export default async function TeacherPaymentsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, allStudents, allInvoices] = await Promise.all([
    getClassesForTeacher(tenantId, teacher.id),
    getStudents(tenantId),
    getInvoices(tenantId),
  ]);

  // Only show invoices for students in teacher's classes
  const myStudentIds = new Set(classes.flatMap(c => c.studentIds));
  const myInvoices = allInvoices.filter(i => myStudentIds.has(i.studentId));
  const myStudents = allStudents.filter(s => myStudentIds.has(s.id));

  return <TeacherPaymentsClient invoices={myInvoices} students={myStudents} />;
}
