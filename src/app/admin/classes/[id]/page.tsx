import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { ClassDetailClient } from "@/components/classes/ClassDetailClient";
import { getClassById } from "@/lib/services/classes";
import { getStudents } from "@/lib/services/students";
import { getTeachers } from "@/lib/services/teachers";
import { getSessionsForClass } from "@/lib/services/attendance";
import { getClassrooms } from "@/lib/services/classrooms";

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const tenantId = session.user.tenantId;
  const cls = await getClassById(tenantId, params.id);
  if (!cls) notFound();

  const [allStudents, allTeachers, sessions, classrooms] = await Promise.all([
    getStudents(tenantId),
    getTeachers(tenantId),
    getSessionsForClass(tenantId, cls.id),
    getClassrooms(tenantId),
  ]);

  const students = allStudents.filter(s => cls.studentIds.includes(s.id));
  const teacher = allTeachers.find(t => t.id === cls.teacherId);

  return (
    <ClassDetailClient
      cls={cls}
      students={students}
      allStudents={allStudents}
      allTeachers={allTeachers}
      teacher={teacher}
      sessions={sessions}
      classrooms={classrooms}
    />
  );
}
