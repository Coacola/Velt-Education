"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { teachers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { createTeacherSchema, type CreateTeacherInput, type UpdateTeacherInput } from "@/lib/validations/teachers";
import { logActivity } from "./activity";

export async function createTeacher(data: CreateTeacherInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const validated = createTeacherSchema.parse(data);
    const [teacher] = await db.insert(teachers).values({
      ...validated,
      hourlyRate: String(validated.hourlyRate),
      tenantId: session.user.tenantId,
    }).returning();

    await logActivity({
      tenantId: session.user.tenantId,
      eventType: "teacher_added",
      entityType: "teacher",
      entityId: teacher.id,
      actorId: session.user.id,
      title: "New Teacher Added",
      description: `${teacher.firstName} ${teacher.lastName}`,
      severity: "success",
    });

    revalidatePath("/admin/teachers");
    return { data: teacher };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create teacher" };
  }
}

export async function updateTeacher(id: string, data: UpdateTeacherInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.hourlyRate !== undefined) updateData.hourlyRate = String(data.hourlyRate);

    const [updated] = await db.update(teachers)
      .set(updateData)
      .where(and(eq(teachers.id, id), eq(teachers.tenantId, session.user.tenantId)))
      .returning();

    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${id}`);
    return { data: updated };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update teacher" };
  }
}

export async function deleteTeacher(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.update(teachers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(teachers.id, id), eq(teachers.tenantId, session.user.tenantId)));

    revalidatePath("/admin/teachers");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete teacher" };
  }
}
