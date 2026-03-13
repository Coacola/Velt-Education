"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Search } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { StudentGrade } from "@/lib/services/student-grades";

interface StudentGradesClientProps {
  grades: StudentGrade[];
}

export function StudentGradesClient({ grades }: StudentGradesClientProps) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const subjects = Array.from(new Set(grades.map(g => g.subject)));

  const filtered = grades.filter(g => {
    if (subjectFilter !== "all" && g.subject !== subjectFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return g.examTitle.toLowerCase().includes(q) || g.className.toLowerCase().includes(q);
    }
    return true;
  });

  const scoredGrades = grades.filter(g => !g.absent);
  const overallAvg = scoredGrades.length > 0
    ? Math.round((scoredGrades.reduce((s, g) => s + g.score, 0) / scoredGrades.length) * 10) / 10
    : null;

  const highestGrade = scoredGrades.length > 0
    ? Math.max(...scoredGrades.map(g => g.score))
    : null;

  const gradeColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "text-emerald-400";
    if (pct >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const gradeBarWidth = (score: number, max: number) => `${(score / max) * 100}%`;
  const gradeBarColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "bg-emerald-500/40";
    if (pct >= 60) return "bg-amber-500/40";
    return "bg-red-500/40";
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="My Grades"
        description="Published exam results"
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white/90">{overallAvg !== null ? `${overallAvg}/20` : "—"}</p>
              <p className="text-[10px] text-white/40">Overall Average</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white/90">{highestGrade !== null ? `${highestGrade}/20` : "—"}</p>
              <p className="text-[10px] text-white/40">Highest Score</p>
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
            placeholder="Search exams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        {subjects.length > 1 && (
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 focus:outline-none focus:border-brand-500/50"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Grades List */}
      {filtered.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-white/30 text-center py-8">
            {grades.length === 0 ? "No published grades yet." : "No grades match your search."}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(grade => (
            <GlassCard key={grade.examId} padding="sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white/90 mb-1">{grade.examTitle}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <GlassBadge size="sm">{grade.subject}</GlassBadge>
                    <span className="text-[10px] text-white/30">{grade.className}</span>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/30">
                      {new Date(grade.date).toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {/* Grade bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${gradeBarColor(grade.score, grade.maxScore)}`}
                      style={{ width: gradeBarWidth(grade.score, grade.maxScore) }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {grade.absent ? (
                    <p className="text-sm font-bold text-white/30">Absent</p>
                  ) : (
                    <>
                      <p className={`text-lg font-bold ${gradeColor(grade.score, grade.maxScore)}`}>
                        {grade.score}/{grade.maxScore}
                      </p>
                      <p className="text-[10px] text-white/30">
                        class avg: {grade.classAverage}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}
