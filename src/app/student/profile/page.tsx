import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getStudentById } from "@/lib/services/students";
import { getClassesForStudent } from "@/lib/services/classes";
import { StudentProfileClient } from "@/components/student/StudentProfileClient";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const studentLink = await getStudentByUserId(session.user.id);
  if (!studentLink) redirect("/login");

  const [student, classes] = await Promise.all([
    getStudentById(session.user.tenantId, studentLink.id),
    getClassesForStudent(session.user.tenantId, studentLink.id),
  ]);

  if (!student) redirect("/login");

  return <StudentProfileClient student={student} classes={classes} />;
}
