"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Student } from "@/lib/types/student";

interface RiskWidgetProps {
  students: Student[];
}

export function RiskWidget({ students }: RiskWidgetProps) {
  return (
    <GlassCard padding="none" className="h-full flex flex-col">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/80">At-Risk Students</h3>
          <p className="text-xs text-white/35 mt-0.5">Needs attention</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        </div>
      </div>
      <motion.div
        className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[320px]"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {students.map(student => (
          <motion.div key={student.id} variants={listItemVariants}>
            <Link
              href={`/admin/students/${student.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-400">
                {student.firstName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/85 truncate">{student.fullName}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {student.riskReason.map(reason => (
                    <GlassBadge key={reason} variant="red" size="sm">{reason}</GlassBadge>
                  ))}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
        {students.length === 0 && (
          <div className="px-5 py-8 text-center text-xs text-white/30">No students at risk</div>
        )}
      </motion.div>
    </GlassCard>
  );
}
