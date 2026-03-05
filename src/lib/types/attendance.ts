import type { Subject } from "./class";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  subject: Subject;
  teacherId: string;
  teacherName: string;
  date: string;
  startTime: string;
  endTime: string;
  records: AttendanceRecord[];
  topic?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
}
