import { pgTable, uuid, text, timestamp, boolean, date, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { classes } from "./classes";
import { students } from "./students";
import { users } from "./users";

export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "completed", "cancelled"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late", "excused"]);

export const attendanceSessions = pgTable("attendance_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  topic: text("topic"),
  notes: text("notes"),
  status: sessionStatusEnum("status").notNull().default("scheduled"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => attendanceSessions.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull().default("absent"),
  note: text("note"),
  markedAt: timestamp("marked_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueRecord: uniqueIndex("attendance_records_unique_idx").on(table.sessionId, table.studentId),
}));

export type DbAttendanceSession = typeof attendanceSessions.$inferSelect;
export type NewAttendanceSession = typeof attendanceSessions.$inferInsert;
export type DbAttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
