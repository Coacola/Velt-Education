import { db } from "@/lib/db";
import { exams, examGrades, classes, students } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { Exam, ExamGrade } from "@/lib/types/exam";
import type { Subject } from "@/lib/types/class";

export async function getExams(tenantId: string): Promise<Exam[]> {
  const rows = await db
    .select()
    .from(exams)
    .where(eq(exams.tenantId, tenantId))
    .orderBy(exams.date);

  if (rows.length === 0) return [];

  // Fetch class info
  const classRows = await db
    .select({ id: classes.id, name: classes.name, teacherId: classes.teacherId })
    .from(classes)
    .where(eq(classes.tenantId, tenantId));
  const classMap = new Map(classRows.map(c => [c.id, c]));

  // Fetch student names
  const studentRows = await db
    .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
    .from(students)
    .where(eq(students.tenantId, tenantId));
  const studentNameMap = new Map(studentRows.map(s => [s.id, `${s.firstName} ${s.lastName}`]));

  // Fetch all grades
  const examIds = rows.map(r => r.id);
  const gradeRows = await db
    .select()
    .from(examGrades)
    .where(inArray(examGrades.examId, examIds));

  const gradeMap = new Map<string, ExamGrade[]>();
  for (const g of gradeRows) {
    if (!gradeMap.has(g.examId)) gradeMap.set(g.examId, []);
    gradeMap.get(g.examId)!.push({
      studentId: g.studentId,
      studentName: studentNameMap.get(g.studentId) || "Unknown",
      score: parseFloat(g.score),
      absent: g.absent,
    });
  }

  return rows.map(row => {
    const cls = classMap.get(row.classId);
    const grades = gradeMap.get(row.id) || [];
    const classAverage = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
      : 0;

    return {
      id: row.id,
      title: row.title,
      classId: row.classId,
      className: cls?.name || "Unknown",
      subject: row.subject as Subject,
      teacherId: cls?.teacherId || "",
      date: row.date,
      maxScore: parseFloat(row.maxScore),
      grades,
      classAverage,
      notes: row.notes || undefined,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    };
  });
}

export async function getExamsForClass(tenantId: string, classId: string): Promise<Exam[]> {
  const all = await getExams(tenantId);
  return all.filter(e => e.classId === classId);
}
