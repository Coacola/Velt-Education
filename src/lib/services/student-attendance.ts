import { db } from "@/lib/db";
import { attendanceSessions, attendanceRecords, classes } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export interface StudentAttendanceRecord {
  sessionId: string;
  classId: string;
  className: string;
  subject: string;
  date: string;
  topic: string | null;
  status: "present" | "absent" | "late" | "excused";
}

export interface StudentAttendanceSummary {
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
  records: StudentAttendanceRecord[];
}

export async function getAttendanceForStudent(
  tenantId: string,
  studentId: string,
  enrolledClassIds: string[],
): Promise<StudentAttendanceSummary> {
  if (enrolledClassIds.length === 0) {
    return { totalSessions: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 0, records: [] };
  }

  // Get completed sessions for enrolled classes
  const sessionRows = await db
    .select()
    .from(attendanceSessions)
    .where(and(eq(attendanceSessions.tenantId, tenantId), eq(attendanceSessions.status, "completed")))
    .orderBy(attendanceSessions.date);

  const mySessions = sessionRows.filter(s => enrolledClassIds.includes(s.classId));
  if (mySessions.length === 0) {
    return { totalSessions: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 0, records: [] };
  }

  const sessionIds = mySessions.map(s => s.id);

  // Get class info
  const classRows = await db
    .select({ id: classes.id, name: classes.name, subject: classes.subject })
    .from(classes)
    .where(eq(classes.tenantId, tenantId));
  const classMap = new Map(classRows.map(c => [c.id, c]));

  // Get attendance records for this student
  const records = await db
    .select()
    .from(attendanceRecords)
    .where(and(
      eq(attendanceRecords.studentId, studentId),
      inArray(attendanceRecords.sessionId, sessionIds),
    ));

  const recordMap = new Map(records.map(r => [r.sessionId, r.status as StudentAttendanceRecord["status"]]));

  let present = 0, absent = 0, late = 0, excused = 0;
  const attendanceRecordsList: StudentAttendanceRecord[] = [];

  for (const session of mySessions) {
    const status = recordMap.get(session.id);
    if (!status) continue; // No record for this session

    const cls = classMap.get(session.classId);
    attendanceRecordsList.push({
      sessionId: session.id,
      classId: session.classId,
      className: cls?.name || "Unknown",
      subject: cls?.subject || "Unknown",
      date: session.date,
      topic: session.topic,
      status,
    });

    switch (status) {
      case "present": present++; break;
      case "absent": absent++; break;
      case "late": late++; break;
      case "excused": excused++; break;
    }
  }

  const total = present + absent + late + excused;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return {
    totalSessions: total,
    present,
    absent,
    late,
    excused,
    rate,
    records: attendanceRecordsList.sort((a, b) => b.date.localeCompare(a.date)),
  };
}
