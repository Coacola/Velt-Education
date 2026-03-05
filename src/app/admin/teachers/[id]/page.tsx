import { notFound } from "next/navigation";
import { TeacherDetailClient } from "@/components/teachers/TeacherDetailClient";
import { mockTeachers, getTeacherById, getClassesForTeacher } from "@/lib/mock";

export function generateStaticParams() {
  return mockTeachers.map(t => ({ id: t.id }));
}

export default function TeacherDetailPage({ params }: { params: { id: string } }) {
  const teacher = getTeacherById(params.id);
  if (!teacher) notFound();
  return <TeacherDetailClient teacher={teacher} classes={getClassesForTeacher(teacher.id)} />;
}
