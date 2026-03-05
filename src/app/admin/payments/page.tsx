import { mockInvoices, mockStudents } from "@/lib/mock";
import { PaymentsClient } from "@/components/payments/PaymentsClient";

export default function PaymentsPage() {
  return <PaymentsClient invoices={mockInvoices} students={mockStudents} />;
}
