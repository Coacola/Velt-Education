"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { homeworkTemplates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireTeacherAuth } from "./teacher-utils";
import type { HomeworkAttachment } from "@/lib/types/homework";

interface CreateTemplateInput {
  title: string;
  description?: string;
  attachments: HomeworkAttachment[];
  requiresSubmission: boolean;
}

export async function createTemplateAsTeacher(data: CreateTemplateInput) {
  try {
    const { tenantId, userId } = await requireTeacherAuth();

    const [template] = await db.insert(homeworkTemplates).values({
      tenantId,
      teacherId: userId,
      title: data.title,
      description: data.description || null,
      attachments: data.attachments,
      requiresSubmission: data.requiresSubmission,
    }).returning();

    revalidatePath("/teacher/homework");
    return { data: template };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create template" };
  }
}

export async function deleteTemplateAsTeacher(templateId: string) {
  try {
    const { tenantId, userId } = await requireTeacherAuth();

    const [tpl] = await db
      .select({ id: homeworkTemplates.id })
      .from(homeworkTemplates)
      .where(
        and(
          eq(homeworkTemplates.id, templateId),
          eq(homeworkTemplates.tenantId, tenantId),
          eq(homeworkTemplates.teacherId, userId),
        )
      )
      .limit(1);

    if (!tpl) throw new Error("Template not found");

    await db.delete(homeworkTemplates).where(eq(homeworkTemplates.id, templateId));

    revalidatePath("/teacher/homework");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete template" };
  }
}
