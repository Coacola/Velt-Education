import { z } from "zod";

const attachmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  size: z.number().positive(),
});

export const createHomeworkSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  attachments: z.array(attachmentSchema).default([]),
  requiresSubmission: z.boolean().default(false),
});

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
