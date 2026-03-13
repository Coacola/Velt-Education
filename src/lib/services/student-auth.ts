import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Resolves the student record from a userId (from the session).
 * Returns { id (studentId), tenantId } or null.
 */
export async function getStudentByUserId(userId: string) {
  const [student] = await db
    .select({ id: students.id, tenantId: students.tenantId })
    .from(students)
    .where(eq(students.userId, userId))
    .limit(1);

  return student || null;
}
