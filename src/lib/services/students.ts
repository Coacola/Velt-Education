import { db } from "@/lib/db";
import { students, studentClasses, classes, attendanceRecords, attendanceSessions, examGrades, exams, invoices, payments } from "@/lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import type { Student, PaymentStatus } from "@/lib/types/student";

function computePaymentStatus(outstanding: number, hasOverdue: boolean): PaymentStatus {
  if (outstanding <= 0) return "paid";
  if (hasOverdue) return "overdue";
  return "partial";
}

function computeAtRisk(attendanceRate: number, avgGrade: number, paymentStatus: PaymentStatus): { atRisk: boolean; riskReason: string[] } {
  const reasons: string[] = [];
  if (attendanceRate < 0.75) reasons.push("Low attendance");
  if (avgGrade < 10) reasons.push("Low grades");
  if (paymentStatus === "overdue") reasons.push("Overdue payment");
  if (paymentStatus === "partial") reasons.push("Partial payment");
  return { atRisk: reasons.length > 0, riskReason: reasons };
}

export async function getStudents(tenantId: string): Promise<Student[]> {
  const rows = await db
    .select()
    .from(students)
    .where(and(eq(students.tenantId, tenantId), eq(students.isActive, true)))
    .orderBy(students.lastName);

  const studentIds = rows.map(r => r.id);
  if (studentIds.length === 0) return [];

  // Fetch enrolled class IDs for all students
  const enrollments = await db
    .select({ studentId: studentClasses.studentId, classId: studentClasses.classId })
    .from(studentClasses)
    .where(and(eq(studentClasses.isActive, true), inArray(studentClasses.studentId, studentIds)));

  // Fetch class subjects
  const classRows = await db.select({ id: classes.id, subject: classes.subject }).from(classes);
  const classSubjectMap = new Map(classRows.map(c => [c.id, c.subject]));

  // Build enrollment map
  const enrollmentMap = new Map<string, string[]>();
  const subjectMap = new Map<string, string[]>();
  for (const e of enrollments) {
    if (!enrollmentMap.has(e.studentId)) enrollmentMap.set(e.studentId, []);
    enrollmentMap.get(e.studentId)!.push(e.classId);
    if (!subjectMap.has(e.studentId)) subjectMap.set(e.studentId, []);
    const subject = classSubjectMap.get(e.classId);
    if (subject && !subjectMap.get(e.studentId)!.includes(subject)) {
      subjectMap.get(e.studentId)!.push(subject);
    }
  }

  // Compute attendance rates
  const attRecords = await db
    .select({
      studentId: attendanceRecords.studentId,
      status: attendanceRecords.status,
    })
    .from(attendanceRecords)
    .where(inArray(attendanceRecords.studentId, studentIds));

  const attMap = new Map<string, { total: number; present: number }>();
  for (const r of attRecords) {
    if (!attMap.has(r.studentId)) attMap.set(r.studentId, { total: 0, present: 0 });
    const entry = attMap.get(r.studentId)!;
    entry.total++;
    if (r.status === "present" || r.status === "late") entry.present++;
  }

  // Compute avg grades
  const gradeRows = await db
    .select({
      studentId: examGrades.studentId,
      score: examGrades.score,
      examId: examGrades.examId,
    })
    .from(examGrades)
    .where(inArray(examGrades.studentId, studentIds));

  const examMaxScores = await db.select({ id: exams.id, maxScore: exams.maxScore }).from(exams);
  const maxScoreMap = new Map(examMaxScores.map(e => [e.id, parseFloat(e.maxScore)]));

  const gradeMap = new Map<string, number[]>();
  for (const g of gradeRows) {
    if (!gradeMap.has(g.studentId)) gradeMap.set(g.studentId, []);
    const maxScore = maxScoreMap.get(g.examId) || 20;
    gradeMap.get(g.studentId)!.push((parseFloat(g.score) / maxScore) * 20);
  }

  // Compute outstanding balances
  const invoiceRows = await db
    .select({
      studentId: invoices.studentId,
      totalAmount: invoices.totalAmount,
      status: invoices.status,
      id: invoices.id,
    })
    .from(invoices)
    .where(and(
      inArray(invoices.studentId, studentIds),
      sql`${invoices.status} != 'cancelled'`
    ));

  const paymentRows = await db
    .select({
      invoiceId: payments.invoiceId,
      amount: payments.amount,
    })
    .from(payments)
    .where(inArray(payments.studentId, studentIds));

  const paidByInvoice = new Map<string, number>();
  for (const p of paymentRows) {
    paidByInvoice.set(p.invoiceId, (paidByInvoice.get(p.invoiceId) || 0) + parseFloat(p.amount));
  }

  const balanceMap = new Map<string, number>();
  const overdueMap = new Map<string, boolean>();
  for (const inv of invoiceRows) {
    const paid = paidByInvoice.get(inv.id) || 0;
    const balance = parseFloat(inv.totalAmount) - paid;
    balanceMap.set(inv.studentId, (balanceMap.get(inv.studentId) || 0) + Math.max(0, balance));
    if (inv.status === "overdue") overdueMap.set(inv.studentId, true);
  }

  return rows.map(row => {
    const attEntry = attMap.get(row.id);
    const attendanceRate = attEntry && attEntry.total > 0 ? attEntry.present / attEntry.total : 1;
    const grades = gradeMap.get(row.id) || [];
    const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
    const outstandingBalance = balanceMap.get(row.id) || 0;
    const hasOverdue = overdueMap.get(row.id) || false;
    const paymentStatus = computePaymentStatus(outstandingBalance, hasOverdue);
    const { atRisk, riskReason } = computeAtRisk(attendanceRate, avgGrade, paymentStatus);

    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      fullName: `${row.firstName} ${row.lastName}`,
      email: row.email,
      phone: row.phone,
      parentName: row.parentName,
      parentPhone: row.parentPhone,
      year: row.year as "Α" | "Β" | "Γ",
      school: row.school,
      monthlyFee: parseFloat(row.monthlyFee),
      enrolledClassIds: enrollmentMap.get(row.id) || [],
      subjects: subjectMap.get(row.id) || [],
      paymentStatus,
      outstandingBalance,
      attendanceRate,
      avgGrade,
      atRisk,
      riskReason,
      enrolledSince: row.enrolledSince,
      notes: row.notes || undefined,
    };
  });
}

export async function getStudentById(tenantId: string, id: string): Promise<Student | undefined> {
  const all = await getStudents(tenantId);
  return all.find(s => s.id === id);
}
