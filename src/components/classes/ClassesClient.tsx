"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Class } from "@/lib/types/class";
import type { Teacher } from "@/lib/types/teacher";

interface ClassesClientProps {
  classes: Class[];
  teachers: Teacher[];
}

export function ClassesClient({ classes, teachers }: ClassesClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AnimatedPage>
      <PageHeader
        title="Classes"
        description={`${classes.length} active classes`}
        actions={
          <GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            New Class
          </GlassButton>
        }
      />
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {classes.map(cls => {
          const teacher = teachers.find(t => t.id === cls.teacherId);
          return (
            <motion.div key={cls.id} variants={listItemVariants}>
              <Link href={`/admin/classes/${cls.id}`}>
                <GlassCard hover padding="none" className="overflow-hidden">
                  <div className="h-1.5 w-full" style={{ backgroundColor: cls.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white/90">{cls.name}</h3>
                      <GlassBadge variant="brand">{cls.year}΄</GlassBadge>
                    </div>
                    <GlassBadge size="sm" className="mb-3">{cls.subject}</GlassBadge>
                    {teacher && (
                      <p className="text-xs text-white/45 mb-3">{teacher.fullName}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Users className="w-3.5 h-3.5" />
                        {cls.studentIds.length}/{cls.capacity}
                      </div>
                      <span className="text-white/30">
                        {cls.schedule.map(s => s.day.slice(0, 3)).join(", ")}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <GlassModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Class" description="Set up a new class" size="md"
        footer={<><GlassButton variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</GlassButton><GlassButton variant="primary" onClick={() => setCreateOpen(false)}>Create</GlassButton></>}
      >
        <div className="space-y-4">
          <GlassInput label="Class Name" placeholder="e.g. Mathematics A' Lyceum" />
          <GlassSelect label="Subject" options={[{value:"Mathematics",label:"Mathematics"},{value:"Physics",label:"Physics"},{value:"Chemistry",label:"Chemistry"},{value:"Biology",label:"Biology"},{value:"English",label:"English"},{value:"History",label:"History"},{value:"Informatics",label:"Informatics"}]} />
          <GlassSelect label="Year" options={[{value:"Α",label:"Α΄"},{value:"Β",label:"Β΄"},{value:"Γ",label:"Γ΄"}]} />
          <GlassSelect label="Teacher" options={teachers.map(t => ({value:t.id,label:t.fullName}))} />
          <GlassInput label="Capacity" type="number" placeholder="8" />
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
