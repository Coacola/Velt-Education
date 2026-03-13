"use client";

import Link from "next/link";
import { Users, BookOpen, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { Class } from "@/lib/types/class";
import type { Student } from "@/lib/types/student";
import type { TodayClass } from "@/lib/services/attendance";

interface TeacherDashboardProps {
  classes: Class[];
  students: Student[];
  todaySchedule: TodayClass[];
  teacherName: string;
}

export function TeacherDashboard({ classes, students, todaySchedule, teacherName }: TeacherDashboardProps) {
  const firstName = teacherName.split(" ").pop() || teacherName;

  const kpis = [
    { label: "My Classes", value: classes.length, icon: BookOpen, color: "text-indigo-400", href: "/teacher/classes" },
    { label: "My Students", value: students.length, icon: Users, color: "text-emerald-400", href: "/teacher/students" },
    { label: "Today's Classes", value: todaySchedule.length, icon: Clock, color: "text-amber-400", href: "/teacher/attendance" },
    { label: "Avg Attendance", value: students.length > 0 ? `${Math.round(students.reduce((s, st) => s + st.attendanceRate, 0) / students.length)}%` : "—", icon: CheckCircle, color: "text-cyan-400", href: "/teacher/attendance" },
  ];

  return (
    <AnimatedPage>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Your teaching dashboard"
      />

      {/* KPI Cards — all clickable */}
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

      {/* Today's Schedule — cards link to attendance */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70">Today&apos;s Schedule</h3>
          {todaySchedule.length > 0 && (
            <Link href="/teacher/attendance" className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors">
              View all →
            </Link>
          )}
        </div>
        {todaySchedule.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-white/30 text-center py-6">No classes scheduled for today.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaySchedule.map(cls => (
              <Link key={cls.classId} href="/teacher/attendance">
                <GlassCard padding="sm" hover className="group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{cls.className}</h4>
                    {cls.attendanceTaken ? (
                      <GlassBadge variant="green" size="sm">Done</GlassBadge>
                    ) : (
                      <GlassBadge variant="amber" size="sm">Pending</GlassBadge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Clock className="w-3 h-3" />
                    <span>{cls.startTime} – {cls.endTime}</span>
                    <span className="text-white/20">·</span>
                    <Users className="w-3 h-3" />
                    <span>{cls.studentCount} students</span>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My Classes Overview — cards link to classes page */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70">My Classes</h3>
          <Link href="/teacher/classes" className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map(cls => (
            <Link key={cls.id} href="/teacher/classes">
              <GlassCard padding="none" hover className="overflow-hidden group cursor-pointer h-full">
                <div className="h-1.5 w-full" style={{ backgroundColor: cls.color }} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-white/90 mb-1 group-hover:text-white transition-colors">{cls.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <GlassBadge size="sm">{cls.subject}</GlassBadge>
                    <GlassBadge variant="brand" size="sm">{cls.year}΄</GlassBadge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Users className="w-3 h-3" />
                    <span>{cls.studentIds.length}/{cls.capacity} students</span>
                  </div>
                  {cls.schedule.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {cls.schedule.map((s, i) => (
                        <p key={i} className="text-[10px] text-white/30">
                          {s.day.slice(0, 3)} {s.startTime}–{s.endTime}{s.room ? ` · ${s.room}` : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}
