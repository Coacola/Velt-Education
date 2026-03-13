import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getClassesForStudent } from "@/lib/services/classes";
import { getAttendanceForStudent } from "@/lib/services/student-attendance";
import { StudentAttendanceClient } from "@/components/student/StudentAttendanceClient";

export default async function StudentAttendancePage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const classes = await getClassesForStudent(session.user.tenantId, student.id);
  const enrolledClassIds = classes.map(c => c.id);
  const attendance = await getAttendanceForStudent(session.user.tenantId, student.id, enrolledClassIds);

  return <StudentAttendanceClient attendance={attendance} />;
}
