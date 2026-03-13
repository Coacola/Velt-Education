"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, CheckCircle, Clock, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { cn, formatDate } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import { createSessionAsTeacher } from "@/lib/actions/teacher-attendance";
import type { AttendanceSession } from "@/lib/types/attendance";
import type { Class } from "@/lib/types/class";
import type { TodayClass } from "@/lib/services/attendance";

interface TeacherAttendanceClientProps {
  sessions: AttendanceSession[];
  classes: Class[];
  todaySchedule: TodayClass[];
}

export function TeacherAttendanceClient({ sessions, classes, todaySchedule }: TeacherAttendanceClientProps) {
  const router = useRouter();
  const [classFilter, setClassFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
    if (classFilter === "all") return sorted;
    return sorted.filter(s => s.classId === classFilter);
  }, [sessions, classFilter]);

  const handleStartAttendance = (todayCls: TodayClass) => {
    if (todayCls.sessionId) {
      // Session already exists — navigate to it
      router.push(`/teacher/attendance/${todayCls.sessionId}`);
      return;
    }

    // Create a new session and navigate to it
    startTransition(async () => {
      const today = new Date().toISOString().split("T")[0];
      const result = await createSessionAsTeacher({
        classId: todayCls.classId,
        date: today,
        startTime: todayCls.startTime,
        endTime: todayCls.endTime,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        toast.success("Session created!");
        router.push(`/teacher/attendance/${result.data.id}`);
      }
    });
  };

  const handleNewSession = (classId: string, date: string) => {
    startTransition(async () => {
      const cls = classes.find(c => c.id === classId);
      const result = await createSessionAsTeacher({
        classId,
        date,
        startTime: cls?.schedule[0]?.startTime,
        endTime: cls?.schedule[0]?.endTime,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        toast.success("Session created!");
        setShowNewModal(false);
        router.push(`/teacher/attendance/${result.data.id}`);
      }
    });
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Attendance"
        description={`${filtered.length} session${filtered.length !== 1 ? "s" : ""}`}
        actions={
          <GlassButton
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowNewModal(true)}
          >
            New Session
          </GlassButton>
        }
      />

      {/* Today's Classes Hero */}
      {todaySchedule.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            Today&apos;s Classes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaySchedule.map(tc => (
              <GlassCard
                key={tc.classId}
                hover
                padding="sm"
                className="cursor-pointer"
                onClick={() => handleStartAttendance(tc)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">{tc.className}</h4>
                    <p className="text-xs text-white/40">{tc.subject}</p>
                  </div>
                  {tc.attendanceTaken ? (
                    <GlassBadge variant="green" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />Taken
                    </GlassBadge>
                  ) : (
                    <GlassBadge variant="amber" size="sm">
                      <AlertCircle className="w-3 h-3 mr-1" />Not Taken
                    </GlassBadge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/45">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tc.startTime} – {tc.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {tc.studentCount} students
                  </span>
                </div>
                {!tc.attendanceTaken && (
                  <p className="text-[10px] text-brand-400 mt-2 font-medium">
                    Click to take attendance →
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">History</h3>
        <select
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          className={cn(
            "px-3 py-2 rounded-xl text-xs font-medium border bg-transparent transition-colors focus:outline-none appearance-none cursor-pointer",
            classFilter !== "all"
              ? "border-brand-500/40 text-brand-300 bg-brand-500/10"
              : "border-white/10 text-white/50 hover:border-white/20"
          )}
        >
          <option value="all" className="bg-gray-900">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
          ))}
        </select>
      </div>

      {/* Session History */}
      <motion.div
        className="space-y-3"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {filtered.map(session => {
          const presentCount = session.records.filter(r => r.status === "present" || r.status === "late").length;
          const totalCount = session.records.length;
          return (
            <motion.div key={session.id} variants={listItemVariants}>
              <Link href={`/teacher/attendance/${session.id}`}>
                <GlassCard hover padding="sm" className="cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white/90">{session.className}</h4>
                      <p className="text-xs text-white/40">{formatDate(session.date)} · {session.startTime}–{session.endTime}</p>
                    </div>
                    <GlassBadge
                      variant={session.status === "completed" ? "green" : "amber"}
                      size="sm"
                    >
                      {session.status === "completed" ? "Completed" : "Scheduled"}
                    </GlassBadge>
                  </div>
                  {session.topic && (
                    <p className="text-xs text-white/35 mb-2 italic">{session.topic}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400/70" />
                      {presentCount}/{totalCount} present
                    </span>
                  </div>
                  {/* Compact student chips */}
                  {session.records.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {session.records.map(r => (
                        <span
                          key={r.studentId}
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded",
                            r.status === "present" ? "bg-emerald-500/10 text-emerald-400/70" :
                            r.status === "late" ? "bg-amber-500/10 text-amber-400/70" :
                            "bg-red-500/10 text-red-400/70"
                          )}
                        >
                          {r.studentName.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-white/30">No attendance sessions found.</p>
          </div>
        )}
      </motion.div>

      {/* New Session Modal */}
      {showNewModal && (
        <NewSessionModal
          classes={classes}
          onClose={() => setShowNewModal(false)}
          onCreate={handleNewSession}
          isPending={isPending}
        />
      )}
    </AnimatedPage>
  );
}

// ── New Session Modal ─────────────────────────────
interface NewSessionModalProps {
  classes: Class[];
  onClose: () => void;
  onCreate: (classId: string, date: string) => void;
  isPending: boolean;
}

function NewSessionModal({ classes, onClose, onCreate, isPending }: NewSessionModalProps) {
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-canvas-900/95 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-white/95 mb-4">New Attendance Session</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Class</label>
            <select
              value={classId}
              onChange={e => setClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <GlassButton variant="ghost" size="sm" onClick={onClose}>Cancel</GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => onCreate(classId, date)}
            disabled={isPending || !classId || !date}
          >
            {isPending ? "Creating..." : "Create & Take Attendance"}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
