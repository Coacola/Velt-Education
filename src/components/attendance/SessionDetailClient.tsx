"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { cn, formatDate, getAttendanceStatusStyle } from "@/lib/utils";
import type { AttendanceSession, AttendanceStatus } from "@/lib/types/attendance";

interface SessionDetailClientProps {
  session: AttendanceSession;
}

const statusOptions: AttendanceStatus[] = ["present", "absent", "late", "excused"];

export function SessionDetailClient({ session }: SessionDetailClientProps) {
  const [records, setRecords] = useState(session.records);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  const handleSave = () => {
    toast.success("Attendance saved successfully");
  };

  return (
    <AnimatedPage>
      <Link href="/admin/attendance" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />Back to Attendance
      </Link>
      <GlassCard padding="lg" className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-white/95">{session.className}</h1>
            <p className="text-sm text-white/45 mt-0.5">{formatDate(session.date)} · {session.startTime} - {session.endTime}</p>
            {session.topic && <p className="text-sm text-white/60 mt-1">{session.topic}</p>}
            <p className="text-xs text-white/35 mt-1">Teacher: {session.teacherName}</p>
          </div>
          <GlassBadge variant={session.status === "completed" ? "green" : session.status === "scheduled" ? "blue" : "red"} dot>
            {session.status}
          </GlassBadge>
        </div>
      </GlassCard>

      <GlassCard padding="none">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/70">Mark Attendance</h3>
          <GlassButton variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />} onClick={handleSave}>
            Save Attendance
          </GlassButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8 bg-canvas-900/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => {
                const style = getAttendanceStatusStyle(record.status);
                return (
                  <tr key={record.studentId} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300">
                          {record.studentName[0]}
                        </div>
                        <span className="text-sm font-medium text-white/85">{record.studentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {statusOptions.map(status => {
                          const s = getAttendanceStatusStyle(status);
                          return (
                            <button
                              key={status}
                              onClick={() => updateStatus(record.studentId, status)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border",
                                record.status === status
                                  ? `${s.bg} ${s.color} border-current`
                                  : "text-white/30 border-transparent hover:text-white/50 hover:bg-white/3"
                              )}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </AnimatedPage>
  );
}
