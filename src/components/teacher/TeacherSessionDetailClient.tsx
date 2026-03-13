"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { saveAttendanceAsTeacher } from "@/lib/actions/teacher-attendance";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { cn, formatDate, getAttendanceStatusStyle } from "@/lib/utils";
import type { AttendanceSession, AttendanceStatus } from "@/lib/types/attendance";

interface Props {
  session: AttendanceSession;
}

const statusOptions: AttendanceStatus[] = ["present", "absent", "late", "excused"];

export function TeacherSessionDetailClient({ session }: Props) {
  const [records, setRecords] = useState(session.records);
  const [isPending, startTransition] = useTransition();

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  const presentCount = records.filter(r => r.status === "present" || r.status === "late").length;

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveAttendanceAsTeacher({
        sessionId: session.id,
        records: records.map(r => ({
          studentId: r.studentId,
          status: r.status,
          note: r.note || undefined,
        })),
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Attendance saved successfully!");
    });
  };

  const handleMarkAllPresent = () => {
    setRecords(prev => prev.map(r => ({ ...r, status: "present" as AttendanceStatus })));
  };

  return (
    <AnimatedPage>
      <Link
        href="/teacher/attendance"
        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />Back to Attendance
      </Link>

      {/* Session Header */}
      <GlassCard padding="lg" className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-white/95">{session.className}</h1>
            <p className="text-sm text-white/45 mt-0.5">
              {formatDate(session.date)} · {session.startTime} - {session.endTime}
            </p>
            {session.topic && <p className="text-sm text-white/60 mt-1">{session.topic}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-3">
              <p className="text-xs text-white/35">Attendance</p>
              <p className="text-sm font-semibold text-white/80">{presentCount}/{records.length}</p>
            </div>
            <GlassBadge
              variant={session.status === "completed" ? "green" : session.status === "scheduled" ? "blue" : "red"}
              dot
            >
              {session.status}
            </GlassBadge>
          </div>
        </div>
      </GlassCard>

      {/* Attendance Table */}
      <GlassCard padding="none">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/70">Mark Attendance</h3>
          <div className="flex items-center gap-2">
            <GlassButton
              variant="ghost"
              size="sm"
              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
              onClick={handleMarkAllPresent}
            >
              All Present
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Attendance"}
            </GlassButton>
          </div>
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
              {records.map(record => (
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
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-12 text-center">
                    <Users className="w-8 h-8 text-white/15 mx-auto mb-2" />
                    <p className="text-sm text-white/30">No students enrolled in this class.</p>
                    <p className="text-xs text-white/20 mt-1">Enroll students in the class to take attendance.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </AnimatedPage>
  );
}
