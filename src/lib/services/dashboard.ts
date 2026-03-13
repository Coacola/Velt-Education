import { db } from "@/lib/db";
import { students, invoices, payments, attendanceRecords, attendanceSessions } from "@/lib/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { getAthensNow } from "@/lib/utils";

export async function getDashboardKpis(tenantId: string) {
  // Total active students
  const [studentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(students)
    .where(and(eq(students.tenantId, tenantId), eq(students.isActive, true)));

  // Monthly collected (current month) — use Athens timezone
  const now = getAthensNow();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const [monthlyPayments] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)` })
    .from(payments)
    .where(and(
      eq(payments.tenantId, tenantId),
      gte(payments.paymentDate, monthStart),
    ));

  // Total outstanding — use Drizzle select instead of raw execute
  const outstandingRows = await db
    .select({
      totalAmount: invoices.totalAmount,
      invoiceId: invoices.id,
    })
    .from(invoices)
    .where(and(
      eq(invoices.tenantId, tenantId),
      sql`${invoices.status} NOT IN ('paid', 'cancelled')`
    ));

  let totalOutstanding = 0;
  for (const inv of outstandingRows) {
    const [paidResult] = await db
      .select({ paid: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)` })
      .from(payments)
      .where(eq(payments.invoiceId, inv.invoiceId));
    totalOutstanding += parseFloat(inv.totalAmount) - Number(paidResult.paid);
  }

  // Average attendance rate
  const [totalRecords] = await db
    .select({ count: sql<number>`count(*)` })
    .from(attendanceRecords)
    .innerJoin(attendanceSessions, eq(attendanceRecords.sessionId, attendanceSessions.id))
    .where(eq(attendanceSessions.tenantId, tenantId));

  const [presentRecords] = await db
    .select({ count: sql<number>`count(*)` })
    .from(attendanceRecords)
    .innerJoin(attendanceSessions, eq(attendanceRecords.sessionId, attendanceSessions.id))
    .where(and(
      eq(attendanceSessions.tenantId, tenantId),
      sql`${attendanceRecords.status} IN ('present', 'late')`
    ));

  const avgAttendance = Number(totalRecords.count) > 0
    ? Number(presentRecords.count) / Number(totalRecords.count)
    : 0;

  return {
    totalStudents: Number(studentCount.count) || 0,
    monthlyCollected: Number(monthlyPayments.total) || 0,
    totalOutstanding,
    avgAttendance,
  };
}

export function getRevenueTrend(): { month: string; revenue: number; collected: number }[] {
  return [
    { month: "Sep", revenue: 4200, collected: 3920 },
    { month: "Oct", revenue: 4480, collected: 4200 },
    { month: "Nov", revenue: 4480, collected: 4060 },
    { month: "Dec", revenue: 3640, collected: 3360 },
    { month: "Jan", revenue: 4760, collected: 4060 },
    { month: "Feb", revenue: 4760, collected: 3920 },
    { month: "Mar", revenue: 4760, collected: 1260 },
  ];
}

export function getAttendanceTrend(): { week: string; present: number; absent: number; late: number }[] {
  return [
    { week: "W2 Feb", present: 88, absent: 8, late: 4 },
    { week: "W3 Feb", present: 79, absent: 14, late: 7 },
    { week: "W4 Feb", present: 85, absent: 10, late: 5 },
    { week: "W1 Mar", present: 83, absent: 11, late: 6 },
  ];
}
