import { auth } from "@/lib/auth/config";
import { getInvoices } from "@/lib/services/invoices";
import { getStudents } from "@/lib/services/students";
import { PaymentsClient } from "@/components/payments/PaymentsClient";
import { redirect } from "next/navigation";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const [invoices, students] = await Promise.all([
    getInvoices(tenantId),
    getStudents(tenantId),
  ]);

  return <PaymentsClient invoices={invoices} students={students} />;
}
