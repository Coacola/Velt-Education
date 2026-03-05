"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Teacher } from "@/lib/types/teacher";
import type { Class } from "@/lib/types/class";

interface TeachersClientProps {
  teachers: Teacher[];
  classes: Class[];
}

export function TeachersClient({ teachers, classes }: TeachersClientProps) {
  return (
    <AnimatedPage>
      <PageHeader title="Teachers" description={`${teachers.length} teachers`} />
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={listContainerVariants} initial="hidden" animate="visible">
        {teachers.map(teacher => {
          const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
          const studentCount = new Set(teacherClasses.flatMap(c => c.studentIds)).size;
          return (
            <motion.div key={teacher.id} variants={listItemVariants}>
              <Link href={`/admin/teachers/${teacher.id}`}>
                <GlassCard hover>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-sm font-bold text-white">{teacher.firstName[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-white/90">{teacher.fullName}</p>
                      <p className="text-xs text-white/40">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {teacher.subjects.map(s => <GlassBadge key={s} size="sm">{s}</GlassBadge>)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{teacherClasses.length} classes</span>
                    <span>{studentCount} students</span>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatedPage>
  );
}
