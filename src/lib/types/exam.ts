import type { Subject } from "./class";

export interface ExamGrade {
  studentId: string;
  studentName: string;
  score: number;
  absent: boolean;
}

export interface Exam {
  id: string;
  title: string;
  classId: string;
  className: string;
  subject: Subject;
  teacherId: string;
  date: string;
  maxScore: number;
  grades: ExamGrade[];
  classAverage: number;
  notes?: string;
  publishedAt?: string | null;
}
