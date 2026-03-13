import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getStudentDashboardData } from "@/lib/services/student-dashboard";
import { StudentDashboard } from "@/components/student/StudentDashboard";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const data = await getStudentDashboardData(session.user.tenantId, student.id);

  return (
    <StudentDashboard
      data={data}
      studentName={session.user.name || "Student"}
    />
  );
}
