import { z } from "zod";

export const scheduleSlotSchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  room: z.string().optional(),
});

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  subject: z.string().min(1, "Subject is required"),
  teacherId: z.string().uuid("Invalid teacher ID"),
  year: z.enum(["Α", "Β", "Γ"]),
  capacity: z.number().int().min(1).default(20),
  color: z.string().default("#6366f1"),
  description: z.string().optional(),
  schedule: z.array(scheduleSlotSchema).default([]),
});

export const updateClassSchema = createClassSchema.partial();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
