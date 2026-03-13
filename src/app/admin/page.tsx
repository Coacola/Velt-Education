import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { auth } from "@/lib/auth/config";
import { getStudents } from "@/lib/services/students";
import { getRecentActivity } from "@/lib/services/activity";
import { getDashboardKpis, getRevenueTrend, getAttendanceTrend } from "@/lib/services/dashboard";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;

  const [students, activity, kpis] = await Promise.all([
    getStudents(tenantId),
    getRecentActivity(tenantId),
    getDashboardKpis(tenantId),
  ]);

  const atRiskStudents = students.filter(s => s.atRisk);

  return (
    <DashboardClient
      students={students}
      activity={activity}
      totalStudents={kpis.totalStudents}
      monthlyCollected={kpis.monthlyCollected}
      totalOutstanding={kpis.totalOutstanding}
      avgAttendance={kpis.avgAttendance}
      atRiskStudents={atRiskStudents}
      revenueTrend={getRevenueTrend()}
      attendanceTrend={getAttendanceTrend()}
    />
  );
}
