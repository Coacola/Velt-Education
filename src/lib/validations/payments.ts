import { z } from "zod";

export const createInvoiceSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
    unitPrice: z.number().min(0),
  })).min(1, "At least one item is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  studentId: z.string().uuid("Invalid student ID"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["cash", "bank_transfer", "card"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
