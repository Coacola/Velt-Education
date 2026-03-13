"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Plus, Users, Clock, Trash2, LayoutGrid, Calendar, Filter, Search, X, DoorOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createClass } from "@/lib/actions/classes";
import { createClassroom, deleteClassroom } from "@/lib/actions/classrooms";
import type { Classroom } from "@/lib/services/classrooms";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { cn } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Class, ScheduleSlot } from "@/lib/types/class";
import type { Teacher } from "@/lib/types/teacher";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
const GRADE_MAP: Record<string, string> = { "Α": "Α΄ Lyceum", "Β": "Β΄ Lyceum", "Γ": "Γ΄ Lyceum" };

type ViewMode = "grid" | "calendar";

interface ClassesClientProps {
  classes: Class[];
  teachers: Teacher[];
  classrooms?: Classroom[];
}

export function ClassesClient({ classes, teachers, classrooms: initialClassrooms = [] }: ClassesClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filters
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");

  // Classrooms state
  const [localClassrooms, setLocalClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [newRoomName, setNewRoomName] = useState("");
  const [manageRoomsOpen, setManageRoomsOpen] = useState(false);

  // Form state
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [year, setYear] = useState("Α");
  const [teacherId, setTeacherId] = useState("");
  const [capacity, setCapacity] = useState("8");
  const [scheduleSlots, setScheduleSlots] = useState<Array<{ day: (typeof DAYS)[number]; startTime: string; endTime: string; room?: string }>>([]);

  // Derived data for filters
  const subjects = useMemo(() => {
    const set = new Set<string>();
    for (const c of classes) set.add(c.subject);
    return Array.from(set).sort();
  }, [classes]);

  const activeTeachers = useMemo(() => {
    const ids = new Set(classes.map(c => c.teacherId));
    return teachers.filter(t => ids.has(t.id));
  }, [classes, teachers]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    let filtered = classes;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q));
    }
    if (gradeFilter !== "all") {
      filtered = filtered.filter(c => c.year === gradeFilter);
    }
    if (subjectFilter !== "all") {
      filtered = filtered.filter(c => c.subject === subjectFilter);
    }
    if (teacherFilter !== "all") {
      filtered = filtered.filter(c => c.teacherId === teacherFilter);
    }
    return filtered;
  }, [classes, search, gradeFilter, subjectFilter, teacherFilter]);

  const handleAddClassroom = async () => {
    const name = newRoomName.trim();
    if (!name) return;
    const result = await createClassroom(name);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    if (result.data) {
      setLocalClassrooms(prev => {
        if (prev.some(r => r.id === result.data!.id)) return prev;
        return [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name));
      });
      toast.success(`Classroom "${name}" added`);
    }
    setNewRoomName("");
  };

  const handleDeleteClassroom = async (id: string) => {
    const result = await deleteClassroom(id);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setLocalClassrooms(prev => prev.filter(r => r.id !== id));
    // Also clear room from any slots using the deleted classroom
    const deleted = localClassrooms.find(r => r.id === id);
    if (deleted) {
      setScheduleSlots(prev => prev.map(s => s.room === deleted.name ? { ...s, room: undefined } : s));
    }
    toast.success("Classroom removed");
  };

  const resetForm = () => {
    setClassName("");
    setSubject("Mathematics");
    setYear("Α");
    setTeacherId("");
    setCapacity("8");
    setScheduleSlots([]);
    setNewRoomName("");
    setManageRoomsOpen(false);
  };

  const addSlot = () => {
    setScheduleSlots(prev => [...prev, { day: "Monday", startTime: "17:00", endTime: "18:30" }]);
  };

  const removeSlot = (index: number) => {
    setScheduleSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    setScheduleSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleCreate = () => {
    if (!className.trim()) {
      toast.error("Class name is required");
      return;
    }
    if (!teacherId) {
      toast.error("Please select a teacher");
      return;
    }
    startTransition(async () => {
      const result = await createClass({
        name: className,
        subject,
        year: year as "Α" | "Β" | "Γ",
        teacherId,
        capacity: parseInt(capacity) || 8,
        color: "#6366f1",
        schedule: scheduleSlots as Array<{ day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"; startTime: string; endTime: string; room?: string }>,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`Class "${className}" created successfully`);
      resetForm();
      setCreateOpen(false);
    });
  };

  // Build calendar data — group schedules by day
  const calendarSlots = useMemo(() => {
    const slots: Array<{
      cls: Class;
      teacher: Teacher | undefined;
      slot: ScheduleSlot;
      startMinutes: number;
      durationMinutes: number;
    }> = [];

    for (const cls of filteredClasses) {
      const teacher = teachers.find(t => t.id === cls.teacherId);
      for (const slot of cls.schedule) {
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);
        const startMinutes = sh * 60 + sm;
        const durationMinutes = (eh * 60 + em) - startMinutes;
        slots.push({ cls, teacher, slot, startMinutes, durationMinutes });
      }
    }
    return slots;
  }, [filteredClasses, teachers]);

  const hasFilters = gradeFilter !== "all" || subjectFilter !== "all" || teacherFilter !== "all" || search.trim() !== "";

  return (
    <AnimatedPage>
      <PageHeader
        title="Classes"
        description={`${filteredClasses.length} class${filteredClasses.length !== 1 ? "es" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center gap-0.5 p-0.5 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "grid" ? "bg-brand-500/20 text-brand-300" : "text-white/40 hover:text-white/60"
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "calendar" ? "bg-brand-500/20 text-brand-300" : "text-white/40 hover:text-white/60"
                )}
                title="Calendar view"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            <GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
              New Class
            </GlassButton>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="w-full sm:w-56">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search classes..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium border bg-transparent transition-colors focus:outline-none appearance-none cursor-pointer",
              gradeFilter !== "all"
                ? "border-brand-500/40 text-brand-300 bg-brand-500/10"
                : "border-white/10 text-white/50 hover:border-white/20"
            )}
          >
            <option value="all" className="bg-gray-900">All Grades</option>
            <option value="Α" className="bg-gray-900">Α΄ Lyceum</option>
            <option value="Β" className="bg-gray-900">Β΄ Lyceum</option>
            <option value="Γ" className="bg-gray-900">Γ΄ Lyceum</option>
          </select>
          {/* Subject filter */}
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium border bg-transparent transition-colors focus:outline-none appearance-none cursor-pointer",
              subjectFilter !== "all"
                ? "border-brand-500/40 text-brand-300 bg-brand-500/10"
                : "border-white/10 text-white/50 hover:border-white/20"
            )}
          >
            <option value="all" className="bg-gray-900">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s} className="bg-gray-900">{s}</option>
            ))}
          </select>
          {/* Teacher filter */}
          <select
            value={teacherFilter}
            onChange={e => setTeacherFilter(e.target.value)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium border bg-transparent transition-colors focus:outline-none appearance-none cursor-pointer",
              teacherFilter !== "all"
                ? "border-brand-500/40 text-brand-300 bg-brand-500/10"
                : "border-white/10 text-white/50 hover:border-white/20"
            )}
          >
            <option value="all" className="bg-gray-900">All Teachers</option>
            {activeTeachers.map(t => (
              <option key={t.id} value={t.id} className="bg-gray-900">{t.fullName}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setGradeFilter("all"); setSubjectFilter("all"); setTeacherFilter("all"); setSearch(""); }}
              className="text-xs text-white/40 hover:text-white/60 transition-colors px-2 py-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredClasses.map(cls => {
            const teacher = teachers.find(t => t.id === cls.teacherId);
            return (
              <motion.div key={cls.id} variants={listItemVariants}>
                <Link href={`/admin/classes/${cls.id}`}>
                  <GlassCard hover padding="none" className="overflow-hidden">
                    <div className="h-1.5 w-full" style={{ backgroundColor: cls.color }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white/90">{cls.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <GlassBadge variant="brand" size="sm">{cls.year}΄</GlassBadge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <GlassBadge size="sm">{cls.subject}</GlassBadge>
                        <span className="text-xs text-white/30">{GRADE_MAP[cls.year] || cls.year}</span>
                      </div>
                      {teacher && (
                        <p className="text-xs text-white/45 mb-3">{teacher.fullName}</p>
                      )}

                      {/* Prominent schedule */}
                      {cls.schedule.length > 0 && (
                        <div className="mb-3 space-y-1">
                          {cls.schedule.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <Clock className="w-3 h-3 text-brand-400 flex-shrink-0" />
                              <span className="text-white/60 font-medium">{s.day.slice(0, 3)}</span>
                              <span className="text-white/45">{s.startTime} – {s.endTime}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-white/40">
                          <Users className="w-3.5 h-3.5" />
                          {cls.studentIds.length}/{cls.capacity}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
          {filteredClasses.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-white/30">No classes match your filters.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Weekly Calendar View */}
      {viewMode === "calendar" && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row — days */}
              <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-white/10">
                <div className="p-2" />
                {DAYS.map(day => (
                  <div key={day} className="p-3 text-center border-l border-white/5">
                    <span className="text-xs font-semibold text-white/60">{day}</span>
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="relative">
                {/* Hour rows */}
                {HOURS.map(hour => (
                  <div key={hour} className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-white/5 h-16">
                    <div className="p-2 flex items-start justify-end pr-3">
                      <span className="text-[10px] text-white/25 -mt-1">{String(hour).padStart(2, "0")}:00</span>
                    </div>
                    {DAYS.map(day => (
                      <div key={day} className="border-l border-white/5 relative" />
                    ))}
                  </div>
                ))}

                {/* Overlay: class blocks */}
                <div className="absolute inset-0 grid grid-cols-[60px_repeat(6,1fr)]" style={{ pointerEvents: "none" }}>
                  <div />
                  {DAYS.map(day => {
                    const daySlots = calendarSlots.filter(s => s.slot.day === day);
                    return (
                      <div key={day} className="relative border-l border-white/5">
                        {daySlots.map((s, idx) => {
                          const topOffset = ((s.startMinutes - 8 * 60) / 60) * 64; // 64px per hour (h-16 = 4rem = 64px)
                          const height = (s.durationMinutes / 60) * 64;
                          return (
                            <Link
                              key={`${s.cls.id}-${idx}`}
                              href={`/admin/classes/${s.cls.id}`}
                              className="absolute left-1 right-1 rounded-lg overflow-hidden transition-opacity hover:opacity-90"
                              style={{
                                top: `${topOffset}px`,
                                height: `${Math.max(height, 32)}px`,
                                backgroundColor: s.cls.color + "25",
                                borderLeft: `3px solid ${s.cls.color}`,
                                pointerEvents: "auto",
                              }}
                            >
                              <div className="p-1.5 h-full flex flex-col justify-start">
                                <p className="text-[10px] font-semibold text-white/90 leading-tight truncate">{s.cls.name}</p>
                                <p className="text-[9px] text-white/40 truncate">{s.slot.startTime} – {s.slot.endTime}</p>
                                {height > 48 && s.teacher && (
                                  <p className="text-[9px] text-white/30 truncate mt-0.5">{s.teacher.fullName}</p>
                                )}
                                {height > 60 && (
                                  <div className="flex items-center gap-1 mt-auto">
                                    <span className="text-[9px] text-white/25">{s.cls.year}΄</span>
                                    <span className="text-[9px] text-white/25">·</span>
                                    <span className="text-[9px] text-white/25">{s.cls.studentIds.length} students</span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <GlassModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Class" description="Set up a new class" size="md"
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
          <GlassInput label="Class Name" placeholder="e.g. Mathematics A' Lyceum" value={className} onChange={e => setClassName(e.target.value)} />
          <GlassSelect label="Subject" value={subject} onChange={e => setSubject(e.target.value)} options={[{value:"Mathematics",label:"Mathematics"},{value:"Physics",label:"Physics"},{value:"Chemistry",label:"Chemistry"},{value:"Biology",label:"Biology"},{value:"English",label:"English"},{value:"History",label:"History"},{value:"Informatics",label:"Informatics"}]} />
          <GlassSelect label="Year" value={year} onChange={e => setYear(e.target.value)} options={[{value:"Α",label:"Α΄"},{value:"Β",label:"Β΄"},{value:"Γ",label:"Γ΄"}]} />
          <GlassSelect label="Teacher" value={teacherId} onChange={e => setTeacherId(e.target.value)} options={teachers.map(t => ({value:t.id,label:t.fullName}))} />
          <GlassInput label="Capacity" type="number" placeholder="8" value={capacity} onChange={e => setCapacity(e.target.value)} />

          {/* Schedule slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/60">Schedule</label>
              <button type="button" onClick={addSlot} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">+ Add time slot</button>
            </div>
            {scheduleSlots.length === 0 && (
              <p className="text-xs text-white/30 italic">No schedule slots yet. Add one above.</p>
            )}
            <div className="space-y-2">
              {scheduleSlots.map((slot, i) => (
                <div key={i} className="flex flex-col gap-2 p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <select value={slot.day} onChange={e => updateSlot(i, "day", e.target.value)} className="bg-transparent text-xs text-white/80 border border-white/10 rounded-lg px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500">
                      {DAYS.map(d => <option key={d} value={d} className="bg-gray-900">{d.slice(0, 3)}</option>)}
                    </select>
                    <input type="time" value={slot.startTime} onChange={e => updateSlot(i, "startTime", e.target.value)} className="bg-transparent text-xs text-white/80 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500" />
                    <span className="text-white/30 text-xs">–</span>
                    <input type="time" value={slot.endTime} onChange={e => updateSlot(i, "endTime", e.target.value)} className="bg-transparent text-xs text-white/80 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500" />
                    <button type="button" onClick={() => removeSlot(i)} className="text-red-400/60 hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Room selector */}
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <select
                      value={slot.room || ""}
                      onChange={e => updateSlot(i, "room", e.target.value)}
                      className="bg-transparent text-xs text-white/70 border border-white/10 rounded-lg px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500"
                    >
                      <option value="" className="bg-gray-900">No room</option>
                      {localClassrooms.map(r => (
                        <option key={r.id} value={r.name} className="bg-gray-900">{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classrooms Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5" /> Classrooms
              </label>
              <button type="button" onClick={() => setManageRoomsOpen(!manageRoomsOpen)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                {manageRoomsOpen ? "Done" : "Manage"}
              </button>
            </div>
            {/* Add new classroom */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddClassroom(); } }}
                placeholder="Add new classroom..."
                className="flex-1 bg-white/5 text-xs text-white/80 border border-white/10 rounded-lg px-3 py-1.5 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
              />
              <button
                type="button"
                onClick={handleAddClassroom}
                disabled={!newRoomName.trim()}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            {/* Existing classrooms list (shown when managing) */}
            {manageRoomsOpen && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {localClassrooms.length === 0 && (
                  <p className="text-xs text-white/25 italic py-1">No classrooms saved yet.</p>
                )}
                {localClassrooms.map(room => (
                  <div key={room.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 group">
                    <span className="text-xs text-white/60">{room.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteClassroom(room.id)}
                      className="text-red-400/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
