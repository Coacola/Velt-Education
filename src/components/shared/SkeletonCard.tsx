"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-white/6 bg-white/3 p-5 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonKpiCard() {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}