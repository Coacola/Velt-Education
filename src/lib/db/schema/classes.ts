import { pgTable, uuid, text, timestamp, boolean, integer, date, time, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { teachers } from "./teachers";
import { students } from "./students";

export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  year: text("year").notNull().default("Α"),
  capacity: integer("capacity").notNull().default(20),
  color: text("color").notNull().default("#6366f1"),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classSchedules = pgTable("class_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  day: text("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room"),
}, (table) => ({
  uniqueSchedule: uniqueIndex("class_schedules_unique_idx").on(table.classId, table.day, table.startTime),
}));

export const studentClasses = pgTable("student_classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  enrolledAt: date("enrolled_at").notNull().defaultNow(),
  withdrawnAt: date("withdrawn_at"),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
  uniqueEnrollment: uniqueIndex("student_classes_unique_idx").on(table.studentId, table.classId),
}));

export type DbClass = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type DbClassSchedule = typeof classSchedules.$inferSelect;
export type NewClassSchedule = typeof classSchedules.$inferInsert;
export type DbStudentClass = typeof studentClasses.$inferSelect;
export type NewStudentClass = typeof studentClasses.$inferInsert;
