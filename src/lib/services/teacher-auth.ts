import { db } from "@/lib/db";
import { teachers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Resolves the teacher record from a userId (from the session).
 * Returns { teacherId, tenantId } or null.
 */
export async function getTeacherByUserId(userId: string) {
  const [teacher] = await db
    .select({ id: teachers.id, tenantId: teachers.tenantId })
    .from(teachers)
    .where(eq(teachers.userId, userId))
    .limit(1);

  return teacher || null;
}
