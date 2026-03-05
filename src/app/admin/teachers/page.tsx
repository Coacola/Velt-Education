import { mockTeachers, mockClasses } from "@/lib/mock";
import { TeachersClient } from "@/components/teachers/TeachersClient";

export default function TeachersPage() {
  return <TeachersClient teachers={mockTeachers} classes={mockClasses} />;
}
