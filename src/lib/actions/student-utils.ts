"use server";

import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";

export interface StudentAuthResult {
  studentId: string;
  tenantId: string;
  userId: string;
}

/**
 * Authenticates the current user as a student.
 * Returns student info or throws an error.
 */
export async function requireStudentAuth(): Promise<StudentAuthResult> {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const student = await getStudentByUserId(session.user.id);
  if (!student) {
    throw new Error("Not a student");
  }

  return {
    studentId: student.id,
    tenantId: student.tenantId,
    userId: session.user.id,
  };
}
