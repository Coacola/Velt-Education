import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ActivityEvent, ActivityType } from "@/lib/types/activity";

export async function getRecentActivity(tenantId: string, limit = 15): Promise<ActivityEvent[]> {
  const rows = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.tenantId, tenantId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);

  return rows.map(row => ({
    id: row.id,
    type: row.eventType as ActivityType,
    title: row.title,
    description: row.description,
    timestamp: row.createdAt.toISOString(),
    entityId: row.entityId,
    entityType: row.entityType as ActivityEvent["entityType"],
    severity: row.severity as ActivityEvent["severity"],
  }));
}
