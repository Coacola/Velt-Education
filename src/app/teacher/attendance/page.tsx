import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getSessions, getTodaySchedule } from "@/lib/services/attendance";
import { TeacherAttendanceClient } from "@/components/teacher/TeacherAttendanceClient";

export default async function TeacherAttendancePage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, allSessions, allTodaySchedule] = await Promise.all([
    getClassesForTeacher(tenantId, teacher.id),
    getSessions(tenantId),
    getTodaySchedule(tenantId),
  ]);

  const myClassIds = new Set(classes.map(c => c.id));
  const mySessions = allSessions.filter(s => myClassIds.has(s.classId));
  const myTodaySchedule = allTodaySchedule.filter(t => myClassIds.has(t.classId));

  return (
    <TeacherAttendanceClient
      sessions={mySessions}
      classes={classes}
      todaySchedule={myTodaySchedule}
    />
  );
}
