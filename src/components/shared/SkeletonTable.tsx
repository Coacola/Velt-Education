"use client";

import { Skeleton } from "./SkeletonCard";

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 5 }: SkeletonTableProps) {
  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden">
      <div className="border-b border-white/8 bg-canvas-900/80 px-4 py-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-white/5 px-4 py-3.5 grid gap-4 last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-3.5 ${j === 0 ? "w-28" : "w-16"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}