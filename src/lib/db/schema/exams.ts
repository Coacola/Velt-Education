import { pgTable, uuid, text, timestamp, boolean, date, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { classes } from "./classes";
import { students } from "./students";

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  date: date("date").notNull(),
  maxScore: numeric("max_score", { precision: 5, scale: 1 }).notNull().default("20"),
  weight: numeric("weight", { precision: 3, scale: 1 }).notNull().default("1"),
  notes: text("notes"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const examGrades = pgTable("exam_grades", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  score: numeric("score", { precision: 5, scale: 1 }).notNull(),
  absent: boolean("absent").notNull().default(false),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueGrade: uniqueIndex("exam_grades_unique_idx").on(table.examId, table.studentId),
}));

export type DbExam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;
export type DbExamGrade = typeof examGrades.$inferSelect;
export type NewExamGrade = typeof examGrades.$inferInsert;
