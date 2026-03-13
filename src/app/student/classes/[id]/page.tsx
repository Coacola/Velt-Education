import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getStudentByUserId } from "@/lib/services/student-auth";
import { getClassById } from "@/lib/services/classes";
import { getTeachers } from "@/lib/services/teachers";
import { getLessonPlansForClass } from "@/lib/services/lesson-plans";
import { StudentClassDetailClient } from "@/components/student/StudentClassDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentClassDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) redirect("/login");

  const student = await getStudentByUserId(session.user.id);
  if (!student) redirect("/login");

  const cls = await getClassById(session.user.tenantId, id);
  if (!cls) notFound();

  // Verify student is enrolled
  if (!cls.studentIds.includes(student.id)) notFound();

  const [teachers, lessonPlans] = await Promise.all([
    getTeachers(session.user.tenantId),
    getLessonPlansForClass(session.user.tenantId, id),
  ]);

  const teacherName = teachers.find(t => t.id === cls.teacherId)
    ? `${teachers.find(t => t.id === cls.teacherId)!.firstName} ${teachers.find(t => t.id === cls.teacherId)!.lastName}`
    : "Unknown Teacher";

  return (
    <StudentClassDetailClient
      classData={cls}
      teacherName={teacherName}
      lessonPlans={lessonPlans}
    />
  );
}
