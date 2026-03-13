"use server";

import { db } from "@/lib/db";
import { homeworkSubmissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireStudentAuth } from "./student-utils";
import type { HomeworkAttachment } from "@/lib/types/homework";

export async function markHomeworkComplete(homeworkId: string) {
  const { studentId } = await requireStudentAuth();

  await db
    .update(homeworkSubmissions)
    .set({
      status: "completed",
      submittedAt: new Date(),
    })
    .where(
      and(
        eq(homeworkSubmissions.homeworkId, homeworkId),
        eq(homeworkSubmissions.studentId, studentId),
      )
    );

  revalidatePath("/student/homework");
  revalidatePath("/student");
}

export async function markHomeworkPending(homeworkId: string) {
  const { studentId } = await requireStudentAuth();

  await db
    .update(homeworkSubmissions)
    .set({
      status: "pending",
      submittedAt: null,
      submissionFile: null,
    })
    .where(
      and(
        eq(homeworkSubmissions.homeworkId, homeworkId),
        eq(homeworkSubmissions.studentId, studentId),
      )
    );

  revalidatePath("/student/homework");
  revalidatePath("/student");
}

export async function submitHomeworkFile(
  homeworkId: string,
  file: HomeworkAttachment,
) {
  const { studentId } = await requireStudentAuth();

  await db
    .update(homeworkSubmissions)
    .set({
      status: "completed",
      submittedAt: new Date(),
      submissionFile: file,
    })
    .where(
      and(
        eq(homeworkSubmissions.homeworkId, homeworkId),
        eq(homeworkSubmissions.studentId, studentId),
      )
    );

  revalidatePath("/student/homework");
  revalidatePath("/student");
}
