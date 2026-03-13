import { db } from "@/lib/db";
import {
  classes, classSchedules, studentClasses, attendanceSessions, attendanceRecords,
  exams, examGrades, homework, homeworkSubmissions, students, teachers,
} from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import type { Subject } from "@/lib/types/class";
import { getAthensDayName } from "@/lib/utils";

export interface StudentDashboardData {
  classCount: number;
  attendanceRate: number;
  averageGrade: number | null;
  pendingHomeworkCount: number;
  todaySchedule: StudentScheduleItem[];
  upcomingHomework: UpcomingHomeworkItem[];
  recentGrades: RecentGradeItem[];
}

export interface StudentScheduleItem {
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface UpcomingHomeworkItem {
  id: string;
  title: string;
  className: string;
  subject: string;
  dueDate: string;
  status: string;
}

export interface RecentGradeItem {
  examTitle: string;
  className: string;
  subject: string;
  score: number;
  maxScore: number;
  classAverage: number;
  date: string;
}

export async function getStudentDashboardData(
  tenantId: string,
  studentId: string,
): Promise<StudentDashboardData> {
  // 1. Get student's enrolled classes
  const enrollmentRows = await db
    .select({ classId: studentClasses.classId })
    .from(studentClasses)
    .where(and(eq(studentClasses.studentId, studentId), eq(studentClasses.isActive, true)));

  const enrolledClassIds = new Set(enrollmentRows.map(r => r.classId));
  const classCount = enrolledClassIds.size;

  if (classCount === 0) {
    return {
      classCount: 0,
      attendanceRate: 0,
      averageGrade: null,
      pendingHomeworkCount: 0,
      todaySchedule: [],
      upcomingHomework: [],
      recentGrades: [],
    };
  }

  // 2. Fetch class info + teacher names
  const classRows = await db
    .select({
      id: classes.id, name: classes.name, subject: classes.subject,
      teacherId: classes.teacherId, color: classes.color,
    })
    .from(classes)
    .where(eq(classes.tenantId, tenantId));
  const classMap = new Map(classRows.map(c => [c.id, c]));

  const teacherRows = await db
    .select({ id: teachers.id, firstName: teachers.firstName, lastName: teachers.lastName })
    .from(teachers)
    .where(eq(teachers.tenantId, tenantId));
  const teacherMap = new Map(teacherRows.map(t => [t.id, `${t.firstName} ${t.lastName}`]));

  // 3. Attendance rate — all sessions for enrolled classes where student has records
  const sessionRows = await db
    .select({ id: attendanceSessions.id, classId: attendanceSessions.classId })
    .from(attendanceSessions)
    .where(and(eq(attendanceSessions.tenantId, tenantId), eq(attendanceSessions.status, "completed")));

  const mySessionIds = sessionRows
    .filter(s => enrolledClassIds.has(s.classId))
    .map(s => s.id);

  let attendanceRate = 0;
  if (mySessionIds.length > 0) {
    const records = await db
      .select({ status: attendanceRecords.status })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, studentId));

    const myRecords = records.filter(r => true); // all records for this student
    const total = myRecords.length;
    const present = myRecords.filter(r => r.status === "present" || r.status === "late").length;
    attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
  }

  // 4. Average grade — published exams only
  const examRows = await db
    .select({
      id: exams.id, classId: exams.classId, title: exams.title, subject: exams.subject,
      date: exams.date, maxScore: exams.maxScore, publishedAt: exams.publishedAt,
    })
    .from(exams)
    .where(and(eq(exams.tenantId, tenantId), isNotNull(exams.publishedAt)));

  const publishedExamsInMyClasses = examRows.filter(e => enrolledClassIds.has(e.classId));
  const publishedExamIds = publishedExamsInMyClasses.map(e => e.id);

  let averageGrade: number | null = null;
  const recentGrades: RecentGradeItem[] = [];

  if (publishedExamIds.length > 0) {
    // Fetch this student's grades
    const myGrades = await db
      .select({ examId: examGrades.examId, score: examGrades.score, absent: examGrades.absent })
      .from(examGrades)
      .where(eq(examGrades.studentId, studentId));

    const myGradeMap = new Map(myGrades.map(g => [g.examId, g]));

    // Also fetch all grades for class averages
    const allGradeRows = await db
      .select({ examId: examGrades.examId, score: examGrades.score, absent: examGrades.absent })
      .from(examGrades);

    const examAvgMap = new Map<string, number>();
    const examGradeGroups = new Map<string, number[]>();
    for (const g of allGradeRows) {
      if (g.absent) continue;
      if (!examGradeGroups.has(g.examId)) examGradeGroups.set(g.examId, []);
      examGradeGroups.get(g.examId)!.push(parseFloat(g.score));
    }
    Array.from(examGradeGroups.entries()).forEach(([eid, scores]) => {
      examAvgMap.set(eid, scores.reduce((a, b) => a + b, 0) / scores.length);
    });

    // Calculate avg + populate recent grades
    const scoredGrades: number[] = [];
    for (const exam of publishedExamsInMyClasses) {
      const grade = myGradeMap.get(exam.id);
      if (grade && !grade.absent) {
        const score = parseFloat(grade.score);
        scoredGrades.push(score);
        const cls = classMap.get(exam.classId);
        recentGrades.push({
          examTitle: exam.title,
          className: cls?.name || "Unknown",
          subject: cls?.subject || exam.subject,
          score,
          maxScore: parseFloat(exam.maxScore),
          classAverage: examAvgMap.get(exam.id) || 0,
          date: exam.date,
        });
      }
    }

    if (scoredGrades.length > 0) {
      averageGrade = Math.round((scoredGrades.reduce((a, b) => a + b, 0) / scoredGrades.length) * 10) / 10;
    }

    // Sort recent grades by date descending
    recentGrades.sort((a, b) => b.date.localeCompare(a.date));
  }

  // 5. Homework — pending count + upcoming list
  const hwRows = await db
    .select({
      id: homework.id, classId: homework.classId, title: homework.title, dueDate: homework.dueDate,
    })
    .from(homework)
    .where(eq(homework.tenantId, tenantId));

  const myHomework = hwRows.filter(h => enrolledClassIds.has(h.classId));

  // Get submissions for this student
  const submissionRows = await db
    .select({ homeworkId: homeworkSubmissions.homeworkId, status: homeworkSubmissions.status })
    .from(homeworkSubmissions)
    .where(eq(homeworkSubmissions.studentId, studentId));
  const submissionMap = new Map(submissionRows.map(s => [s.homeworkId, s.status]));

  const pendingHomeworkCount = myHomework.filter(h => {
    const status = submissionMap.get(h.id);
    return !status || status === "pending";
  }).length;

  const upcomingHomework: UpcomingHomeworkItem[] = myHomework
    .filter(h => {
      const status = submissionMap.get(h.id);
      return !status || status === "pending";
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)
    .map(h => {
      const cls = classMap.get(h.classId);
      return {
        id: h.id,
        title: h.title,
        className: cls?.name || "Unknown",
        subject: cls?.subject || "Unknown",
        dueDate: h.dueDate,
        status: submissionMap.get(h.id) || "pending",
      };
    });

  // 6. Today's schedule
  const todayDay = getAthensDayName();
  const scheduleRows = await db
    .select()
    .from(classSchedules)
    .where(eq(classSchedules.day, todayDay));

  const todaySchedule: StudentScheduleItem[] = scheduleRows
    .filter(s => enrolledClassIds.has(s.classId))
    .map(s => {
      const cls = classMap.get(s.classId);
      const teacherName = cls?.teacherId ? teacherMap.get(cls.teacherId) || "Unknown" : "Unknown";
      return {
        classId: s.classId,
        className: cls?.name || "Unknown",
        subject: cls?.subject || "Unknown",
        teacherName,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room || undefined,
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    classCount,
    attendanceRate,
    averageGrade,
    pendingHomeworkCount,
    todaySchedule,
    upcomingHomework,
    recentGrades: recentGrades.slice(0, 5),
  };
}
