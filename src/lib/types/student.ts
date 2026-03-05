export type SchoolYear = "Α" | "Β" | "Γ";
export type PaymentStatus = "paid" | "partial" | "overdue";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  year: SchoolYear;
  school: string;
  enrolledClassIds: string[];
  subjects: string[];
  paymentStatus: PaymentStatus;
  outstandingBalance: number;
  attendanceRate: number;
  avgGrade: number;
  atRisk: boolean;
  riskReason: string[];
  enrolledSince: string;
  notes?: string;
}
