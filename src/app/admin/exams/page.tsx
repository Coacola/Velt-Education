import { mockExams, mockClasses } from "@/lib/mock";
import { ExamsClient } from "@/components/exams/ExamsClient";

export default function ExamsPage() {
  return <ExamsClient exams={mockExams} classes={mockClasses} />;
}
