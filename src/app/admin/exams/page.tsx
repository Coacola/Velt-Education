import { auth } from "@/lib/auth/config";
import { getExams } from "@/lib/services/exams";
import { getClasses } from "@/lib/services/classes";
import { ExamsClient } from "@/components/exams/ExamsClient";
import { redirect } from "next/navigation";

export default async function ExamsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const [exams, classes] = await Promise.all([
    getExams(tenantId),
    getClasses(tenantId),
  ]);

  return <ExamsClient exams={exams} classes={classes} />;
}
