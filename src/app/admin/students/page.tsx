import { mockStudents } from "@/lib/mock";
import { StudentsClient } from "@/components/students/StudentsClient";

export default function StudentsPage() {
  return <StudentsClient initialData={mockStudents} />;
}
