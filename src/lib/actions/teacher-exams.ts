"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { exams, examGrades } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createExamSchema, type CreateExamInput, type SaveGradesInput } from "@/lib/validations/exams";
import { requireTeacherAuth, verifyClassOwnership } from "./teacher-utils";
import { logActivity } from "./activity";

export async function createExamAsTeacher(data: CreateExamInput) {
  try {
    const { teacherId, tenantId, userId } = await requireTeacherAuth();
    const validated = createExamSchema.parse(data);

    // Verify teacher owns this class
    await verifyClassOwnership(tenantId, teacherId, validated.classId);

    const [exam] = await db.insert(exams).values({
      ...validated,
      maxScore: String(validated.maxScore),
      tenantId,
    }).returning();

    await logActivity({
      tenantId,
      eventType: "exam_created",
      entityType: "exam",
      entityId: exam.id,
      actorId: userId,
      title: "Exam Created",
      description: `${validated.title} for ${validated.subject}`,
      severity: "info",
    });

    revalidatePath("/teacher/exams");
    revalidatePath("/admin/exams");
    return { data: exam };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create exam" };
  }
}

export async function saveGradesAsTeacher(input: SaveGradesInput) {
  try {
    const { teacherId, tenantId, userId } = await requireTeacherAuth();

    // Verify the exam belongs to one of teacher's classes
    const [exam] = await db
      .select({ classId: exams.classId })
      .from(exams)
      .where(and(eq(exams.id, input.examId), eq(exams.tenantId, tenantId)))
      .limit(1);

    if (!exam) throw new Error("Exam not found");
    await verifyClassOwnership(tenantId, teacherId, exam.classId);

    // Delete existing grades, insert new ones
    await db.delete(examGrades).where(eq(examGrades.examId, input.examId));

    if (input.grades.length > 0) {
      await db.insert(examGrades).values(
        input.grades.map(g => ({
          examId: input.examId,
          studentId: g.studentId,
          score: String(g.score),
          absent: g.absent,
          feedback: g.feedback || null,
        }))
      );
    }

    const scores = input.grades.filter(g => !g.absent).map(g => g.score);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "0";

    await logActivity({
      tenantId,
      eventType: "exam_graded",
      entityType: "exam",
      entityId: input.examId,
      actorId: userId,
      title: "Grades Recorded",
      description: `Average: ${avg}/20 (by teacher)`,
      severity: "success",
    });

    revalidatePath("/teacher/exams");
    revalidatePath("/admin/exams");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save grades" };
  }
}

export async function deleteExamAsTeacher(id: string) {
  try {
    const { teacherId, tenantId } = await requireTeacherAuth();

    // Verify the exam belongs to one of teacher's classes
    const [exam] = await db
      .select({ classId: exams.classId })
      .from(exams)
      .where(and(eq(exams.id, id), eq(exams.tenantId, tenantId)))
      .limit(1);

    if (!exam) throw new Error("Exam not found");
    await verifyClassOwnership(tenantId, teacherId, exam.classId);

    // Delete grades first, then exam
    await db.delete(examGrades).where(eq(examGrades.examId, id));
    await db.delete(exams).where(eq(exams.id, id));

    await logActivity({
      tenantId,
      eventType: "exam_deleted",
      entityType: "exam",
      entityId: id,
      actorId: teacherId,
      title: "Exam Deleted",
      description: "Exam removed by teacher",
      severity: "warning",
    });

    revalidatePath("/teacher/exams");
    revalidatePath("/admin/exams");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete exam" };
  }
}
