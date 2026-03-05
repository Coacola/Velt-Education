import { mockClasses, mockTeachers } from "@/lib/mock";
import { ClassesClient } from "@/components/classes/ClassesClient";

export default function ClassesPage() {
  return <ClassesClient classes={mockClasses} teachers={mockTeachers} />;
}
