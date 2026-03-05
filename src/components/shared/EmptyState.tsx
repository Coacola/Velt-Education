"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  description = "Nothing to display here yet.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-8 text-center rounded-2xl border border-white/6 bg-white/2",
      className
    )}>
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-6 h-6 text-white/30" />}
      </div>
      <h3 className="text-sm font-semibold text-white/60 mb-1">{title}</h3>
      <p className="text-xs text-white/35 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}