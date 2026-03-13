import { z } from "zod";

export const createExamSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  date: z.string().min(1, "Date is required"),
  maxScore: z.number().min(1).default(20),
  notes: z.string().optional(),
});

export const examGradeSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  score: z.number().min(0),
  absent: z.boolean().default(false),
  feedback: z.string().optional(),
});

export const saveGradesSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  grades: z.array(examGradeSchema),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type SaveGradesInput = z.infer<typeof saveGradesSchema>;
