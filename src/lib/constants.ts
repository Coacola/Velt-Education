import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Classes", href: "/admin/classes", icon: BookOpen },
  { label: "Teachers", href: "/admin/teachers", icon: GraduationCap },
  { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Exams", href: "/admin/exams", icon: FileText },
] as const;

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Greek Literature",
  "History",
  "Informatics",
  "Economics",
] as const;

export const SCHOOL_YEARS = ["Α", "Β", "Γ"] as const;

export const PAYMENT_STATUSES = ["paid", "partial", "overdue"] as const;

export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
] as const;

export const SUBJECT_COLORS: Record<string, string> = {
  Mathematics:       "#6c6cff",
  Physics:           "#34d399",
  Chemistry:         "#f59e0b",
  Biology:           "#ec4899",
  English:           "#06b6d4",
  "Greek Literature":"#f97316",
  History:           "#a78bfa",
  Informatics:       "#10b981",
  Economics:         "#fb7185",
};

export const INSTITUTE_NAME = "Velt Education";
export const INSTITUTE_SUBTITLE = "Private Tutoring Institute";