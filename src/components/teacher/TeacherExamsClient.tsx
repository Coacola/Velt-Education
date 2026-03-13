"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, BarChart3, TrendingUp, Plus, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { cn, formatDate } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import { createExamAsTeacher, saveGradesAsTeacher, deleteExamAsTeacher } from "@/lib/actions/teacher-exams";
import type { Exam, ExamGrade } from "@/lib/types/exam";
import type { Class } from "@/lib/types/class";
import type { Student } from "@/lib/types/student";

interface TeacherExamsClientProps {
  exams: Exam[];
  classes: Class[];
  students: Student[];
}

export function TeacherExamsClient({ exams, classes, students }: TeacherExamsClientProps) {
  const router = useRouter();
  const [classFilter, setClassFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [gradingExam, setGradingExam] = useState<Exam | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const sorted = [...exams].sort((a, b) => b.date.localeCompare(a.date));
    if (classFilter === "all") return sorted;
    return sorted.filter(e => e.classId === classFilter);
  }, [exams, classFilter]);

  // Compute overall stats
  const stats = useMemo(() => {
    if (exams.length === 0) return { avgScore: 0, totalExams: 0, totalGraded: 0 };
    const allGrades = exams.flatMap(e => e.grades.filter(g => !g.absent));
    const totalGraded = allGrades.length;
    const avgScore = totalGraded > 0
      ? allGrades.reduce((sum, g) => sum + g.score, 0) / totalGraded
      : 0;
    return { avgScore, totalExams: exams.length, totalGraded };
  }, [exams]);

  // Build a map of classId → enrolled student info
  const classStudentMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();
    for (const cls of classes) {
      const enrolled = cls.studentIds
        .map(sid => students.find(s => s.id === sid))
        .filter(Boolean)
        .map(s => ({ id: s!.id, name: `${s!.firstName} ${s!.lastName}` }));
      map.set(cls.id, enrolled);
    }
    return map;
  }, [classes, students]);

  const handleCreateExam = (data: { classId: string; title: string; subject: string; date: string; maxScore: number }) => {
    startTransition(async () => {
      const result = await createExamAsTeacher(data);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Exam created!");
      setShowNewModal(false);
      router.refresh();
    });
  };

  const handleSaveGrades = (examId: string, grades: { studentId: string; score: number; absent: boolean; feedback?: string }[]) => {
    startTransition(async () => {
      const result = await saveGradesAsTeacher({ examId, grades });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Grades saved!");
      setGradingExam(null);
      router.refresh();
    });
  };

  const handleDeleteExam = (examId: string) => {
    if (!confirm("Delete this exam? All grades will be lost.")) return;
    startTransition(async () => {
      const result = await deleteExamAsTeacher(examId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Exam deleted");
      router.refresh();
    });
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Exams"
        description={`${filtered.length} exam${filtered.length !== 1 ? "s" : ""}`}
        actions={
          <GlassButton
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowNewModal(true)}
          >
            New Exam
          </GlassButton>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" />
            <div>
              <p className="text-[10px] text-white/35 uppercase tracking-wider">Total Exams</p>
              <p className="text-lg font-bold text-white/90">{stats.totalExams}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-white/35 uppercase tracking-wider">Avg Score</p>
              <p className="text-lg font-bold text-white/90">{stats.avgScore.toFixed(1)}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-white/35 uppercase tracking-wider">Grades Given</p>
              <p className="text-lg font-bold text-white/90">{stats.totalGraded}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Class filter */}
      <div className="flex items-center gap-3 mb-5">
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

      {/* Exams list */}
      <motion.div
        className="space-y-3"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {filtered.map(exam => {
          const gradedCount = exam.grades.filter(g => !g.absent).length;
          const absentCount = exam.grades.filter(g => g.absent).length;
          return (
            <motion.div key={exam.id} variants={listItemVariants}>
              <GlassCard padding="sm" hover className="cursor-pointer" onClick={() => setGradingExam(exam)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">{exam.title}</h4>
                    <p className="text-xs text-white/40">{exam.className} · {formatDate(exam.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlassBadge variant="brand" size="sm">{exam.subject}</GlassBadge>
                    <button
                      className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                      onClick={e => { e.stopPropagation(); handleDeleteExam(exam.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-white/50 mb-2">
                  <span>
                    Avg: <span className="font-semibold text-white/80">{exam.classAverage.toFixed(1)}</span>/{exam.maxScore}
                  </span>
                  <span>{gradedCount} graded</span>
                  {absentCount > 0 && (
                    <span className="text-amber-400/70">{absentCount} absent</span>
                  )}
                </div>

                {/* Compact grade chips */}
                {exam.grades.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exam.grades.map(g => {
                      const pct = g.absent ? 0 : (g.score / exam.maxScore) * 100;
                      return (
                        <span
                          key={g.studentId}
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded",
                            g.absent
                              ? "bg-white/5 text-white/25"
                              : pct >= 70
                                ? "bg-emerald-500/10 text-emerald-400/70"
                                : pct >= 50
                                  ? "bg-amber-500/10 text-amber-400/70"
                                  : "bg-red-500/10 text-red-400/70"
                          )}
                        >
                          {g.studentName.split(" ")[0]} {g.absent ? "—" : g.score}
                        </span>
                      );
                    })}
                  </div>
                )}

                <p className="text-[10px] text-brand-400 mt-2 font-medium">Click to grade →</p>
              </GlassCard>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-white/30">No exams found.</p>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showNewModal && (
        <CreateExamModal
          classes={classes}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateExam}
          isPending={isPending}
        />
      )}
      {gradingExam && (
        <GradingModal
          exam={gradingExam}
          classStudents={classStudentMap.get(gradingExam.classId) || []}
          onClose={() => setGradingExam(null)}
          onSave={handleSaveGrades}
          isPending={isPending}
        />
      )}
    </AnimatedPage>
  );
}

// ── Create Exam Modal ─────────────────────────────
interface CreateExamModalProps {
  classes: Class[];
  onClose: () => void;
  onCreate: (data: { classId: string; title: string; subject: string; date: string; maxScore: number }) => void;
  isPending: boolean;
}

function CreateExamModal({ classes, onClose, onCreate, isPending }: CreateExamModalProps) {
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [maxScore, setMaxScore] = useState(20);

  const selectedClass = classes.find(c => c.id === classId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-canvas-900/95 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-white/95 mb-4">New Exam</h2>

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
            <label className="block text-xs font-medium text-white/50 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Mid-term Test"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Max Score</label>
              <input
                type="number"
                value={maxScore}
                onChange={e => setMaxScore(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <GlassButton variant="ghost" size="sm" onClick={onClose}>Cancel</GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => onCreate({
              classId,
              title,
              subject: selectedClass?.subject || "Mathematics",
              date,
              maxScore,
            })}
            disabled={isPending || !classId || !title.trim() || !date}
          >
            {isPending ? "Creating..." : "Create Exam"}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

// ── Grading Modal ─────────────────────────────
interface GradingModalProps {
  exam: Exam;
  classStudents: { id: string; name: string }[];
  onClose: () => void;
  onSave: (examId: string, grades: { studentId: string; score: number; absent: boolean; feedback?: string }[]) => void;
  isPending: boolean;
}

interface GradeEntry {
  studentId: string;
  studentName: string;
  score: number;
  absent: boolean;
}

function GradingModal({ exam, classStudents, onClose, onSave, isPending }: GradingModalProps) {
  // Initialize grades from exam's existing grades or class students
  const [grades, setGrades] = useState<GradeEntry[]>(() => {
    if (exam.grades.length > 0) {
      return exam.grades.map(g => ({
        studentId: g.studentId,
        studentName: g.studentName,
        score: g.score,
        absent: g.absent,
      }));
    }
    // Initialize from enrolled students if no grades exist yet
    return classStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      score: 0,
      absent: false,
    }));
  });

  const updateGrade = (studentId: string, field: "score" | "absent", value: number | boolean) => {
    setGrades(prev => prev.map(g => {
      if (g.studentId !== studentId) return g;
      if (field === "absent") return { ...g, absent: value as boolean, score: value ? 0 : g.score };
      return { ...g, score: value as number };
    }));
  };

  const nonAbsentGrades = grades.filter(g => !g.absent);
  const avg = nonAbsentGrades.length > 0
    ? (nonAbsentGrades.reduce((s, g) => s + g.score, 0) / nonAbsentGrades.length).toFixed(1)
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-canvas-900/95 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white/95">{exam.title}</h2>
            <p className="text-xs text-white/40">{exam.className} · Max: {exam.maxScore} · Avg: {avg}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grades Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-canvas-900/95 z-10">
              <tr className="border-b border-white/8">
                <th className="text-left px-6 py-3 text-xs font-semibold text-white/40 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-white/40 uppercase w-24">Score</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-white/40 uppercase w-20">Absent</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(g => (
                <tr key={g.studentId} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300">
                        {g.studentName[0]}
                      </div>
                      <span className={cn("text-sm font-medium", g.absent ? "text-white/30 line-through" : "text-white/85")}>
                        {g.studentName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      value={g.absent ? "" : g.score}
                      onChange={e => updateGrade(g.studentId, "score", Number(e.target.value))}
                      disabled={g.absent}
                      min={0}
                      max={exam.maxScore}
                      className={cn(
                        "w-20 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-brand-500/50",
                        g.absent && "opacity-30"
                      )}
                    />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={g.absent}
                      onChange={e => updateGrade(g.studentId, "absent", e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/50 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/8 flex items-center justify-end gap-3 flex-shrink-0">
          <GlassButton variant="ghost" size="sm" onClick={onClose}>Cancel</GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={() => onSave(exam.id, grades.map(g => ({
              studentId: g.studentId,
              score: g.score,
              absent: g.absent,
            })))}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Grades"}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
