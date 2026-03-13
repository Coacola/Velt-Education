"use client";

import { useState } from "react";
import { CalendarCheck, Check, X, Clock, AlertCircle, Search } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { StudentAttendanceSummary } from "@/lib/services/student-attendance";

interface StudentAttendanceClientProps {
  attendance: StudentAttendanceSummary;
}

export function StudentAttendanceClient({ attendance }: StudentAttendanceClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = attendance.records.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.className.toLowerCase().includes(q) || (r.topic || "").toLowerCase().includes(q);
    }
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "present": return <GlassBadge variant="green" size="sm">Present</GlassBadge>;
      case "absent": return <GlassBadge variant="red" size="sm">Absent</GlassBadge>;
      case "late": return <GlassBadge variant="amber" size="sm">Late</GlassBadge>;
      case "excused": return <GlassBadge variant="blue" size="sm">Excused</GlassBadge>;
      default: return null;
    }
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="My Attendance"
        description="Track your class attendance"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white/90">{attendance.rate}%</p>
              <p className="text-[10px] text-white/40">Attendance Rate</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white/90">{attendance.present}</p>
              <p className="text-[10px] text-white/40">Present</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <X className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white/90">{attendance.absent}</p>
              <p className="text-[10px] text-white/40">Absent</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white/90">{attendance.late}</p>
              <p className="text-[10px] text-white/40">Late</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by class or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <div className="flex gap-1">
          {["all", "present", "absent", "late", "excused"].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-white/30 text-center py-8">
            {attendance.records.length === 0 ? "No attendance records yet." : "No records match your filter."}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map(record => (
            <GlassCard key={record.sessionId} padding="sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-white/90 truncate">{record.className}</h4>
                    <GlassBadge size="sm">{record.subject}</GlassBadge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <span>{new Date(record.date).toLocaleDateString("el-GR", { weekday: "short", day: "numeric", month: "short" })}</span>
                    {record.topic && (
                      <>
                        <span className="text-white/15">·</span>
                        <span className="truncate">{record.topic}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {statusBadge(record.status)}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}
