import { db } from "@/lib/db";
import { attendanceSessions, attendanceRecords, classes, teachers, students } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { AttendanceSession, AttendanceRecord } from "@/lib/types/attendance";
import type { Subject } from "@/lib/types/class";
import { getAthensToday, getAthensDayName } from "@/lib/utils";

export async function getSessions(tenantId: string): Promise<AttendanceSession[]> {
  const rows = await db
    .select()
    .from(attendanceSessions)
    .where(eq(attendanceSessions.tenantId, tenantId))
    .orderBy(attendanceSessions.date);

  if (rows.length === 0) return [];

  // Fetch class and teacher info
  const classRows = await db
    .select({ id: classes.id, name: classes.name, subject: classes.subject, teacherId: classes.teacherId })
    .from(classes)
    .where(eq(classes.tenantId, tenantId));
  const classMap = new Map(classRows.map(c => [c.id, c]));

  const teacherRows = await db
    .select({ id: teachers.id, firstName: teachers.firstName, lastName: teachers.lastName })
    .from(teachers)
    .where(eq(teachers.tenantId, tenantId));
  const teacherMap = new Map(teacherRows.map(t => [t.id, `${t.firstName} ${t.lastName}`]));

  // Fetch student names
  const studentRows = await db
    .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
    .from(students)
    .where(eq(students.tenantId, tenantId));
  const studentNameMap = new Map(studentRows.map(s => [s.id, `${s.firstName} ${s.lastName}`]));

  // Fetch all attendance records for these sessions
  const sessionIds = rows.map(r => r.id);
  const recordRows = await db
    .select()
    .from(attendanceRecords)
    .where(inArray(attendanceRecords.sessionId, sessionIds));

  const recordMap = new Map<string, AttendanceRecord[]>();
  for (const r of recordRows) {
    if (!recordMap.has(r.sessionId)) recordMap.set(r.sessionId, []);
    recordMap.get(r.sessionId)!.push({
      studentId: r.studentId,
      studentName: studentNameMap.get(r.studentId) || "Unknown",
      status: r.status,
      note: r.note || undefined,
    });
  }

  return rows.map(row => {
    const cls = classMap.get(row.classId);
    return {
      id: row.id,
      classId: row.classId,
      className: cls?.name || "Unknown",
      subject: (cls?.subject || "Mathematics") as Subject,
      teacherId: cls?.teacherId || "",
      teacherName: cls?.teacherId ? teacherMap.get(cls.teacherId) || "Unknown" : "Unknown",
      date: row.date,
      startTime: row.startTime || "",
      endTime: row.endTime || "",
      records: recordMap.get(row.id) || [],
      topic: row.topic || undefined,
      notes: row.notes || undefined,
      status: row.status,
    };
  });
}

export async function getSessionById(tenantId: string, id: string): Promise<AttendanceSession | undefined> {
  const all = await getSessions(tenantId);
  return all.find(s => s.id === id);
}

export async function getSessionsForClass(tenantId: string, classId: string): Promise<AttendanceSession[]> {
  const all = await getSessions(tenantId);
  return all.filter(s => s.classId === classId);
}

export interface TodayClass {
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  studentCount: number;
  attendanceTaken: boolean;
  sessionId?: string;
}

export async function getTodaySchedule(tenantId: string): Promise<TodayClass[]> {
  const todayDay = getAthensDayName();
  const todayDate = getAthensToday();

  // Get all class schedules for today's day of week
  const { classSchedules, studentClasses } = await import("@/lib/db/schema");
  const scheduleRows = await db
    .select()
    .from(classSchedules)
    .where(eq(classSchedules.day, todayDay));

  if (scheduleRows.length === 0) return [];

  const classIds = Array.from(new Set(scheduleRows.map(s => s.classId)));

  // Get class info
  const classRows = await db
    .select({ id: classes.id, name: classes.name, subject: classes.subject, teacherId: classes.teacherId })
    .from(classes)
    .where(and(eq(classes.tenantId, tenantId), eq(classes.isActive, true)));
  const classMap = new Map(classRows.map(c => [c.id, c]));

  // Filter to only classes belonging to this tenant
  const tenantClassIds = classIds.filter(id => classMap.has(id));
  if (tenantClassIds.length === 0) return [];

  // Get teacher names
  const teacherRows = await db
    .select({ id: teachers.id, firstName: teachers.firstName, lastName: teachers.lastName })
    .from(teachers)
    .where(eq(teachers.tenantId, tenantId));
  const teacherMap = new Map(teacherRows.map(t => [t.id, `${t.firstName} ${t.lastName}`]));

  // Get student counts per class
  const enrollmentRows = await db
    .select({ classId: studentClasses.classId, studentId: studentClasses.studentId })
    .from(studentClasses)
    .where(eq(studentClasses.isActive, true));
  const studentCountMap = new Map<string, number>();
  for (const e of enrollmentRows) {
    studentCountMap.set(e.classId, (studentCountMap.get(e.classId) || 0) + 1);
  }

  // Check which classes already have attendance sessions for today
  const sessionRows = await db
    .select({ id: attendanceSessions.id, classId: attendanceSessions.classId, status: attendanceSessions.status })
    .from(attendanceSessions)
    .where(and(eq(attendanceSessions.tenantId, tenantId), eq(attendanceSessions.date, todayDate)));
  const sessionMap = new Map(sessionRows.map(s => [s.classId, s]));

  return tenantClassIds.map(classId => {
    const cls = classMap.get(classId)!;
    const schedule = scheduleRows.find(s => s.classId === classId)!;
    const session = sessionMap.get(classId);
    return {
      classId,
      className: cls.name,
      subject: cls.subject,
      teacherName: cls.teacherId ? teacherMap.get(cls.teacherId) || "Unknown" : "Unknown",
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      studentCount: studentCountMap.get(classId) || 0,
      attendanceTaken: session?.status === "completed",
      sessionId: session?.id,
    };
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
}
