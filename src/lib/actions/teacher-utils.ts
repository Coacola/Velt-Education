"use server";

import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface TeacherAuthResult {
  teacherId: string;
  tenantId: string;
  userId: string;
}

/**
 * Authenticates the current user as a teacher.
 * Returns teacher info or throws an error string.
 */
export async function requireTeacherAuth(): Promise<TeacherAuthResult> {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) {
    throw new Error("Not a teacher");
  }

  return {
    teacherId: teacher.id,
    tenantId: teacher.tenantId,
    userId: session.user.id,
  };
}

/**
 * Verifies that a class belongs to the given teacher.
 * Returns the class ID if valid, otherwise throws.
 */
export async function verifyClassOwnership(tenantId: string, teacherId: string, classId: string): Promise<void> {
  const [cls] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(
        eq(classes.id, classId),
        eq(classes.tenantId, tenantId),
        eq(classes.teacherId, teacherId),
        eq(classes.isActive, true)
      )
    )
    .limit(1);

  if (!cls) {
    throw new Error("Class not found or not assigned to you");
  }
}
