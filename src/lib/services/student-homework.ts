import { db } from "@/lib/db";
import { homework, homeworkSubmissions, classes, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Homework, HomeworkAttachment } from "@/lib/types/homework";

export async function getHomeworkForStudent(
  tenantId: string,
  studentId: string,
  enrolledClassIds: string[],
): Promise<Homework[]> {
  if (enrolledClassIds.length === 0) return [];

  const hwRows = await db
    .select()
    .from(homework)
    .where(eq(homework.tenantId, tenantId))
    .orderBy(homework.dueDate);

  const myHomework = hwRows.filter(h => enrolledClassIds.includes(h.classId));
  if (myHomework.length === 0) return [];

  // Get class names
  const classRows = await db
    .select({ id: classes.id, name: classes.name, subject: classes.subject })
    .from(classes)
    .where(eq(classes.tenantId, tenantId));
  const classMap = new Map(classRows.map(c => [c.id, c]));

  // Get assigner names
  const userRows = await db
    .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.tenantId, tenantId));
  const userMap = new Map(userRows.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

  // Get submissions for this student
  const submissionRows = await db
    .select()
    .from(homeworkSubmissions)
    .where(eq(homeworkSubmissions.studentId, studentId));
  const submissionMap = new Map(submissionRows.map(s => [s.homeworkId, s]));

  return myHomework.map(hw => {
    const cls = classMap.get(hw.classId);
    const submission = submissionMap.get(hw.id);

    // Determine status: if no submission or pending, check if overdue
    let status = submission?.status || "pending";
    if (status === "pending" && new Date(hw.dueDate) < new Date(new Date().toDateString())) {
      status = "overdue";
    }

    return {
      id: hw.id,
      classId: hw.classId,
      className: cls?.name || "Unknown",
      subject: cls?.subject || "Unknown",
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate,
      assignedByName: hw.assignedBy ? userMap.get(hw.assignedBy) || null : null,
      status: status as Homework["status"],
      submittedAt: submission?.submittedAt?.toISOString() || null,
      submissionId: submission?.id || null,
      attachments: (hw.attachments as HomeworkAttachment[]) || [],
      requiresSubmission: hw.requiresSubmission,
      submissionFile: (submission?.submissionFile as HomeworkAttachment) || null,
    };
  });
}
