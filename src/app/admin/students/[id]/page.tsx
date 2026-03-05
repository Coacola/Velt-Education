import { notFound } from "next/navigation";
import { StudentProfileClient } from "@/components/students/StudentProfileClient";
import {
  mockStudents, getStudentById, getClassesForStudent,
  getInvoicesForStudent, mockSessions, mockExams,
} from "@/lib/mock";

export function generateStaticParams() {
  return mockStudents.map(s => ({ id: s.id }));
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = getStudentById(params.id);
  if (!student) notFound();

  const classes = getClassesForStudent(student.id);
  const invoices = getInvoicesForStudent(student.id);
  const sessions = mockSessions.filter(s => s.records.some(r => r.studentId === student.id));
  const exams = mockExams.filter(e => e.grades.some(g => g.studentId === student.id));

  return (
    <StudentProfileClient
      student={student}
      classes={classes}
      invoices={invoices}
      sessions={sessions}
      exams={exams}
    />
  );
}
