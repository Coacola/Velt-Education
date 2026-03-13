import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getTodosForStudent } from "@/lib/services/student-todos";
import { StudentTodosClient } from "@/components/student/StudentTodosClient";

export default async function StudentTodosPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const todos = await getTodosForStudent(session.user.tenantId, student.id);

  return <StudentTodosClient todos={todos} />;
}
