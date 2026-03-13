"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Clock, Pencil, Trash2, UserPlus, UserMinus, Search, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassModal } from "@/components/glass/GlassModal";
import { EditClassModal } from "@/components/classes/EditClassModal";
import { deleteClass, enrollStudentInClass, removeStudentFromClass } from "@/lib/actions/classes";
import { cn, formatPercent, getAttendanceColor } from "@/lib/utils";
import type { Class } from "@/lib/types/class";
import type { Student } from "@/lib/types/student";
import type { Teacher } from "@/lib/types/teacher";
import type { AttendanceSession } from "@/lib/types/attendance";
import type { Classroom } from "@/lib/services/classrooms";

interface ClassDetailClientProps {
  cls: Class;
  students: Student[];
  allStudents: Student[];
  allTeachers: Teacher[];
  teacher: Teacher | undefined;
  sessions: AttendanceSession[];
  classrooms?: Classroom[];
}

export function ClassDetailClient({ cls, students, allStudents, allTeachers, teacher, sessions, classrooms = [] }: ClassDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);

  // Multi-select enroll state
  const [enrollSearch, setEnrollSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Students not already enrolled
  const availableStudents = useMemo(
    () => allStudents.filter(s => !cls.studentIds.includes(s.id)),
    [allStudents, cls.studentIds]
  );

  // Filtered available students by search (name + phone)
  const filteredAvailable = useMemo(() => {
    if (!enrollSearch.trim()) return availableStudents;
    const q = enrollSearch.toLowerCase().trim();
    return availableStudents.filter(s => {
      const nameMatch = s.fullName.toLowerCase().includes(q);
      const phoneMatch = (s.phone || "").toLowerCase().includes(q) || (s.parentPhone || "").toLowerCase().includes(q);
      return nameMatch || phoneMatch;
    });
  }, [availableStudents, enrollSearch]);

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteClass(cls.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Class deleted");
      router.push("/admin/classes");
    });
  };

  const handleEnrollMultiple = () => {
    if (selectedStudentIds.size === 0) {
      toast.error("Please select at least one student");
      return;
    }
    startTransition(async () => {
      let enrolled = 0;
      let failed = 0;
      const ids = Array.from(selectedStudentIds);
      for (const studentId of ids) {
        const result = await enrollStudentInClass(studentId, cls.id);
        if ("error" in result) {
          failed++;
        } else {
          enrolled++;
        }
      }
      if (enrolled > 0) {
        toast.success(`Enrolled ${enrolled} student${enrolled > 1 ? "s" : ""}`);
      }
      if (failed > 0) {
        toast.error(`Failed to enroll ${failed} student${failed > 1 ? "s" : ""}`);
      }
      setSelectedStudentIds(new Set());
      setEnrollSearch("");
      setEnrollOpen(false);
    });
  };

  const handleRemove = (student: Student) => {
    setRemoveTarget(student);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    startTransition(async () => {
      const result = await removeStudentFromClass(removeTarget.id, cls.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`${removeTarget.fullName} removed from class`);
      setRemoveTarget(null);
    });
  };

  return (
    <AnimatedPage>
      <Link href="/admin/classes" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />Back to Classes
      </Link>

      {/* Class header */}
      <GlassCard padding="lg" className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg font-bold text-white" style={{ backgroundColor: cls.color + "30", color: cls.color }}>
            {cls.subject[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-white/95">{cls.name}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <GlassButton variant="ghost" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setEditOpen(true)}>
                  Edit
                </GlassButton>
                <GlassButton variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteOpen(true)} className="text-red-400 hover:text-red-300">
                  Delete
                </GlassButton>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <GlassBadge variant="brand">{cls.year}΄</GlassBadge>
              <GlassBadge>{cls.subject}</GlassBadge>
              {teacher && <span className="text-sm text-white/45">{teacher.fullName}</span>}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-white/40 flex-wrap">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{students.length}/{cls.capacity} students</span>
            </div>
            {/* Prominent schedule */}
            {cls.schedule.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {cls.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20">
                    <Clock className="w-3 h-3 text-brand-400" />
                    <span className="text-xs font-medium text-brand-300">{s.day}</span>
                    <span className="text-xs text-white/50">{s.startTime} – {s.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Roster */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70">Roster ({students.length})</h3>
            <GlassButton variant="ghost" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setEnrollOpen(true)}>
              Enroll
            </GlassButton>
          </div>
          {students.length === 0 ? (
            <p className="text-xs text-white/30 italic py-4 text-center">No students enrolled yet.</p>
          ) : (
            <div className="space-y-1">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                  <Link href={`/admin/students/${s.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300">{s.firstName[0]}</div>
                    <div className="min-w-0">
                      <span className="text-sm text-white/85 block truncate">{s.fullName}</span>
                      <span className="text-xs text-white/30">{s.year}΄</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", getAttendanceColor(s.attendanceRate))}>{formatPercent(s.attendanceRate)}</span>
                    <button
                      onClick={() => handleRemove(s)}
                      className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all p-1"
                      title="Remove from class"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Recent Sessions */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Recent Sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-xs text-white/30 italic py-4 text-center">No sessions recorded yet.</p>
          ) : (
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
          )}
        </GlassCard>
      </div>

      {/* Edit Modal */}
      <EditClassModal cls={cls} teachers={allTeachers} classrooms={classrooms} open={editOpen} onClose={() => setEditOpen(false)} />

      {/* Delete Confirmation */}
      <GlassModal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Class" description="This action cannot be undone." size="sm"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setDeleteOpen(false)} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleDelete} disabled={isPending} className="!bg-red-500/20 !text-red-300 hover:!bg-red-500/30">
              {isPending ? "Deleting..." : "Delete"}
            </GlassButton>
          </>
        }
      >
        <p className="text-sm text-white/60">
          Are you sure you want to delete <strong className="text-white/80">{cls.name}</strong>? All enrolled students will be un-enrolled.
        </p>
      </GlassModal>

      {/* Enroll Students Modal — multi-select with search */}
      <GlassModal
        open={enrollOpen}
        onClose={() => { setEnrollOpen(false); setEnrollSearch(""); setSelectedStudentIds(new Set()); }}
        title="Enroll Students"
        description={`Add students to ${cls.name}`}
        size="md"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => { setEnrollOpen(false); setEnrollSearch(""); setSelectedStudentIds(new Set()); }} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleEnrollMultiple} disabled={isPending || selectedStudentIds.size === 0}>
              {isPending ? "Enrolling..." : `Enroll ${selectedStudentIds.size > 0 ? `(${selectedStudentIds.size})` : ""}`}
            </GlassButton>
          </>
        }
      >
        {availableStudents.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-4">All students are already enrolled in this class.</p>
        ) : (
          <div className="space-y-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={enrollSearch}
                onChange={e => setEnrollSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
                autoFocus
              />
            </div>

            {/* Selected count */}
            {selectedStudentIds.size > 0 && (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-brand-300 font-medium">{selectedStudentIds.size} student{selectedStudentIds.size > 1 ? "s" : ""} selected</span>
                <button onClick={() => setSelectedStudentIds(new Set())} className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
            )}

            {/* Student list */}
            <div className="max-h-72 overflow-y-auto space-y-0.5 -mx-1 px-1">
              {filteredAvailable.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-6">No students match your search.</p>
              ) : (
                filteredAvailable.map(s => {
                  const isSelected = selectedStudentIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStudentSelection(s.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left",
                        isSelected
                          ? "bg-brand-500/15 border border-brand-500/30"
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {/* Checkbox indicator */}
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected
                          ? "bg-brand-500 border-brand-500"
                          : "border-white/20 bg-white/5"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {/* Student info */}
                      <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300 flex-shrink-0">
                        {s.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white/85 block truncate">{s.fullName}</span>
                        <div className="flex items-center gap-2 text-xs text-white/35">
                          <span>{s.year}΄ Lyceum</span>
                          {s.phone && <span>· {s.phone}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </GlassModal>

      {/* Remove Student Confirmation */}
      <GlassModal open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remove Student" description="Remove this student from the class." size="sm"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setRemoveTarget(null)} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={confirmRemove} disabled={isPending} className="!bg-red-500/20 !text-red-300 hover:!bg-red-500/30">
              {isPending ? "Removing..." : "Remove"}
            </GlassButton>
          </>
        }
      >
        <p className="text-sm text-white/60">
          Remove <strong className="text-white/80">{removeTarget?.fullName}</strong> from {cls.name}?
        </p>
      </GlassModal>
    </AnimatedPage>
  );
}
