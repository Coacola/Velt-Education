import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().default(""),
  parentName: z.string().default(""),
  parentPhone: z.string().default(""),
  school: z.string().default(""),
  year: z.enum(["Α", "Β", "Γ"]),
  monthlyFee: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
