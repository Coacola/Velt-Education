"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass/GlassCard";
import { cn, formatRelative, getActivityColor } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { ActivityEvent } from "@/lib/types/activity";

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const severityIcons: Record<string, string> = {
  info: "●",
  warning: "⚠",
  error: "✕",
  success: "✓",
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <GlassCard padding="none" className="h-full flex flex-col">
      <div className="px-5 py-4 border-b border-white/8">
        <h3 className="text-sm font-semibold text-white/80">Recent Activity</h3>
        <p className="text-xs text-white/35 mt-0.5">Latest events</p>
      </div>
      <motion.div
        className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[320px]"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {events.map(event => (
          <motion.div
            key={event.id}
            variants={listItemVariants}
            className="px-5 py-3 hover:bg-white/3 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold border",
                getActivityColor(event.severity)
              )}>
                {severityIcons[event.severity]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate">{event.title}</p>
                <p className="text-xs text-white/40 truncate mt-0.5">{event.description}</p>
                <p className="text-[10px] text-white/25 mt-1">{formatRelative(event.timestamp)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </GlassCard>
  );
}
