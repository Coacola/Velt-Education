import { z } from "zod";

export const createSessionSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  topic: z.string().optional(),
  notes: z.string().optional(),
});

export const attendanceRecordSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  status: z.enum(["present", "absent", "late", "excused"]),
  note: z.string().optional(),
});

export const saveAttendanceSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  records: z.array(attendanceRecordSchema),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SaveAttendanceInput = z.infer<typeof saveAttendanceSchema>;
