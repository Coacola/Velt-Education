import { db } from "@/lib/db";
import { exams, examGrades, classes } from "@/lib/db/schema";
import { eq, and, isNotNull, inArray } from "drizzle-orm";

export interface StudentGrade {
  examId: string;
  examTitle: string;
  classId: string;
  className: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  classAverage: number;
  absent: boolean;
}

export async function getGradesForStudent(
  tenantId: string,
  studentId: string,
  enrolledClassIds: string[],
): Promise<StudentGrade[]> {
  if (enrolledClassIds.length === 0) return [];

  // Only fetch published exams
  const examRows = await db
    .select()
    .from(exams)
    .where(and(eq(exams.tenantId, tenantId), isNotNull(exams.publishedAt)))
    .orderBy(exams.date);

  const myExams = examRows.filter(e => enrolledClassIds.includes(e.classId));
  if (myExams.length === 0) return [];

  const examIds = myExams.map(e => e.id);

  // Get class names
  const classRows = await db
    .select({ id: classes.id, name: classes.name, subject: classes.subject })
    .from(classes)
    .where(eq(classes.tenantId, tenantId));
  const classMap = new Map(classRows.map(c => [c.id, c]));

  // Get all grades for these exams (for class averages)
  const allGrades = await db
    .select()
    .from(examGrades)
    .where(inArray(examGrades.examId, examIds));

  // Build grade maps
  const examGradeGroups = new Map<string, { score: number; absent: boolean }[]>();
  const studentGradeMap = new Map<string, { score: number; absent: boolean }>();

  for (const g of allGrades) {
    if (!examGradeGroups.has(g.examId)) examGradeGroups.set(g.examId, []);
    examGradeGroups.get(g.examId)!.push({ score: parseFloat(g.score), absent: g.absent });

    if (g.studentId === studentId) {
      studentGradeMap.set(g.examId, { score: parseFloat(g.score), absent: g.absent });
    }
  }

  return myExams
    .map(exam => {
      const grade = studentGradeMap.get(exam.id);
      if (!grade) return null;

      const cls = classMap.get(exam.classId);
      const allScores = (examGradeGroups.get(exam.id) || []).filter(g => !g.absent).map(g => g.score);
      const classAverage = allScores.length > 0
        ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
        : 0;

      return {
        examId: exam.id,
        examTitle: exam.title,
        classId: exam.classId,
        className: cls?.name || "Unknown",
        subject: cls?.subject || exam.subject,
        date: exam.date,
        score: grade.score,
        maxScore: parseFloat(exam.maxScore),
        classAverage,
        absent: grade.absent,
      };
    })
    .filter((g): g is StudentGrade => g !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}
