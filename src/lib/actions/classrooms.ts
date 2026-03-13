"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { classrooms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";

export async function createClassroom(name: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Classroom name is required" };

  try {
    const [room] = await db.insert(classrooms).values({
      tenantId: session.user.tenantId,
      name: trimmed,
    }).onConflictDoNothing().returning();

    // If conflict (already exists), fetch the existing one
    if (!room) {
      const [existing] = await db
        .select({ id: classrooms.id, name: classrooms.name })
        .from(classrooms)
        .where(and(eq(classrooms.tenantId, session.user.tenantId), eq(classrooms.name, trimmed)))
        .limit(1);
      if (existing) {
        return { data: existing };
      }
      return { error: "Classroom already exists" };
    }

    revalidatePath("/admin/classes");
    return { data: { id: room.id, name: room.name } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create classroom" };
  }
}

export async function deleteClassroom(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.delete(classrooms).where(
      and(eq(classrooms.id, id), eq(classrooms.tenantId, session.user.tenantId))
    );

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete classroom" };
  }
}
