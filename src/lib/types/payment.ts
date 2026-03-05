import type { PaymentStatus } from "./student";

export type PaymentMethod = "cash" | "bank_transfer" | "card";

export interface PaymentLineItem {
  description: string;
  amount: number;
  month: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  items: PaymentLineItem[];
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}
