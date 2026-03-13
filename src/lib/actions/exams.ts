"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { exams, examGrades } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { createExamSchema, type CreateExamInput, type SaveGradesInput } from "@/lib/validations/exams";
import { logActivity } from "./activity";

export async function createExam(data: CreateExamInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const validated = createExamSchema.parse(data);
    const [exam] = await db.insert(exams).values({
      ...validated,
      maxScore: String(validated.maxScore),
      tenantId: session.user.tenantId,
    }).returning();

    revalidatePath("/admin/exams");
    revalidatePath("/teacher/exams");
    return { data: exam };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create exam" };
  }
}

export async function saveExamGrades(input: SaveGradesInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    // Delete existing grades for this exam, then insert new ones
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
      tenantId: session.user.tenantId,
      eventType: "exam_graded",
      entityType: "exam",
      entityId: input.examId,
      actorId: session.user.id,
      title: "Grades Recorded",
      description: `Average: ${avg}/20`,
      severity: "success",
    });

    revalidatePath("/admin/exams");
    revalidatePath("/teacher/exams");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save grades" };
  }
}

export async function deleteExam(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.delete(exams)
      .where(and(eq(exams.id, id), eq(exams.tenantId, session.user.tenantId)));

    revalidatePath("/admin/exams");
    revalidatePath("/teacher/exams");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete exam" };
  }
}
