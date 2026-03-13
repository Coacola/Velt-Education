export interface LessonMaterial {
  title: string;
  url?: string;
  type: "link" | "document" | "video";
}

export interface LessonPlan {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string | null;
  objectives: string[];
  materials: LessonMaterial[];
  lessonDate: string;
  orderIndex: number;
  createdByName: string | null;
  createdAt: string;
}
