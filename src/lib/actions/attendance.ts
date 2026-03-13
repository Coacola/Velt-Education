"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { attendanceSessions, attendanceRecords } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { createSessionSchema, type CreateSessionInput, type SaveAttendanceInput } from "@/lib/validations/attendance";
import { logActivity } from "./activity";

export async function createSession(data: CreateSessionInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const validated = createSessionSchema.parse(data);
    const [newSession] = await db.insert(attendanceSessions).values({
      ...validated,
      tenantId: session.user.tenantId,
      createdBy: session.user.id,
    }).returning();

    revalidatePath("/admin/attendance");
    revalidatePath("/teacher/attendance");
    return { data: newSession };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create session" };
  }
}

export async function saveAttendanceRecords(input: SaveAttendanceInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    // Delete existing records for this session, then insert new ones
    await db.delete(attendanceRecords).where(eq(attendanceRecords.sessionId, input.sessionId));

    if (input.records.length > 0) {
      await db.insert(attendanceRecords).values(
        input.records.map(r => ({
          sessionId: input.sessionId,
          studentId: r.studentId,
          status: r.status,
          note: r.note || null,
        }))
      );
    }

    // Mark session as completed
    await db.update(attendanceSessions)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(attendanceSessions.id, input.sessionId));

    const presentCount = input.records.filter(r => r.status === "present" || r.status === "late").length;

    await logActivity({
      tenantId: session.user.tenantId,
      eventType: "session_completed",
      entityType: "session",
      entityId: input.sessionId,
      actorId: session.user.id,
      title: "Session Completed",
      description: `${presentCount}/${input.records.length} present`,
      severity: "info",
    });

    revalidatePath("/admin/attendance");
    revalidatePath(`/admin/attendance/${input.sessionId}`);
    revalidatePath("/teacher/attendance");
    revalidatePath(`/teacher/attendance/${input.sessionId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save attendance" };
  }
}

export async function updateSessionStatus(sessionId: string, status: "scheduled" | "completed" | "cancelled") {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.update(attendanceSessions)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(attendanceSessions.id, sessionId), eq(attendanceSessions.tenantId, session.user.tenantId)));

    revalidatePath("/admin/attendance");
    revalidatePath(`/admin/attendance/${sessionId}`);
    revalidatePath("/teacher/attendance");
    revalidatePath(`/teacher/attendance/${sessionId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update session" };
  }
}
