import { auth } from "@/lib/auth/config";
import { getSessions, getTodaySchedule } from "@/lib/services/attendance";
import { getClasses } from "@/lib/services/classes";
import { AttendanceClient } from "@/components/attendance/AttendanceClient";
import { redirect } from "next/navigation";

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const [sessions, classes, todayClasses] = await Promise.all([
    getSessions(tenantId),
    getClasses(tenantId),
    getTodaySchedule(tenantId),
  ]);

  return <AttendanceClient sessions={sessions} classes={classes} todayClasses={todayClasses} />;
}
