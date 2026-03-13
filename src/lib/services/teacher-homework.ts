import { db } from "@/lib/db";
import { homework, homeworkSubmissions, classes, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { HomeworkAttachment } from "@/lib/types/homework";

export interface TeacherHomework {
  id: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  description: string | null;
  dueDate: string;
  attachments: HomeworkAttachment[];
  requiresSubmission: boolean;
  submissionCount: number;
  completedCount: number;
  studentCount: number;
  createdAt: string;
}

export async function getHomeworkForTeacher(
  tenantId: string,
  teacherId: string,
): Promise<TeacherHomework[]> {
  // Get teacher's classes
  const teacherClasses = await db
    .select({ id: classes.id, name: classes.name, subject: classes.subject })
    .from(classes)
    .where(and(eq(classes.tenantId, tenantId), eq(classes.teacherId, teacherId), eq(classes.isActive, true)));

  const classIds = teacherClasses.map(c => c.id);
  if (classIds.length === 0) return [];

  const classMap = new Map(teacherClasses.map(c => [c.id, c]));

  // Get all homework for teacher's classes
  const hwRows = await db
    .select()
    .from(homework)
    .where(eq(homework.tenantId, tenantId))
    .orderBy(homework.dueDate);

  const myHomework = hwRows.filter(h => classIds.includes(h.classId));
  if (myHomework.length === 0) return [];

  // Get submission stats
  const allSubmissions = await db
    .select()
    .from(homeworkSubmissions);

  const submissionsByHw = new Map<string, { total: number; completed: number }>();
  for (const sub of allSubmissions) {
    if (!submissionsByHw.has(sub.homeworkId)) {
      submissionsByHw.set(sub.homeworkId, { total: 0, completed: 0 });
    }
    const stats = submissionsByHw.get(sub.homeworkId)!;
    stats.total++;
    if (sub.status === "completed") stats.completed++;
  }

  return myHomework.map(hw => {
    const cls = classMap.get(hw.classId);
    const stats = submissionsByHw.get(hw.id) || { total: 0, completed: 0 };

    return {
      id: hw.id,
      classId: hw.classId,
      className: cls?.name || "Unknown",
      subject: cls?.subject || "Unknown",
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate,
      attachments: (hw.attachments as HomeworkAttachment[]) || [],
      requiresSubmission: hw.requiresSubmission,
      submissionCount: stats.total,
      completedCount: stats.completed,
      studentCount: stats.total,
      createdAt: hw.createdAt.toISOString(),
    };
  });
}
