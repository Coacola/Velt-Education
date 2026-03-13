import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid } from "date-fns";
import type { PaymentStatus } from "./types/student";

const ATHENS_TZ = "Europe/Athens";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("el-CY", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  if (!isValid(d)) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: ATHENS_TZ,
  }).format(d);
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  if (!isValid(d)) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ATHENS_TZ,
  }).format(d);
}

/** Returns a Date object representing "now" in the Europe/Athens timezone */
export function getAthensNow(): Date {
  // Get the current time expressed in Athens timezone parts
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATHENS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find(p => p.type === type)?.value || "0";
  return new Date(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second"))
  );
}

/** Returns today's date string in YYYY-MM-DD format for Athens timezone */
export function getAthensToday(): string {
  const now = getAthensNow();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Returns the day-of-week name (e.g. "Monday") for Athens timezone */
export function getAthensDayName(): string {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return dayNames[getAthensNow().getDay()];
}

export function formatRelative(isoString: string): string {
  const d = new Date(isoString);
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function getAttendanceColor(rate: number): string {
  if (rate >= 0.85) return "text-green-400";
  if (rate >= 0.70) return "text-amber-400";
  return "text-red-400";
}

export function getAttendanceBg(rate: number): string {
  if (rate >= 0.85) return "bg-green-400/10 text-green-400";
  if (rate >= 0.70) return "bg-amber-400/10 text-amber-400";
  return "bg-red-400/10 text-red-400";
}

export function getGradeColor(score: number): string {
  if (score >= 15) return "text-green-400";
  if (score >= 10) return "text-amber-400";
  return "text-red-400";
}

export function getGradeBg(score: number): string {
  if (score >= 15) return "bg-green-400/10 text-green-400";
  if (score >= 10) return "bg-amber-400/10 text-amber-400";
  return "bg-red-400/10 text-red-400";
}

export function getPaymentStatusStyle(status: PaymentStatus) {
  const map = {
    paid:    { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", label: "Paid", dot: "bg-green-400" },
    partial: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "Partial", dot: "bg-amber-400" },
    overdue: { color: "text-red-400",   bg: "bg-red-400/10",   border: "border-red-400/20",   label: "Overdue", dot: "bg-red-400" },
  };
  return map[status];
}

export function getAttendanceStatusStyle(status: "present" | "absent" | "late" | "excused") {
  const map = {
    present: { color: "text-green-400", bg: "bg-green-400/10", label: "Present", dot: "bg-green-400" },
    absent:  { color: "text-red-400",   bg: "bg-red-400/10",   label: "Absent",  dot: "bg-red-400" },
    late:    { color: "text-amber-400", bg: "bg-amber-400/10", label: "Late", dot: "bg-amber-400" },
    excused: { color: "text-white/40",  bg: "bg-white/5",      label: "Excused", dot: "bg-white/30" },
  };
  return map[status];
}

export function getActivityColor(severity: "info" | "warning" | "error" | "success") {
  const map = {
    info:    "bg-blue-400/10 text-blue-400 border-blue-400/20",
    warning: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    error:   "bg-red-400/10 text-red-400 border-red-400/20",
    success: "bg-green-400/10 text-green-400 border-green-400/20",
  };
  return map[severity];
}

export function getActivityIcon(severity: "info" | "warning" | "error" | "success") {
  const map = {
    info:    "●",
    warning: "⚠",
    error:   "✕",
    success: "✓",
  };
  return map[severity];
}

export function avatarUrl(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6c6cff,a78bfa,34d399,f59e0b&backgroundType=gradientLinear&fontFamily=Inter&fontSize=40&fontWeight=600`;
}