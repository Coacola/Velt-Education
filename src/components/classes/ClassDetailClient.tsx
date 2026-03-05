"use client";

import Link from "next/link";
import { ArrowLeft, Users, Clock } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { cn, formatPercent, getAttendanceColor } from "@/lib/utils";
import type { Class } from "@/lib/types/class";
import type { Student } from "@/lib/types/student";
import type { Teacher } from "@/lib/types/teacher";
import type { AttendanceSession } from "@/lib/types/attendance";

interface ClassDetailClientProps {
  cls: Class;
  students: Student[];
  teacher: Teacher | undefined;
  sessions: AttendanceSession[];
}

export function ClassDetailClient({ cls, students, teacher, sessions }: ClassDetailClientProps) {
  return (
    <AnimatedPage>
      <Link href="/admin/classes" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />Back to Classes
      </Link>
      <GlassCard padding="lg" className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg font-bold text-white" style={{ backgroundColor: cls.color + "30", color: cls.color }}>
            {cls.subject[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white/95">{cls.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <GlassBadge variant="brand">{cls.year}΄</GlassBadge>
              <GlassBadge>{cls.subject}</GlassBadge>
              {teacher && <span className="text-sm text-white/45">{teacher.fullName}</span>}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{students.length}/{cls.capacity} students</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{cls.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(", ")}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Roster</h3>
          <div className="space-y-2">
            {students.map(s => (
              <Link key={s.id} href={`/admin/students/${s.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300">{s.firstName[0]}</div>
                  <span className="text-sm text-white/85">{s.fullName}</span>
                </div>
                <span className={cn("text-xs font-medium", getAttendanceColor(s.attendanceRate))}>{formatPercent(s.attendanceRate)}</span>
              </Link>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map(ses => (
              <Link key={ses.id} href={`/admin/attendance/${ses.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm text-white/80">{ses.topic || ses.className}</p>
                  <p className="text-xs text-white/35">{ses.date} · {ses.startTime}</p>
                </div>
                <GlassBadge variant={ses.status === "completed" ? "green" : ses.status === "scheduled" ? "blue" : "red"} size="sm">{ses.status}</GlassBadge>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </AnimatedPage>
  );
}
