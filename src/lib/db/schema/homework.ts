import { pgTable, uuid, text, timestamp, date, pgEnum, jsonb, boolean } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { classes } from "./classes";
import { students } from "./students";
import { users } from "./users";

export const homeworkStatusEnum = pgEnum("homework_status", ["pending", "completed", "overdue"]);

export const homework = pgTable("homework", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  assignedBy: uuid("assigned_by").references(() => users.id, { onDelete: "set null" }),
  attachments: jsonb("attachments").notNull().default([]),
  requiresSubmission: boolean("requires_submission").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  homeworkId: uuid("homework_id").notNull().references(() => homework.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  status: homeworkStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  notes: text("notes"),
  submissionFile: jsonb("submission_file"),
});

export const homeworkTemplates = pgTable("homework_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  attachments: jsonb("attachments").notNull().default([]),
  requiresSubmission: boolean("requires_submission").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbHomework = typeof homework.$inferSelect;
export type NewHomework = typeof homework.$inferInsert;
export type DbHomeworkSubmission = typeof homeworkSubmissions.$inferSelect;
export type NewHomeworkSubmission = typeof homeworkSubmissions.$inferInsert;
export type DbHomeworkTemplate = typeof homeworkTemplates.$inferSelect;
export type NewHomeworkTemplate = typeof homeworkTemplates.$inferInsert;
