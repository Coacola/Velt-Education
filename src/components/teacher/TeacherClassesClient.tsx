"use client";

import { useState, useMemo } from "react";
import { Users, Clock, LayoutGrid, List } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassTable } from "@/components/glass/GlassTable";
import { cn } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Class } from "@/lib/types/class";
import type { Teacher } from "@/lib/types/teacher";

const col = createColumnHelper<Class>();

interface TeacherClassesClientProps {
  classes: Class[];
  teachers: Teacher[];
}

export function TeacherClassesClient({ classes, teachers }: TeacherClassesClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const columns = useMemo(() => [
    col.accessor("name", {
      header: "Class",
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: info.row.original.color }} />
          <div>
            <p className="font-medium text-white/90">{info.getValue()}</p>
            <p className="text-xs text-white/35">{info.row.original.subject}</p>
          </div>
        </div>
      ),
      size: 200,
    }),
    col.accessor("year", {
      header: "Year",
      cell: info => <GlassBadge variant="brand" size="sm">{info.getValue()}΄</GlassBadge>,
      size: 70,
    }),
    col.accessor("schedule", {
      header: "Schedule",
      cell: info => {
        const slots = info.getValue();
        if (!slots.length) return <span className="text-white/25">—</span>;
        return (
          <div className="space-y-0.5">
            {slots.map((s, i) => (
              <p key={i} className="text-xs text-white/55">
                <span className="font-medium text-white/70">{s.day.slice(0, 3)}</span>{" "}
                {s.startTime}–{s.endTime}
                {s.room && <span className="text-white/30"> ({s.room})</span>}
              </p>
            ))}
          </div>
        );
      },
      size: 200,
    }),
    col.accessor("studentIds", {
      header: "Students",
      cell: info => (
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Users className="w-3.5 h-3.5" />
          {info.getValue().length}/{info.row.original.capacity}
        </div>
      ),
      size: 100,
    }),
  ], []);

  const viewToggle = (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          viewMode === "grid" ? "bg-white/10 text-white/80" : "text-white/30 hover:text-white/50"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          viewMode === "list" ? "bg-white/10 text-white/80" : "text-white/30 hover:text-white/50"
        )}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AnimatedPage>
      <PageHeader
        title="My Classes"
        description={`${classes.length} class${classes.length !== 1 ? "es" : ""} you teach`}
        actions={viewToggle}
      />

      {viewMode === "list" ? (
        <GlassTable
          columns={columns}
          data={classes}
          emptyTitle="No classes"
          emptyDescription="No classes assigned to you."
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {classes.map(cls => (
            <motion.div key={cls.id} variants={listItemVariants}>
              <GlassCard hover padding="none" className="overflow-hidden">
                <div className="h-1.5 w-full" style={{ backgroundColor: cls.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white/90">{cls.name}</h3>
                    <GlassBadge variant="brand" size="sm">{cls.year}΄</GlassBadge>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <GlassBadge size="sm">{cls.subject}</GlassBadge>
                  </div>
                  {cls.schedule.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {cls.schedule.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-brand-400 flex-shrink-0" />
                          <span className="text-white/60 font-medium">{s.day.slice(0, 3)}</span>
                          <span className="text-white/45">{s.startTime} – {s.endTime}</span>
                          {s.room && <span className="text-white/30 text-[10px]">({s.room})</span>}
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
            </motion.div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-white/30">No classes assigned to you.</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
