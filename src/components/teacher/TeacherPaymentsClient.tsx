"use client";

import { useState, useMemo } from "react";
import { CreditCard, AlertTriangle, CheckCircle, Search, LayoutGrid, List } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassTable } from "@/components/glass/GlassTable";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Invoice } from "@/lib/types/payment";
import type { Student } from "@/lib/types/student";

interface TeacherPaymentsClientProps {
  invoices: Invoice[];
  students: Student[];
}

const STATUS_CONFIG = {
  paid: { label: "Paid", variant: "green" as const, icon: CheckCircle },
  partial: { label: "Partial", variant: "amber" as const, icon: AlertTriangle },
  overdue: { label: "Overdue", variant: "red" as const, icon: AlertTriangle },
};

const col = createColumnHelper<Invoice>();

export function TeacherPaymentsClient({ invoices, students }: TeacherPaymentsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Compute summary
  const summary = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const collected = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const outstanding = total - collected;
    const overdue = invoices.filter(i => i.status === "overdue").length;
    return { total, collected, outstanding, overdue };
  }, [invoices]);

  const filtered = useMemo(() => {
    let result = [...invoices].sort((a, b) => b.issuedDate.localeCompare(a.issuedDate));
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i => i.studentName.toLowerCase().includes(q));
    }
    return result;
  }, [invoices, statusFilter, search]);

  const columns = useMemo(() => [
    col.accessor("studentName", {
      header: "Student",
      cell: info => <span className="font-medium text-white/90">{info.getValue()}</span>,
      size: 180,
    }),
    col.accessor("status", {
      header: "Status",
      cell: info => {
        const cfg = STATUS_CONFIG[info.getValue()];
        return <GlassBadge variant={cfg.variant} size="sm">{cfg.label}</GlassBadge>;
      },
      size: 100,
    }),
    col.accessor("totalAmount", {
      header: "Total",
      cell: info => <span className="text-xs font-semibold text-white/80">{formatCurrency(info.getValue())}</span>,
      size: 100,
    }),
    col.accessor("paidAmount", {
      header: "Paid",
      cell: info => <span className="text-xs font-semibold text-emerald-400/70">{formatCurrency(info.getValue())}</span>,
      size: 100,
    }),
    col.display({
      id: "remaining",
      header: "Remaining",
      cell: info => {
        const rem = info.row.original.totalAmount - info.row.original.paidAmount;
        return rem > 0
          ? <span className="text-xs text-amber-400/70">{formatCurrency(rem)}</span>
          : <span className="text-xs text-white/25">—</span>;
      },
      size: 100,
    }),
    col.accessor("dueDate", {
      header: "Due Date",
      cell: info => <span className="text-xs text-white/50">{formatDate(info.getValue())}</span>,
      size: 110,
    }),
    col.accessor("issuedDate", {
      header: "Issued",
      cell: info => <span className="text-xs text-white/40">{formatDate(info.getValue())}</span>,
      size: 110,
    }),
  ], []);

  const viewToggle = (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
      <button
        onClick={() => setViewMode("cards")}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          viewMode === "cards" ? "bg-white/10 text-white/80" : "text-white/30 hover:text-white/50"
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
        title="Payments"
        description={`${filtered.length} invoice${filtered.length !== 1 ? "s" : ""} for your students`}
        actions={viewToggle}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <GlassCard padding="sm">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Total Billed</p>
          <p className="text-lg font-bold text-white/90">{formatCurrency(summary.total)}</p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Collected</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(summary.collected)}</p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Outstanding</p>
          <p className="text-lg font-bold text-amber-400">{formatCurrency(summary.outstanding)}</p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Overdue</p>
          <p className="text-lg font-bold text-red-400">{summary.overdue}</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className={cn(
            "px-3 py-2 rounded-xl text-xs font-medium border bg-transparent transition-colors focus:outline-none appearance-none cursor-pointer",
            statusFilter !== "all"
              ? "border-brand-500/40 text-brand-300 bg-brand-500/10"
              : "border-white/10 text-white/50 hover:border-white/20"
          )}
        >
          <option value="all" className="bg-gray-900">All Statuses</option>
          <option value="paid" className="bg-gray-900">Paid</option>
          <option value="partial" className="bg-gray-900">Partial</option>
          <option value="overdue" className="bg-gray-900">Overdue</option>
        </select>
      </div>

      {/* Invoice list/table */}
      {viewMode === "list" ? (
        <GlassTable
          columns={columns}
          data={filtered}
          emptyTitle="No invoices found"
          emptyDescription="No invoices match your search."
        />
      ) : (
        <motion.div
          className="space-y-3"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map(invoice => {
            const cfg = STATUS_CONFIG[invoice.status];
            const remaining = invoice.totalAmount - invoice.paidAmount;
            return (
              <motion.div key={invoice.id} variants={listItemVariants}>
                <GlassCard padding="sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white/90">{invoice.studentName}</h4>
                      <p className="text-xs text-white/40">
                        Due {formatDate(invoice.dueDate)} · Issued {formatDate(invoice.issuedDate)}
                      </p>
                    </div>
                    <GlassBadge variant={cfg.variant} size="sm">{cfg.label}</GlassBadge>
                  </div>

                  {/* Line items */}
                  {invoice.items.length > 0 && (
                    <div className="mb-2">
                      {invoice.items.map((item, i) => (
                        <p key={i} className="text-xs text-white/35">
                          {item.description} — {formatCurrency(item.amount)}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>
                      Total: <span className="font-semibold text-white/80">{formatCurrency(invoice.totalAmount)}</span>
                    </span>
                    <span>
                      Paid: <span className="font-semibold text-emerald-400/70">{formatCurrency(invoice.paidAmount)}</span>
                    </span>
                    {remaining > 0 && (
                      <span className="text-amber-400/70">
                        Remaining: {formatCurrency(remaining)}
                      </span>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-white/30">No invoices found.</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
