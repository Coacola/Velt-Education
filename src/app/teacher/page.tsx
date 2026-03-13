import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getTeacherByUserId } from "@/lib/services/teacher-auth";
import { getClassesForTeacher } from "@/lib/services/classes";
import { getStudents } from "@/lib/services/students";
import { getTodaySchedule } from "@/lib/services/attendance";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  const tenantId = session.user.tenantId;
  const [classes, allStudents, todaySchedule] = await Promise.all([
    getClassesForTeacher(tenantId, teacher.id),
    getStudents(tenantId),
    getTodaySchedule(tenantId),
  ]);

  // Only include students enrolled in teacher's classes
  const myStudentIds = new Set(classes.flatMap(c => c.studentIds));
  const myStudents = allStudents.filter(s => myStudentIds.has(s.id));

  // Filter today's schedule to only teacher's classes
  const myClassIds = new Set(classes.map(c => c.id));
  const myTodaySchedule = todaySchedule.filter(s => myClassIds.has(s.classId));

  return (
    <TeacherDashboard
      classes={classes}
      students={myStudents}
      todaySchedule={myTodaySchedule}
      teacherName={session.user.name || "Teacher"}
    />
  );
}
