import { auth } from "@/lib/auth/config";
import { getTeachers } from "@/lib/services/teachers";
import { getClasses } from "@/lib/services/classes";
import { TeachersClient } from "@/components/teachers/TeachersClient";
import { redirect } from "next/navigation";

export default async function TeachersPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const [teachers, classes] = await Promise.all([
    getTeachers(tenantId),
    getClasses(tenantId),
  ]);

  return <TeachersClient teachers={teachers} classes={classes} />;
}
