import { db } from "@/lib/db";
import { lessonPlans, classes, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { LessonPlan, LessonMaterial } from "@/lib/types/lessonPlan";

export async function getLessonPlans(tenantId: string): Promise<LessonPlan[]> {
  const rows = await db
    .select()
    .from(lessonPlans)
    .where(eq(lessonPlans.tenantId, tenantId))
    .orderBy(lessonPlans.lessonDate, lessonPlans.orderIndex);

  if (rows.length === 0) return [];

  // Fetch class names
  const classRows = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(eq(classes.tenantId, tenantId));
  const classMap = new Map(classRows.map(c => [c.id, c.name]));

  // Fetch user names for createdBy
  const userRows = await db
    .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.tenantId, tenantId));
  const userMap = new Map(userRows.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

  return rows.map(row => ({
    id: row.id,
    classId: row.classId,
    className: classMap.get(row.classId) || "Unknown",
    title: row.title,
    description: row.description,
    objectives: (row.objectives as string[]) || [],
    materials: (row.materials as LessonMaterial[]) || [],
    lessonDate: row.lessonDate,
    orderIndex: row.orderIndex,
    createdByName: row.createdBy ? userMap.get(row.createdBy) || null : null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getLessonPlansForClass(tenantId: string, classId: string): Promise<LessonPlan[]> {
  const all = await getLessonPlans(tenantId);
  return all.filter(lp => lp.classId === classId);
}
