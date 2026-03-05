export type ActivityType =
  | "student_enrolled"
  | "payment_received"
  | "payment_overdue"
  | "exam_graded"
  | "session_cancelled"
  | "student_at_risk"
  | "teacher_added"
  | "session_completed"
  | "payment_partial";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  entityId: string;
  entityType: "student" | "class" | "teacher" | "session" | "payment" | "exam";
  severity: "info" | "warning" | "error" | "success";
}
