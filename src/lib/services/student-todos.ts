import { db } from "@/lib/db";
import { studentTodos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { StudentTodo } from "@/lib/types/todo";

export async function getTodosForStudent(
  tenantId: string,
  studentId: string,
): Promise<StudentTodo[]> {
  const rows = await db
    .select()
    .from(studentTodos)
    .where(and(eq(studentTodos.tenantId, tenantId), eq(studentTodos.studentId, studentId)))
    .orderBy(studentTodos.createdAt);

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    isCompleted: row.isCompleted,
    dueDate: row.dueDate,
    createdAt: row.createdAt.toISOString(),
  }));
}
