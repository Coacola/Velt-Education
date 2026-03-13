import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getTeachers } from "@/lib/services/teachers";
import { TeacherClassesClient } from "@/components/teacher/TeacherClassesClient";

export default async function TeacherClassesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, teachers] = await Promise.all([
    getClassesForTeacher(tenantId, teacher.id),
    getTeachers(tenantId),
  ]);

  return <TeacherClassesClient classes={classes} teachers={teachers} />;
}
