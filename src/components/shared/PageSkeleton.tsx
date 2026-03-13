"use client";

import { Skeleton, SkeletonKpiCard } from "./SkeletonCard";
import { SkeletonTable } from "./SkeletonTable";

/* ─── Dashboard Skeleton ─── */
export function DashboardSkeleton() {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-72 mt-1.5" />
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-3">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Table-Page Skeleton (Students, Attendance, Payments, Exams) ─── */
interface TablePageSkeletonProps {
  title?: boolean;
  kpis?: number;
  filters?: number;
  cols?: number;
  rows?: number;
}

export function TablePageSkeleton({ title = true, kpis = 0, filters = 2, cols = 6, rows = 8 }: TablePageSkeletonProps) {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Header */}
      {title && (
        <div className="flex items-start justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1.5" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      )}
      {/* KPI row */}
      {kpis > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: kpis }).map((_, i) => (
            <SkeletonKpiCard key={i} />
          ))}
        </div>
      )}
      {/* Filter bar */}
      {filters > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          {Array.from({ length: filters }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-xl" />
          ))}
        </div>
      )}
      {/* Table */}
      <SkeletonTable rows={rows} cols={cols} />
    </div>
  );
}

/* ─── Grid-Page Skeleton (Classes, Teachers) ─── */
interface GridPageSkeletonProps {
  title?: boolean;
  cards?: number;
  filters?: number;
}

export function GridPageSkeleton({ title = true, cards = 8, filters = 2 }: GridPageSkeletonProps) {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Header */}
      {title && (
        <div className="flex items-start justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-44 mt-1.5" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      )}
      {/* Filters */}
      {filters > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          {Array.from({ length: filters }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-xl" />
          ))}
        </div>
      )}
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Detail-Page Skeleton (Student detail, Class detail, etc.) ─── */
export function DetailPageSkeleton() {
  return (
    <div className="animate-in fade-in duration-200">
      {/* Back link */}
      <Skeleton className="h-4 w-24 mb-4" />
      {/* Profile header */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-6 mb-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-1.5">
              <Skeleton className="h-3 w-20 mx-auto" />
              <Skeleton className="h-6 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      {/* Content */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-6 space-y-4">
        <Skeleton className="h-4 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Session Detail Skeleton (Attendance marking) ─── */
export function SessionDetailSkeleton() {
  return (
    <div className="animate-in fade-in duration-200">
      <Skeleton className="h-4 w-32 mb-4" />
      {/* Session header */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>
      {/* Student roster */}
      <SkeletonTable rows={6} cols={4} />
    </div>
  );
}
