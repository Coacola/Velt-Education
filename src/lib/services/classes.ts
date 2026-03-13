import { db } from "@/lib/db";
import { classes, classSchedules, studentClasses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Class, ScheduleSlot, Subject } from "@/lib/types/class";
import type { SchoolYear } from "@/lib/types/student";

export async function getClasses(tenantId: string): Promise<Class[]> {
  const rows = await db
    .select()
    .from(classes)
    .where(and(eq(classes.tenantId, tenantId), eq(classes.isActive, true)))
    .orderBy(classes.name);

  const classIds = rows.map(r => r.id);
  if (classIds.length === 0) return [];

  // Fetch schedules
  const scheduleRows = await db
    .select()
    .from(classSchedules);

  const scheduleMap = new Map<string, ScheduleSlot[]>();
  const seenSchedules = new Set<string>();
  for (const s of scheduleRows) {
    // Deduplicate by classId + day + startTime + endTime
    const key = `${s.classId}-${s.day}-${s.startTime}-${s.endTime}`;
    if (seenSchedules.has(key)) continue;
    seenSchedules.add(key);
    if (!scheduleMap.has(s.classId)) scheduleMap.set(s.classId, []);
    scheduleMap.get(s.classId)!.push({
      day: s.day as ScheduleSlot["day"],
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || undefined,
    });
  }

  // Fetch student enrollments
  const enrollmentRows = await db
    .select({ classId: studentClasses.classId, studentId: studentClasses.studentId })
    .from(studentClasses)
    .where(eq(studentClasses.isActive, true));

  const studentMap = new Map<string, string[]>();
  for (const e of enrollmentRows) {
    if (!studentMap.has(e.classId)) studentMap.set(e.classId, []);
    studentMap.get(e.classId)!.push(e.studentId);
  }

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    subject: row.subject as Subject,
    teacherId: row.teacherId,
    year: row.year as SchoolYear,
    studentIds: studentMap.get(row.id) || [],
    capacity: row.capacity,
    schedule: scheduleMap.get(row.id) || [],
    description: row.description || undefined,
    startDate: row.startDate || "",
    endDate: row.endDate || "",
    color: row.color,
  }));
}

export async function getClassById(tenantId: string, id: string): Promise<Class | undefined> {
  const all = await getClasses(tenantId);
  return all.find(c => c.id === id);
}

export async function getClassesForTeacher(tenantId: string, teacherId: string): Promise<Class[]> {
  const all = await getClasses(tenantId);
  return all.filter(c => c.teacherId === teacherId);
}

export async function getClassesForStudent(tenantId: string, studentId: string): Promise<Class[]> {
  const all = await getClasses(tenantId);
  return all.filter(c => c.studentIds.includes(studentId));
}
