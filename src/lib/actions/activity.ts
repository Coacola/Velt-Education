"use server";

import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";

interface LogActivityInput {
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  title: string;
  description: string;
  severity?: "info" | "warning" | "error" | "success";
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: LogActivityInput) {
  await db.insert(activityLog).values({
    tenantId: input.tenantId,
    eventType: input.eventType,
    entityType: input.entityType,
    entityId: input.entityId,
    actorId: input.actorId || null,
    title: input.title,
    description: input.description,
    severity: input.severity || "info",
    metadata: input.metadata || {},
  });
}
