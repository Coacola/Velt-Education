"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { attendanceSessions, attendanceRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSessionSchema, type CreateSessionInput, type SaveAttendanceInput } from "@/lib/validations/attendance";
import { requireTeacherAuth, verifyClassOwnership } from "./teacher-utils";
import { logActivity } from "./activity";

export async function createSessionAsTeacher(data: CreateSessionInput) {
  try {
    const { teacherId, tenantId, userId } = await requireTeacherAuth();
    const validated = createSessionSchema.parse(data);

    // Verify teacher owns this class
    await verifyClassOwnership(tenantId, teacherId, validated.classId);

    const [newSession] = await db.insert(attendanceSessions).values({
      ...validated,
      tenantId,
      createdBy: userId,
    }).returning();

    await logActivity({
      tenantId,
      eventType: "session_created",
      entityType: "session",
      entityId: newSession.id,
      actorId: userId,
      title: "Attendance Session Created",
      description: `Teacher created attendance session`,
      severity: "info",
    });

    revalidatePath("/teacher/attendance");
    revalidatePath("/admin/attendance");
    return { data: newSession };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create session" };
  }
}

export async function saveAttendanceAsTeacher(input: SaveAttendanceInput) {
  try {
    const { teacherId, tenantId, userId } = await requireTeacherAuth();

    // Verify the session belongs to one of teacher's classes
    const [session] = await db
      .select({ classId: attendanceSessions.classId })
      .from(attendanceSessions)
      .where(eq(attendanceSessions.id, input.sessionId))
      .limit(1);

    if (!session) throw new Error("Session not found");
    await verifyClassOwnership(tenantId, teacherId, session.classId);

    // Delete existing records, insert new ones
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
      tenantId,
      eventType: "session_completed",
      entityType: "session",
      entityId: input.sessionId,
      actorId: userId,
      title: "Attendance Recorded",
      description: `${presentCount}/${input.records.length} present (by teacher)`,
      severity: "info",
    });

    revalidatePath("/teacher/attendance");
    revalidatePath(`/teacher/attendance/${input.sessionId}`);
    revalidatePath("/admin/attendance");
    revalidatePath(`/admin/attendance/${input.sessionId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save attendance" };
  }
}

export async function updateSessionStatusAsTeacher(sessionId: string, status: "scheduled" | "completed" | "cancelled") {
  try {
    const { teacherId, tenantId } = await requireTeacherAuth();

    // Verify ownership through the session's class
    const [session] = await db
      .select({ classId: attendanceSessions.classId })
      .from(attendanceSessions)
      .where(eq(attendanceSessions.id, sessionId))
      .limit(1);

    if (!session) throw new Error("Session not found");
    await verifyClassOwnership(tenantId, teacherId, session.classId);

    await db.update(attendanceSessions)
      .set({ status, updatedAt: new Date() })
      .where(eq(attendanceSessions.id, sessionId));

    revalidatePath("/teacher/attendance");
    revalidatePath(`/teacher/attendance/${sessionId}`);
    revalidatePath("/admin/attendance");
    revalidatePath(`/admin/attendance/${sessionId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update session" };
  }
}
