"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createExam } from "@/lib/actions/exams";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { cn, formatDate, getGradeColor } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Exam } from "@/lib/types/exam";
import type { Class } from "@/lib/types/class";

interface ExamsClientProps {
  exams: Exam[];
  classes: Class[];
}

export function ExamsClient({ exams, classes }: ExamsClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState("");
  const [maxScore, setMaxScore] = useState("20");

  const resetForm = () => {
    setTitle("");
    setClassId("");
    setDate("");
    setMaxScore("20");
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Exam title is required");
      return;
    }
    if (!classId) {
      toast.error("Please select a class");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const selectedClass = classes.find(c => c.id === classId);

    startTransition(async () => {
      const result = await createExam({
        title,
        classId,
        subject: selectedClass?.subject || "",
        date,
        maxScore: parseInt(maxScore) || 20,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`Exam "${title}" created successfully`);
      resetForm();
      setCreateOpen(false);
    });
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Exams & Grades"
        description={`${exams.length} exams`}
        actions={<GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>New Exam</GlassButton>}
      />

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={listContainerVariants} initial="hidden" animate="visible">
        {exams.map(exam => (
          <motion.div key={exam.id} variants={listItemVariants}>
            <GlassCard hover onClick={() => setSelectedExam(exam)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/90">{exam.title}</h3>
                <GlassBadge size="sm">{exam.subject}</GlassBadge>
              </div>
              <p className="text-xs text-white/40 mb-3">{exam.className} · {formatDate(exam.date)}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/35">Average:</span>
                  <span className={cn("text-sm font-bold", getGradeColor(exam.classAverage))}>{exam.classAverage.toFixed(1)}/20</span>
                </div>
                <span className="text-xs text-white/30">{exam.grades.length} graded</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Grade detail modal */}
      <GlassModal open={!!selectedExam} onClose={() => setSelectedExam(null)} title={selectedExam?.title || "Exam Grades"} size="lg">
        {selectedExam && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Student</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Score</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedExam.grades.map(grade => (
                  <tr key={grade.studentId} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-3 py-2.5 text-sm text-white/80 font-medium">{grade.studentName}</td>
                    <td className="px-3 py-2.5">
                      {grade.absent ? (
                        <GlassBadge variant="red" size="sm">Absent</GlassBadge>
                      ) : (
                        <span className={cn("font-bold text-sm", getGradeColor(grade.score))}>{grade.score}/{selectedExam.maxScore}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {!grade.absent && (
                        <GlassBadge variant={grade.score >= 15 ? "green" : grade.score >= 10 ? "amber" : "red"} size="sm">
                          {grade.score >= 15 ? "Excellent" : grade.score >= 10 ? "Pass" : "Needs work"}
                        </GlassBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-3">
              <span className="text-xs text-white/40">Class Average:</span>
              <span className={cn("text-sm font-bold", getGradeColor(selectedExam.classAverage))}>{selectedExam.classAverage.toFixed(1)}/20</span>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Create exam modal */}
      <GlassModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Exam" size="md"
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
          <GlassInput label="Exam Title" placeholder="e.g. Mid-term Trigonometry" value={title} onChange={e => setTitle(e.target.value)} />
          <GlassSelect label="Class" value={classId} onChange={e => setClassId(e.target.value)} options={classes.map(c => ({value:c.id,label:c.name}))} />
          <GlassInput label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <GlassInput label="Max Score" type="number" placeholder="20" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
