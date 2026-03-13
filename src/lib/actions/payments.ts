"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { invoices, invoiceItems, payments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { recordPaymentSchema, createInvoiceSchema, type RecordPaymentInput, type CreateInvoiceInput } from "@/lib/validations/payments";
import { logActivity } from "./activity";

export async function recordPayment(data: RecordPaymentInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const validated = recordPaymentSchema.parse(data);

    // Insert payment
    const [payment] = await db.insert(payments).values({
      ...validated,
      amount: String(validated.amount),
      tenantId: session.user.tenantId,
      recordedBy: session.user.id,
    }).returning();

    // Recalculate invoice status
    const [paidResult] = await db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)` })
      .from(payments)
      .where(eq(payments.invoiceId, validated.invoiceId));

    const [invoice] = await db
      .select({ totalAmount: invoices.totalAmount, dueDate: invoices.dueDate })
      .from(invoices)
      .where(eq(invoices.id, validated.invoiceId));

    const paidAmount = Number(paidResult.total);
    const totalAmount = parseFloat(invoice.totalAmount);
    const isOverdue = new Date(invoice.dueDate) < new Date();

    let newStatus: "paid" | "partial" | "overdue" | "pending" = "pending";
    if (paidAmount >= totalAmount) newStatus = "paid";
    else if (paidAmount > 0 && isOverdue) newStatus = "overdue";
    else if (paidAmount > 0) newStatus = "partial";
    else if (isOverdue) newStatus = "overdue";

    await db.update(invoices)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(invoices.id, validated.invoiceId));

    await logActivity({
      tenantId: session.user.tenantId,
      eventType: "payment_received",
      entityType: "payment",
      entityId: payment.id,
      actorId: session.user.id,
      title: "Payment Recorded",
      description: `€${validated.amount}`,
      severity: "success",
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/students");
    return { data: payment };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to record payment" };
  }
}

export async function createInvoice(data: CreateInvoiceInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const validated = createInvoiceSchema.parse(data);

    // Generate invoice number
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.tenantId, session.user.tenantId));

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Number(countResult.count) + 1).padStart(4, "0")}`;
    const totalAmount = validated.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const [invoice] = await db.insert(invoices).values({
      tenantId: session.user.tenantId,
      studentId: validated.studentId,
      invoiceNumber,
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: validated.dueDate,
      totalAmount: String(totalAmount),
      notes: validated.notes || null,
    }).returning();

    // Insert line items
    await db.insert(invoiceItems).values(
      validated.items.map(item => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        total: String(item.unitPrice * item.quantity),
      }))
    );

    revalidatePath("/admin/payments");
    return { data: invoice };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create invoice" };
  }
}

export async function generateMonthlyInvoices(month: string) {
  // month format: "2025-03"
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const tenantId = session.user.tenantId;

    // Get all active students with monthlyFee > 0
    const { students } = await import("@/lib/db/schema");
    const { getStudents } = await import("@/lib/services/students");
    const allStudents = await getStudents(tenantId);
    const billable = allStudents.filter(s => s.monthlyFee > 0);

    if (billable.length === 0) return { error: "No students with monthly fees found" };

    // Check which students already have an invoice for this month
    const existingInvoices = await db
      .select({ studentId: invoices.studentId })
      .from(invoices)
      .where(and(
        eq(invoices.tenantId, tenantId),
        sql`to_char(${invoices.issuedDate}::date, 'YYYY-MM') = ${month}`
      ));
    const existingStudentIds = new Set(existingInvoices.map(i => i.studentId));

    const toGenerate = billable.filter(s => !existingStudentIds.has(s.id));
    if (toGenerate.length === 0) return { error: "All invoices for this month already exist" };

    // Generate invoice number prefix
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.tenantId, tenantId));
    let nextNum = Number(countResult.count) + 1;

    const [year, monthNum] = month.split("-");
    const dueDate = `${year}-${monthNum}-15`; // Due on 15th of the month
    const issuedDate = `${year}-${monthNum}-01`;
    const monthName = new Date(`${month}-01`).toLocaleString("en", { month: "long", year: "numeric" });

    for (const student of toGenerate) {
      const invoiceNumber = `INV-${year}-${String(nextNum++).padStart(4, "0")}`;

      const [inv] = await db.insert(invoices).values({
        tenantId,
        studentId: student.id,
        invoiceNumber,
        issuedDate,
        dueDate,
        totalAmount: String(student.monthlyFee),
        notes: `Monthly tuition - ${monthName}`,
      }).returning();

      await db.insert(invoiceItems).values({
        invoiceId: inv.id,
        description: `Monthly Tuition - ${monthName}`,
        quantity: 1,
        unitPrice: String(student.monthlyFee),
        total: String(student.monthlyFee),
      });
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/students");
    return { data: { generated: toGenerate.length } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to generate invoices" };
  }
}

export async function voidInvoice(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.update(invoices)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, session.user.tenantId)));

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to void invoice" };
  }
}
