import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getInvoicesForStudent } from "@/lib/services/invoices";
import { StudentPaymentsClient } from "@/components/student/StudentPaymentsClient";

export default async function StudentPaymentsPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const invoices = await getInvoicesForStudent(session.user.tenantId, student.id);

  return <StudentPaymentsClient invoices={invoices} />;
}
