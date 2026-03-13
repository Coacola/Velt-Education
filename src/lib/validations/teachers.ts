import { z } from "zod";

export const createTeacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().default(""),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  qualifications: z.array(z.string()).default([]),
  hourlyRate: z.number().min(0).default(0),
  bio: z.string().optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
