import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getHomeworkForTeacher } from "@/lib/services/teacher-homework";
import { getTemplatesForTeacher } from "@/lib/services/teacher-templates";
import { TeacherHomeworkClient } from "@/components/teacher/TeacherHomeworkClient";

export default async function TeacherHomeworkPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, homework, templates] = await Promise.all([
    getClassesForTeacher(tenantId, teacher.id),
    getHomeworkForTeacher(tenantId, teacher.id),
    getTemplatesForTeacher(tenantId, session.user.id),
  ]);

  return <TeacherHomeworkClient homework={homework} classes={classes} templates={templates} />;
}
