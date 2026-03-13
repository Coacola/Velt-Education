import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const classrooms = pgTable("classrooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueName: uniqueIndex("classrooms_tenant_name_idx").on(table.tenantId, table.name),
}));

export type DbClassroom = typeof classrooms.$inferSelect;
export type NewClassroom = typeof classrooms.$inferInsert;
