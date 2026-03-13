"use server";

import { db } from "@/lib/db";
import { studentTodos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireStudentAuth } from "./student-utils";

export async function createTodo(data: { title: string; description?: string; dueDate?: string }) {
  const { studentId, tenantId } = await requireStudentAuth();

  await db.insert(studentTodos).values({
    tenantId,
    studentId,
    title: data.title,
    description: data.description || null,
    dueDate: data.dueDate || null,
  });

  revalidatePath("/student/todos");
  revalidatePath("/student");
}

export async function toggleTodo(todoId: string) {
  const { studentId } = await requireStudentAuth();

  // Fetch current state
  const [todo] = await db
    .select({ isCompleted: studentTodos.isCompleted })
    .from(studentTodos)
    .where(and(eq(studentTodos.id, todoId), eq(studentTodos.studentId, studentId)))
    .limit(1);

  if (!todo) throw new Error("Todo not found");

  await db
    .update(studentTodos)
    .set({
      isCompleted: !todo.isCompleted,
      updatedAt: new Date(),
    })
    .where(and(eq(studentTodos.id, todoId), eq(studentTodos.studentId, studentId)));

  revalidatePath("/student/todos");
  revalidatePath("/student");
}

export async function deleteTodo(todoId: string) {
  const { studentId } = await requireStudentAuth();

  await db
    .delete(studentTodos)
    .where(and(eq(studentTodos.id, todoId), eq(studentTodos.studentId, studentId)));

  revalidatePath("/student/todos");
  revalidatePath("/student");
}

export async function updateTodo(todoId: string, data: { title: string; description?: string; dueDate?: string }) {
  const { studentId } = await requireStudentAuth();

  await db
    .update(studentTodos)
    .set({
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
      updatedAt: new Date(),
    })
    .where(and(eq(studentTodos.id, todoId), eq(studentTodos.studentId, studentId)));

  revalidatePath("/student/todos");
  revalidatePath("/student");
}
