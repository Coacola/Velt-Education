"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { cn, formatDate, getGradeColor, getGradeBg } from "@/lib/utils";
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
        footer={<><GlassButton variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</GlassButton><GlassButton variant="primary" onClick={() => setCreateOpen(false)}>Create</GlassButton></>}
      >
        <div className="space-y-4">
          <GlassInput label="Exam Title" placeholder="e.g. Mid-term Trigonometry" />
          <GlassSelect label="Class" options={classes.map(c => ({value:c.id,label:c.name}))} />
          <GlassInput label="Date" type="date" />
          <GlassInput label="Max Score" type="number" placeholder="20" />
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
