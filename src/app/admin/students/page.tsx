import { auth } from "@/lib/auth/config";
import { getStudents } from "@/lib/services/students";
import { StudentsClient } from "@/components/students/StudentsClient";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const students = await getStudents(session.user.tenantId);
  return <StudentsClient initialData={students} />;
}
