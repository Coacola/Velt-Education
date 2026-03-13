export type HomeworkStatus = "pending" | "completed" | "overdue";

export interface HomeworkAttachment {
  name: string;
  url: string;
  size: number;
}

export interface Homework {
  id: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  description: string | null;
  dueDate: string;
  assignedByName: string | null;
  status: HomeworkStatus;
  submittedAt: string | null;
  submissionId: string | null;
  attachments: HomeworkAttachment[];
  requiresSubmission: boolean;
  submissionFile: HomeworkAttachment | null;
}
