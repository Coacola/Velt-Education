import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  mockStudents, mockActivity, getAtRiskStudents,
  getMonthlyCollected, getTotalOutstanding,
  getAverageAttendanceRate, getRevenueTrend, getAttendanceTrend,
} from "@/lib/mock";

export default function AdminDashboardPage() {
  return (
    <DashboardClient
      students={mockStudents}
      activity={mockActivity}
      totalStudents={mockStudents.length}
      monthlyCollected={getMonthlyCollected(2025, 2)}
      totalOutstanding={getTotalOutstanding()}
      avgAttendance={getAverageAttendanceRate()}
      atRiskStudents={getAtRiskStudents()}
      revenueTrend={getRevenueTrend()}
      attendanceTrend={getAttendanceTrend()}
    />
  );
}
