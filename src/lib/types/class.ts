import type { SchoolYear } from "./student";

export type Subject =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "English"
  | "Greek Literature"
  | "History"
  | "Informatics"
  | "Economics";

export interface ScheduleSlot {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  startTime: string;
  endTime: string;
  room?: string;
}

export interface Class {
  id: string;
  name: string;
  subject: Subject;
  teacherId: string;
  year: SchoolYear;
  studentIds: string[];
  capacity: number;
  schedule: ScheduleSlot[];
  description?: string;
  startDate: string;
  endDate: string;
  color: string;
}
