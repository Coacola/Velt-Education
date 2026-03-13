"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { createSession } from "@/lib/actions/attendance";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassTable } from "@/components/glass/GlassTable";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { AttendanceSession } from "@/lib/types/attendance";
import type { Class } from "@/lib/types/class";
import type { TodayClass } from "@/lib/services/attendance";

const col = createColumnHelper<AttendanceSession>();

type DateFilter = "all" | "today" | "week" | "month" | "custom";

interface AttendanceClientProps {
  sessions: AttendanceSession[];
  classes: Class[];
  todayClasses: TodayClass[];
}

export function AttendanceClient({ sessions, classes, todayClasses }: AttendanceClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Form state
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [topic, setTopic] = useState("");

  const resetForm = () => {
    setClassId("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setTopic("");
  };

  const handleCreate = () => {
    if (!classId) {
      toast.error("Please select a class");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    startTransition(async () => {
      const result = await createSession({
        classId,
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        topic: topic || undefined,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Session created successfully");
      resetForm();
      setCreateOpen(false);
    });
  };

  // Date filtering
  const filteredSessions = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    let filtered = sessions;

    if (dateFilter === "today") {
      filtered = sessions.filter(s => s.date === todayStr);
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split("T")[0];
      filtered = sessions.filter(s => s.date >= weekStr && s.date <= todayStr);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthStr = monthAgo.toISOString().split("T")[0];
      filtered = sessions.filter(s => s.date >= monthStr && s.date <= todayStr);
    } else if (dateFilter === "custom" && customFrom && customTo) {
      filtered = sessions.filter(s => s.date >= customFrom && s.date <= customTo);
    }

    // Sort newest first
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, dateFilter, customFrom, customTo]);

  const takenCount = todayClasses.filter(c => c.attendanceTaken).length;

  const columns = [
    col.accessor("className", { header: "Class", size: 200 }),
    col.accessor("date", { header: "Date", cell: i => formatDate(i.getValue()), size: 120 }),
    col.accessor("teacherName", { header: "Teacher", size: 180 }),
    col.display({
      id: "attendance",
      header: "Attendance",
      cell: i => {
        const r = i.row.original.records;
        const present = r.filter(x => x.status === "present" || x.status === "late").length;
        return <span className="text-white/70">{present}/{r.length}</span>;
      },
      size: 100,
    }),
    col.accessor("status", {
      header: "Status",
      cell: i => (
        <GlassBadge variant={i.getValue() === "completed" ? "green" : i.getValue() === "scheduled" ? "blue" : "red"} dot size="sm">
          {i.getValue()}
        </GlassBadge>
      ),
      size: 120,
    }),
  ];

  return (
    <AnimatedPage>
      <PageHeader
        title="Attendance"
        description={`${sessions.length} sessions total`}
        actions={<GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>New Session</GlassButton>}
      />

      {/* Today's Classes Hero */}
      <GlassCard padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white/90 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              Today&apos;s Classes
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              {todayClasses.length === 0
                ? "No classes scheduled for today"
                : `${takenCount} of ${todayClasses.length} attendance taken`}
            </p>
          </div>
          {todayClasses.length > 0 && (
            <GlassBadge variant={takenCount === todayClasses.length ? "green" : "amber"} size="sm">
              {takenCount}/{todayClasses.length} done
            </GlassBadge>
          )}
        </div>

        {todayClasses.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-6 italic">No classes scheduled for today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayClasses.map(tc => (
              <div
                key={tc.classId}
                className={`relative p-4 rounded-xl border transition-colors cursor-pointer ${
                  tc.attendanceTaken
                    ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30"
                    : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30"
                }`}
                onClick={() => {
                  if (tc.sessionId) {
                    router.push(`/admin/attendance/${tc.sessionId}`);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white/85">{tc.className}</h4>
                  {tc.attendanceTaken ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-white/40 mb-1">{tc.teacherName}</p>
                <div className="flex items-center gap-3 text-xs text-white/35">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tc.startTime} – {tc.endTime}
                  </span>
                  <span>{tc.studentCount} students</span>
                </div>
                <div className="mt-2">
                  <GlassBadge size="sm" variant={tc.attendanceTaken ? "green" : "amber"}>
                    {tc.attendanceTaken ? "Taken" : "Pending"}
                  </GlassBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* History section with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="w-full sm:w-64">
          <GlassInput placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "today", "week", "month", "custom"] as DateFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                dateFilter === f
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                  : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
              }`}
            >
              {f === "all" ? "All" : f === "today" ? "Today" : f === "week" ? "This Week" : f === "month" ? "This Month" : "Custom"}
            </button>
          ))}
        </div>
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-brand-500" />
            <span className="text-white/30 text-xs">to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-brand-500" />
          </div>
        )}
      </div>

      <GlassTable
        columns={columns}
        data={filteredSessions}
        onRowClick={row => router.push(`/admin/attendance/${row.id}`)}
        globalFilter={debouncedSearch}
        mobileCardRenderer={(session) => {
          const r = session.records;
          const present = r.filter(x => x.status === "present" || x.status === "late").length;
          return (
            <div className="glass-panel p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/90">{session.className}</p>
                <GlassBadge variant={session.status === "completed" ? "green" : session.status === "scheduled" ? "blue" : "red"} dot size="sm">
                  {session.status}
                </GlassBadge>
              </div>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{formatDate(session.date)}</span>
                <span>{session.teacherName}</span>
                <span>{present}/{r.length} present</span>
              </div>
            </div>
          );
        }}
      />

      <GlassModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Session" size="md"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setCreateOpen(false)} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleCreate} disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlassSelect label="Class" value={classId} onChange={e => setClassId(e.target.value)} options={classes.map(c => ({value:c.id,label:c.name}))} />
          <GlassInput label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <GlassInput label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            <GlassInput label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <GlassInput label="Topic" placeholder="Lesson topic (optional)" value={topic} onChange={e => setTopic(e.target.value)} />
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
