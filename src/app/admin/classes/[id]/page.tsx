import { notFound } from "next/navigation";
import { ClassDetailClient } from "@/components/classes/ClassDetailClient";
import { mockClasses, getClassById, getStudentsInClass, getTeacherById, getSessionsForClass } from "@/lib/mock";

export function generateStaticParams() {
  return mockClasses.map(c => ({ id: c.id }));
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const cls = getClassById(params.id);
  if (!cls) notFound();
  return (
    <ClassDetailClient
      cls={cls}
      students={getStudentsInClass(cls.id)}
      teacher={getTeacherById(cls.teacherId)}
      sessions={getSessionsForClass(cls.id)}
    />
  );
}
