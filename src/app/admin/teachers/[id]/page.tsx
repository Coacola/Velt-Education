import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { TeacherDetailClient } from "@/components/teachers/TeacherDetailClient";
import { getTeacherById } from "@/lib/services/teachers";
import { getClassesForTeacher } from "@/lib/services/classes";

export default async function TeacherDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const teacher = await getTeacherById(tenantId, params.id);
  if (!teacher) notFound();

  const classes = await getClassesForTeacher(tenantId, teacher.id);
  return <TeacherDetailClient teacher={teacher} classes={classes} />;
}
