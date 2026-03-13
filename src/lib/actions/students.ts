"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { students, studentClasses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { createStudentSchema, type CreateStudentInput, type UpdateStudentInput } from "@/lib/validations/students";
import { logActivity } from "./activity";

export async function createStudent(data: CreateStudentInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const validated = createStudentSchema.parse(data);
    const { monthlyFee, ...rest } = validated;
    const [student] = await db.insert(students).values({
      ...rest,
      monthlyFee: String(monthlyFee),
      tenantId: session.user.tenantId,
    }).returning();

    await logActivity({
      tenantId: session.user.tenantId,
      eventType: "student_enrolled",
      entityType: "student",
      entityId: student.id,
      actorId: session.user.id,
      title: "New Student Enrolled",
      description: `${student.firstName} ${student.lastName}`,
      severity: "success",
    });

    revalidatePath("/admin/students");
    return { data: student };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create student" };
  }
}

export async function updateStudent(id: string, data: UpdateStudentInput) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    const { monthlyFee, ...rest } = data;
    const setData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    if (monthlyFee !== undefined) setData.monthlyFee = String(monthlyFee);
    const [updated] = await db.update(students)
      .set(setData)
      .where(and(eq(students.id, id), eq(students.tenantId, session.user.tenantId)))
      .returning();

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${id}`);
    return { data: updated };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update student" };
  }
}

export async function deleteStudent(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.update(students)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(students.id, id), eq(students.tenantId, session.user.tenantId)));

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete student" };
  }
}

export async function enrollStudentInClass(studentId: string, classId: string) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await db.insert(studentClasses).values({
      studentId,
      classId,
    });

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath(`/admin/classes/${classId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to enroll student" };
  }
}
