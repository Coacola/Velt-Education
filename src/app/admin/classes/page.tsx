import { auth } from "@/lib/auth/config";
import { getClasses } from "@/lib/services/classes";
import { getTeachers } from "@/lib/services/teachers";
import { getClassrooms } from "@/lib/services/classrooms";
import { ClassesClient } from "@/components/classes/ClassesClient";
import { redirect } from "next/navigation";

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, teachers, classrooms] = await Promise.all([
    getClasses(tenantId),
    getTeachers(tenantId),
    getClassrooms(tenantId),
  ]);

  return <ClassesClient classes={classes} teachers={teachers} classrooms={classrooms} />;
}
