import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getClassesForStudent } from "@/lib/services/classes";
import { getHomeworkForStudent } from "@/lib/services/student-homework";
import { StudentHomeworkClient } from "@/components/student/StudentHomeworkClient";

export default async function StudentHomeworkPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const classes = await getClassesForStudent(session.user.tenantId, student.id);
  const enrolledClassIds = classes.map(c => c.id);
  const homework = await getHomeworkForStudent(session.user.tenantId, student.id, enrolledClassIds);

  return <StudentHomeworkClient homework={homework} />;
}
