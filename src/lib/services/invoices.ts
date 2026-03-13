import { db } from "@/lib/db";
import { invoices, invoiceItems, payments, students } from "@/lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import type { Invoice, PaymentLineItem } from "@/lib/types/payment";
import type { PaymentStatus } from "@/lib/types/student";

export async function getInvoices(tenantId: string): Promise<Invoice[]> {
  const rows = await db
    .select()
    .from(invoices)
    .where(eq(invoices.tenantId, tenantId))
    .orderBy(invoices.issuedDate);

  if (rows.length === 0) return [];

  // Fetch student names
  const studentRows = await db
    .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
    .from(students)
    .where(eq(students.tenantId, tenantId));
  const studentNameMap = new Map(studentRows.map(s => [s.id, `${s.firstName} ${s.lastName}`]));

  // Fetch line items
  const invoiceIds = rows.map(r => r.id);
  const itemRows = await db
    .select()
    .from(invoiceItems)
    .where(inArray(invoiceItems.invoiceId, invoiceIds));

  const itemMap = new Map<string, PaymentLineItem[]>();
  for (const item of itemRows) {
    if (!itemMap.has(item.invoiceId)) itemMap.set(item.invoiceId, []);
    itemMap.get(item.invoiceId)!.push({
      description: item.description,
      amount: parseFloat(item.total),
      month: "", // Extracted from description if needed
    });
  }

  // Fetch payments per invoice
  const paymentRows = await db
    .select({ invoiceId: payments.invoiceId, amount: payments.amount, paymentDate: payments.paymentDate, method: payments.method })
    .from(payments)
    .where(inArray(payments.invoiceId, invoiceIds));

  const paidMap = new Map<string, { amount: number; date: string | null; method: string | null }>();
  for (const p of paymentRows) {
    const existing = paidMap.get(p.invoiceId);
    const amt = parseFloat(p.amount);
    if (!existing) {
      paidMap.set(p.invoiceId, { amount: amt, date: p.paymentDate, method: p.method });
    } else {
      existing.amount += amt;
      if (p.paymentDate > (existing.date || "")) {
        existing.date = p.paymentDate;
        existing.method = p.method;
      }
    }
  }

  return rows.map(row => {
    const paid = paidMap.get(row.id);
    return {
      id: row.id,
      studentId: row.studentId,
      studentName: studentNameMap.get(row.studentId) || "Unknown",
      items: itemMap.get(row.id) || [],
      totalAmount: parseFloat(row.totalAmount),
      paidAmount: paid?.amount || 0,
      status: row.status as PaymentStatus,
      dueDate: row.dueDate,
      issuedDate: row.issuedDate,
      paidDate: paid?.date || undefined,
      paymentMethod: paid?.method as Invoice["paymentMethod"],
      notes: row.notes || undefined,
    };
  });
}

export async function getInvoicesForStudent(tenantId: string, studentId: string): Promise<Invoice[]> {
  const all = await getInvoices(tenantId);
  return all.filter(i => i.studentId === studentId);
}
