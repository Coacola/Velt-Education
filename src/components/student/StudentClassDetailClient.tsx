"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, Clock, BookOpen, Target, FileText, Video, LinkIcon, Calendar,
} from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { Class } from "@/lib/types/class";
import type { LessonPlan } from "@/lib/types/lessonPlan";

interface StudentClassDetailClientProps {
  classData: Class;
  teacherName: string;
  lessonPlans: LessonPlan[];
}

type Tab = "info" | "lessons";

export function StudentClassDetailClient({ classData, teacherName, lessonPlans }: StudentClassDetailClientProps) {
  const [tab, setTab] = useState<Tab>("info");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const pastLessons = lessonPlans.filter(lp => lp.lessonDate <= new Date().toISOString().slice(0, 10));
  const upcomingLessons = lessonPlans.filter(lp => lp.lessonDate > new Date().toISOString().slice(0, 10));

  const materialIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-3 h-3 text-red-400" />;
      case "link": return <LinkIcon className="w-3 h-3 text-blue-400" />;
      default: return <FileText className="w-3 h-3 text-amber-400" />;
    }
  };

  return (
    <AnimatedPage>
      <Link href="/student/classes" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
        <ArrowLeft className="w-3 h-3" />
        Back to My Classes
      </Link>

      {/* Class Header */}
      <GlassCard padding="none" className="overflow-hidden mb-6">
        <div className="h-2 w-full" style={{ backgroundColor: classData.color }} />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white/90 mb-2">{classData.name}</h1>
              <div className="flex items-center gap-2 mb-3">
                <GlassBadge size="sm">{classData.subject}</GlassBadge>
                <GlassBadge variant="brand" size="sm">{classData.year}΄</GlassBadge>
              </div>
              <p className="text-sm text-white/50">{teacherName}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{classData.studentIds.length}/{classData.capacity}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{classData.startDate} – {classData.endDate}</span>
              </div>
            </div>
          </div>
          {classData.schedule.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-semibold text-white/50 mb-2">Schedule</h3>
              <div className="flex flex-wrap gap-3">
                {classData.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-white/60">
                    <Clock className="w-3 h-3 text-white/30" />
                    <span>{s.day} {s.startTime}–{s.endTime}</span>
                    {s.room && <span className="text-white/30">({s.room})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(["info", "lessons"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {t === "info" ? "Overview" : `Lesson Plans (${lessonPlans.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "info" && (
        <div className="space-y-4">
          {classData.description && (
            <GlassCard>
              <h3 className="text-sm font-semibold text-white/70 mb-2">Description</h3>
              <p className="text-sm text-white/50">{classData.description}</p>
            </GlassCard>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard padding="sm">
              <p className="text-[10px] text-white/40 mb-1">Lesson Plans</p>
              <p className="text-lg font-bold text-white/90">{lessonPlans.length}</p>
            </GlassCard>
            <GlassCard padding="sm">
              <p className="text-[10px] text-white/40 mb-1">Schedule</p>
              <p className="text-lg font-bold text-white/90">{classData.schedule.length}x/week</p>
            </GlassCard>
          </div>

          {/* Next Lesson Plan preview */}
          {upcomingLessons.length > 0 && (
            <GlassCard>
              <h3 className="text-sm font-semibold text-white/70 mb-3">Next Lesson</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/90">{upcomingLessons[0].title}</h4>
                  <span className="text-[10px] text-white/40">
                    {new Date(upcomingLessons[0].lessonDate).toLocaleDateString("el-GR", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                </div>
                {upcomingLessons[0].description && (
                  <p className="text-xs text-white/40">{upcomingLessons[0].description}</p>
                )}
                {upcomingLessons[0].objectives.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {upcomingLessons[0].objectives.slice(0, 3).map((obj, i) => (
                      <div key={i} className="flex items-center gap-1 text-[10px] text-white/40">
                        <Target className="w-2.5 h-2.5 text-brand-400" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => { setTab("lessons"); setExpandedLesson(upcomingLessons[0].id); }}
                className="mt-3 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
              >
                View full lesson plan →
              </button>
            </GlassCard>
          )}
        </div>
      )}

      {tab === "lessons" && (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcomingLessons.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/50 mb-3">Upcoming</h3>
              <div className="space-y-3">
                {upcomingLessons.map(lp => (
                  <LessonPlanCard
                    key={lp.id}
                    plan={lp}
                    expanded={expandedLesson === lp.id}
                    onToggle={() => setExpandedLesson(expandedLesson === lp.id ? null : lp.id)}
                    materialIcon={materialIcon}
                    variant="upcoming"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {pastLessons.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/50 mb-3">Past Lessons</h3>
              <div className="space-y-3">
                {pastLessons.map(lp => (
                  <LessonPlanCard
                    key={lp.id}
                    plan={lp}
                    expanded={expandedLesson === lp.id}
                    onToggle={() => setExpandedLesson(expandedLesson === lp.id ? null : lp.id)}
                    materialIcon={materialIcon}
                    variant="past"
                  />
                ))}
              </div>
            </div>
          )}

          {lessonPlans.length === 0 && (
            <GlassCard>
              <p className="text-sm text-white/30 text-center py-6">No lesson plans have been posted yet.</p>
            </GlassCard>
          )}
        </div>
      )}
    </AnimatedPage>
  );
}

/* ─── Lesson Plan Card ─── */
interface LessonPlanCardProps {
  plan: LessonPlan;
  expanded: boolean;
  onToggle: () => void;
  materialIcon: (type: string) => React.ReactNode;
  variant: "upcoming" | "past";
}

function LessonPlanCard({ plan, expanded, onToggle, materialIcon, variant }: LessonPlanCardProps) {
  return (
    <GlassCard
      padding="sm"
      className={`cursor-pointer transition-all ${variant === "upcoming" ? "border-brand-500/20" : ""}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <h4 className="text-sm font-medium text-white/90 truncate">{plan.title}</h4>
          </div>
          <span className="text-[10px] text-white/40">
            {new Date(plan.lessonDate).toLocaleDateString("el-GR", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>
        {variant === "upcoming" && (
          <GlassBadge variant="brand" size="sm">Upcoming</GlassBadge>
        )}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/5 pt-3">
          {plan.description && (
            <p className="text-xs text-white/50">{plan.description}</p>
          )}

          {plan.objectives.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-white/50 mb-1.5 flex items-center gap-1">
                <Target className="w-3 h-3" /> Learning Objectives
              </h5>
              <ul className="space-y-1">
                {plan.objectives.map((obj, i) => (
                  <li key={i} className="text-xs text-white/40 flex items-start gap-1.5">
                    <span className="text-brand-400 mt-0.5">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.materials.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-white/50 mb-1.5">Materials & Resources</h5>
              <div className="space-y-1.5">
                {plan.materials.map((mat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {materialIcon(mat.type)}
                    {mat.url ? (
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {mat.title}
                      </a>
                    ) : (
                      <span className="text-xs text-white/50">{mat.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
