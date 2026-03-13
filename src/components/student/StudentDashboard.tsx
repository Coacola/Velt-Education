"use client";

import Link from "next/link";
import {
  BookOpen, BarChart3, CalendarCheck, ClipboardList,
  Clock, ArrowUpRight, AlertCircle, CheckCircle,
} from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { StudentDashboardData } from "@/lib/services/student-dashboard";

interface StudentDashboardProps {
  data: StudentDashboardData;
  studentName: string;
}

export function StudentDashboard({ data, studentName }: StudentDashboardProps) {
  const firstName = studentName.split(" ")[0] || studentName;

  const kpis = [
    { label: "My Classes", value: data.classCount, icon: BookOpen, color: "text-indigo-400", href: "/student/classes" },
    { label: "Attendance", value: `${data.attendanceRate}%`, icon: CalendarCheck, color: "text-emerald-400", href: "/student/attendance" },
    { label: "Avg Grade", value: data.averageGrade !== null ? `${data.averageGrade}/20` : "—", icon: BarChart3, color: "text-cyan-400", href: "/student/grades" },
    { label: "Pending HW", value: data.pendingHomeworkCount, icon: ClipboardList, color: "text-amber-400", href: "/student/homework" },
  ];

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <AnimatedPage>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Your student dashboard"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map(kpi => (
          <Link key={kpi.label} href={kpi.href}>
            <GlassCard padding="sm" hover className="group cursor-pointer h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white/90">{kpi.value}</p>
                  <p className="text-[10px] text-white/40">{kpi.label}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/0 group-hover:text-white/30 transition-colors flex-shrink-0" />
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70">Today&apos;s Schedule</h3>
          <Link href="/student/classes" className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors">
            All classes →
          </Link>
        </div>
        {data.todaySchedule.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-white/30 text-center py-6">No classes scheduled for today.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.todaySchedule.map(cls => (
              <Link key={cls.classId} href={`/student/classes/${cls.classId}`}>
                <GlassCard padding="sm" hover className="group cursor-pointer h-full">
                  <h4 className="text-sm font-semibold text-white/90 mb-1 group-hover:text-white transition-colors">
                    {cls.className}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{cls.startTime} – {cls.endTime}</span>
                    {cls.room && (
                      <>
                        <span className="text-white/20">·</span>
                        <span>{cls.room}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-white/30">{cls.teacherName}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Homework */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70">Upcoming Homework</h3>
            <Link href="/student/homework" className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </div>
          {data.upcomingHomework.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-white/30 text-center py-6">No pending homework — nice!</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {data.upcomingHomework.map(hw => (
                <Link key={hw.id} href="/student/homework">
                  <GlassCard padding="sm" hover className="group cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                          {hw.title}
                        </h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{hw.className}</p>
                      </div>
                      <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                        {isOverdue(hw.dueDate) ? (
                          <AlertCircle className="w-3 h-3 text-red-400" />
                        ) : null}
                        <span className={`text-[10px] ${isOverdue(hw.dueDate) ? "text-red-400" : "text-white/40"}`}>
                          {new Date(hw.dueDate).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70">Recent Grades</h3>
            <Link href="/student/grades" className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </div>
          {data.recentGrades.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-white/30 text-center py-6">No published grades yet.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {data.recentGrades.map((grade, i) => {
                const pct = (grade.score / grade.maxScore) * 100;
                const color = pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400";
                return (
                  <Link key={i} href="/student/grades">
                    <GlassCard padding="sm" hover className="group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                            {grade.examTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <GlassBadge size="sm">{grade.subject}</GlassBadge>
                            <span className="text-[10px] text-white/30">
                              {new Date(grade.date).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className={`text-sm font-bold ${color}`}>
                            {grade.score}/{grade.maxScore}
                          </p>
                          <p className="text-[10px] text-white/30">avg: {grade.classAverage.toFixed(1)}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
