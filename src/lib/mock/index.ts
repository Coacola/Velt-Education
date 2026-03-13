export { mockStudents } from "./students";
export { mockClasses } from "./classes";
export { mockTeachers } from "./teachers";
export { mockSessions } from "./attendance";
export { mockInvoices } from "./payments";
export { mockExams } from "./exams";
export { mockActivity } from "./activity";

import { mockStudents } from "./students";
import { mockClasses } from "./classes";
import { mockTeachers } from "./teachers";
import { mockSessions } from "./attendance";
import { mockInvoices } from "./payments";
import { mockExams } from "./exams";
import type { Student } from "../types/student";
import type { Class } from "../types/class";
import type { Teacher } from "../types/teacher";
import type { AttendanceSession } from "../types/attendance";
import type { Invoice } from "../types/payment";
import type { Exam } from "../types/exam";

export function getStudentById(id: string): Student | undefined {
  return mockStudents.find(s => s.id === id);
}

export function getClassById(id: string): Class | undefined {
  return mockClasses.find(c => c.id === id);
}

export function getTeacherById(id: string): Teacher | undefined {
  return mockTeachers.find(t => t.id === id);
}

export function getSessionById(id: string): AttendanceSession | undefined {
  return mockSessions.find(s => s.id === id);
}

export function getStudentsInClass(classId: string): Student[] {
  const cls = getClassById(classId);
  if (!cls) return [];
  return cls.studentIds.map(id => getStudentById(id)).filter(Boolean) as Student[];
}

export function getClassesForStudent(studentId: string): Class[] {
  return mockClasses.filter(c => c.studentIds.includes(studentId));
}

export function getSessionsForClass(classId: string): AttendanceSession[] {
  return mockSessions.filter(s => s.classId === classId);
}

export function getInvoicesForStudent(studentId: string): Invoice[] {
  return mockInvoices.filter(i => i.studentId === studentId);
}

export function getExamsForClass(classId: string): Exam[] {
  return mockExams.filter(e => e.classId === classId);
}

export function getClassesForTeacher(teacherId: string): Class[] {
  return mockClasses.filter(c => c.teacherId === teacherId);
}

export function getAtRiskStudents(): Student[] {
  return mockStudents.filter(s => s.atRisk);
}

export function getOverdueInvoices(): Invoice[] {
  return mockInvoices.filter(i => i.status === "overdue");
}

export function getMonthlyCollected(year: number, month: number): number {
  return mockInvoices
    .filter(i => i.paidDate && new Date(i.paidDate).getFullYear() === year && new Date(i.paidDate).getMonth() + 1 === month)
    .reduce((sum, i) => sum + i.paidAmount, 0);
}

export function getTotalOutstanding(): number {
  return mockStudents.reduce((sum, s) => sum + s.outstandingBalance, 0);
}

export function getAverageAttendanceRate(): number {
  const rates = mockStudents.map(s => s.attendanceRate);
  return rates.reduce((a, b) => a + b, 0) / rates.length;
}

// Revenue trend: last 7 months (Sep 2025 - Mar 2026)
export function getRevenueTrend(): { month: string; revenue: number; collected: number }[] {
  return [
    { month: "Sep", revenue: 4200, collected: 3920 },
    { month: "Oct", revenue: 4480, collected: 4200 },
    { month: "Nov", revenue: 4480, collected: 4060 },
    { month: "Dec", revenue: 3640, collected: 3360 },
    { month: "Jan", revenue: 4760, collected: 4060 },
    { month: "Feb", revenue: 4760, collected: 3920 },
    { month: "Mar", revenue: 4760, collected: 1260 },
  ];
}

// Attendance trend: last 4 weeks
export function getAttendanceTrend(): { week: string; present: number; absent: number; late: number }[] {
  return [
    { week: "W2 Feb", present: 88, absent: 8, late: 4 },
    { week: "W3 Feb", present: 79, absent: 14, late: 7 },
    { week: "W4 Feb", present: 85, absent: 10, late: 5 },
    { week: "W1 Mar", present: 83, absent: 11, late: 6 },
  ];
}
