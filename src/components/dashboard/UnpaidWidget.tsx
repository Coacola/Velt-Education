"use client";

import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { formatCurrency } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Student } from "@/lib/types/student";

interface UnpaidWidgetProps {
  students: Student[];
  onRecordPayment?: (student: Student) => void;
}

export function UnpaidWidget({ students, onRecordPayment }: UnpaidWidgetProps) {
  const unpaid = students.filter(s => s.outstandingBalance > 0);

  return (
    <GlassCard padding="none" className="h-full flex flex-col">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Unpaid This Month</h3>
          <p className="text-xs text-white/35 mt-0.5">{unpaid.length} students with outstanding balance</p>
        </div>
        <GlassBadge variant="red" dot>{unpaid.length}</GlassBadge>
      </div>
      <motion.div
        className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[320px]"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {unpaid.map(student => (
          <motion.div
            key={student.id}
            variants={listItemVariants}
            className="px-5 py-3 hover:bg-white/3 transition-colors flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-300">
              {student.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/85 truncate">{student.fullName}</p>
              <p className="text-xs text-red-400 font-medium">{formatCurrency(student.outstandingBalance)}</p>
            </div>
            <GlassButton
              variant="ghost"
              size="sm"
              leftIcon={<CreditCard className="w-3 h-3" />}
              onClick={() => onRecordPayment?.(student)}
            >
              Pay
            </GlassButton>
          </motion.div>
        ))}
        {unpaid.length === 0 && (
          <div className="px-5 py-8 text-center text-xs text-white/30">All students are up to date!</div>
        )}
      </motion.div>
    </GlassCard>
  );
}
