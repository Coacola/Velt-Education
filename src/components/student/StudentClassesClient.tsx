"use client";

import Link from "next/link";
import { Users, Clock } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { Class } from "@/lib/types/class";

interface StudentClassesClientProps {
  classes: Class[];
  teacherMap: Record<string, string>;
}

export function StudentClassesClient({ classes, teacherMap }: StudentClassesClientProps) {
  return (
    <AnimatedPage>
      <PageHeader
        title="My Classes"
        description={`Enrolled in ${classes.length} class${classes.length !== 1 ? "es" : ""}`}
      />

      {classes.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-white/30 text-center py-12">
            You are not enrolled in any classes yet.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <Link key={cls.id} href={`/student/classes/${cls.id}`}>
              <GlassCard padding="none" hover className="overflow-hidden group cursor-pointer h-full">
                <div className="h-1.5 w-full" style={{ backgroundColor: cls.color }} />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-white/90 mb-1 group-hover:text-white transition-colors">
                    {cls.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <GlassBadge size="sm">{cls.subject}</GlassBadge>
                    <GlassBadge variant="brand" size="sm">{cls.year}΄</GlassBadge>
                  </div>
                  <p className="text-xs text-white/40 mb-2">
                    {teacherMap[cls.teacherId] || "Unknown Teacher"}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-white/40 mb-2">
                    <Users className="w-3 h-3" />
                    <span>{cls.studentIds.length}/{cls.capacity} students</span>
                  </div>
                  {cls.schedule.length > 0 && (
                    <div className="space-y-0.5">
                      {cls.schedule.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/30">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{s.day.slice(0, 3)} {s.startTime}–{s.endTime}{s.room ? ` · ${s.room}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}
