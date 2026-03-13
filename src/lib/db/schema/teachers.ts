import { pgTable, uuid, text, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subjects: text("subjects").array().notNull().default([]),
  qualifications: text("qualifications").array().notNull().default([]),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  bio: text("bio"),
  joinedDate: text("joined_date").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbTeacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
