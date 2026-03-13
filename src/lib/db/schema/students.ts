import { pgTable, uuid, text, timestamp, boolean, integer, date, numeric } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  parentUserId: uuid("parent_user_id").references(() => users.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  parentName: text("parent_name").notNull().default(""),
  parentPhone: text("parent_phone").notNull().default(""),
  school: text("school").notNull().default(""),
  year: text("year").notNull().default("Α"),
  monthlyFee: numeric("monthly_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  enrolledSince: date("enrolled_since").notNull().defaultNow(),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbStudent = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
