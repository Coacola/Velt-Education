"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { classes, classSchedules, studentClasses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { createClassSchema, type CreateClassInput, type UpdateClassInput } from "@/lib/validations/classes";

export async function createClass(data: CreateClassInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const validated = createClassSchema.parse(data);
    const { schedule, ...classData } = validated;

    const [cls] = await db.insert(classes).values({
      ...classData,
      tenantId: session.user.tenantId,
    }).returning();

    // Insert schedule slots
    if (schedule && schedule.length > 0) {
      await db.insert(classSchedules).values(
        schedule.map(s => ({
          classId: cls.id,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || null,
        }))
      );
    }

    revalidatePath("/admin/classes");
    return { data: cls };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create class" };
  }
}

export async function updateClass(id: string, data: UpdateClassInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const { schedule, ...classData } = data;

    const [updated] = await db.update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(and(eq(classes.id, id), eq(classes.tenantId, session.user.tenantId)))
      .returning();

    // Replace schedule if provided
    if (schedule) {
      await db.delete(classSchedules).where(eq(classSchedules.classId, id));
      if (schedule.length > 0) {
        await db.insert(classSchedules).values(
          schedule.map(s => ({
            classId: id,
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            room: s.room || null,
          }))
        );
      }
    }

    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${id}`);
    return { data: updated };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update class" };
  }
}

export async function deleteClass(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.update(classes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(classes.id, id), eq(classes.tenantId, session.user.tenantId)));

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete class" };
  }
}

export async function enrollStudentInClass(studentId: string, classId: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.insert(studentClasses).values({
      studentId,
      classId,
    }).onConflictDoUpdate({
      target: [studentClasses.studentId, studentClasses.classId],
      set: { isActive: true, withdrawnAt: null },
    });

    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${classId}`);
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to enroll student" };
  }
}

export async function removeStudentFromClass(studentId: string, classId: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.update(studentClasses)
      .set({ isActive: false, withdrawnAt: new Date().toISOString().split("T")[0] })
      .where(and(eq(studentClasses.studentId, studentId), eq(studentClasses.classId, classId)));

    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${classId}`);
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to remove student" };
  }
}
