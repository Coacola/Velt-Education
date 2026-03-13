import { db } from "@/lib/db";
import { homeworkTemplates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { HomeworkAttachment } from "@/lib/types/homework";

export interface HomeworkTemplate {
  id: string;
  title: string;
  description: string | null;
  attachments: HomeworkAttachment[];
  requiresSubmission: boolean;
  createdAt: string;
}

export async function getTemplatesForTeacher(
  tenantId: string,
  teacherId: string,
): Promise<HomeworkTemplate[]> {
  const rows = await db
    .select()
    .from(homeworkTemplates)
    .where(
      and(
        eq(homeworkTemplates.tenantId, tenantId),
        eq(homeworkTemplates.teacherId, teacherId),
      )
    )
    .orderBy(homeworkTemplates.createdAt);

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    attachments: (row.attachments as HomeworkAttachment[]) || [],
    requiresSubmission: row.requiresSubmission,
    createdAt: row.createdAt.toISOString(),
  }));
}
