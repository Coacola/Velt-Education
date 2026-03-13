"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { homework, homeworkSubmissions, studentClasses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createHomeworkSchema, type CreateHomeworkInput } from "@/lib/validations/homework";
import { requireTeacherAuth, verifyClassOwnership } from "./teacher-utils";
import { logActivity } from "./activity";

export async function createHomeworkAsTeacher(data: CreateHomeworkInput) {
  try {
    const { teacherId, tenantId, userId } = await requireTeacherAuth();
    const validated = createHomeworkSchema.parse(data);

    // Verify teacher owns this class
    await verifyClassOwnership(tenantId, teacherId, validated.classId);

    // Create homework
    const [hw] = await db.insert(homework).values({
      tenantId,
      classId: validated.classId,
      title: validated.title,
      description: validated.description || null,
      dueDate: validated.dueDate,
      assignedBy: userId,
      attachments: validated.attachments,
      requiresSubmission: validated.requiresSubmission,
    }).returning();

    // Auto-create pending submissions for all enrolled students
    const enrolledStudents = await db
      .select({ studentId: studentClasses.studentId })
      .from(studentClasses)
      .where(
        and(
          eq(studentClasses.classId, validated.classId),
          eq(studentClasses.isActive, true),
        )
      );

    if (enrolledStudents.length > 0) {
      await db.insert(homeworkSubmissions).values(
        enrolledStudents.map(s => ({
          homeworkId: hw.id,
          studentId: s.studentId,
          status: "pending" as const,
        }))
      );
    }

    await logActivity({
      tenantId,
      eventType: "homework_created",
      entityType: "homework",
      entityId: hw.id,
      actorId: userId,
      title: "Homework Created",
      description: `${validated.title}${validated.requiresSubmission ? " (requires PDF submission)" : ""}`,
      severity: "info",
    });

    revalidatePath("/teacher/homework");
    revalidatePath("/student/homework");
    revalidatePath("/student");
    return { data: hw };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create homework" };
  }
}

export async function deleteHomeworkAsTeacher(homeworkId: string) {
  try {
    const { teacherId, tenantId } = await requireTeacherAuth();

    // Verify the homework belongs to one of teacher's classes
    const [hw] = await db
      .select({ classId: homework.classId, title: homework.title })
      .from(homework)
      .where(and(eq(homework.id, homeworkId), eq(homework.tenantId, tenantId)))
      .limit(1);

    if (!hw) throw new Error("Homework not found");
    await verifyClassOwnership(tenantId, teacherId, hw.classId);

    // Delete submissions first, then homework
    await db.delete(homeworkSubmissions).where(eq(homeworkSubmissions.homeworkId, homeworkId));
    await db.delete(homework).where(eq(homework.id, homeworkId));

    await logActivity({
      tenantId,
      eventType: "homework_deleted",
      entityType: "homework",
      entityId: homeworkId,
      actorId: teacherId,
      title: "Homework Deleted",
      description: `${hw.title} removed by teacher`,
      severity: "warning",
    });

    revalidatePath("/teacher/homework");
    revalidatePath("/student/homework");
    revalidatePath("/student");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete homework" };
  }
}
