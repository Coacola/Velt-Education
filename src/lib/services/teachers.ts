import { db } from "@/lib/db";
import { teachers, classes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Teacher } from "@/lib/types/teacher";
import type { Subject } from "@/lib/types/class";

export async function getTeachers(tenantId: string): Promise<Teacher[]> {
  const rows = await db
    .select()
    .from(teachers)
    .where(and(eq(teachers.tenantId, tenantId), eq(teachers.isActive, true)))
    .orderBy(teachers.lastName);

  // Fetch class IDs for each teacher
  const classRows = await db
    .select({ id: classes.id, teacherId: classes.teacherId })
    .from(classes)
    .where(and(eq(classes.tenantId, tenantId), eq(classes.isActive, true)));

  const classMap = new Map<string, string[]>();
  for (const c of classRows) {
    if (!classMap.has(c.teacherId)) classMap.set(c.teacherId, []);
    classMap.get(c.teacherId)!.push(c.id);
  }

  return rows.map(row => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    fullName: `${row.firstName} ${row.lastName}`,
    email: row.email,
    phone: row.phone,
    subjects: (row.subjects || []) as Subject[],
    classIds: classMap.get(row.id) || [],
    bio: row.bio || "",
    qualifications: row.qualifications || [],
    joinedDate: row.joinedDate,
    hourlyRate: parseFloat(row.hourlyRate),
  }));
}

export async function getTeacherById(tenantId: string, id: string): Promise<Teacher | undefined> {
  const all = await getTeachers(tenantId);
  return all.find(t => t.id === id);
}
