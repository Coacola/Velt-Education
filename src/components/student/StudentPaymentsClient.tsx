"use client";

import { CreditCard, Check, AlertCircle, Clock } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { Invoice } from "@/lib/types/payment";

interface StudentPaymentsClientProps {
  invoices: Invoice[];
}

export function StudentPaymentsClient({ invoices }: StudentPaymentsClientProps) {
  const totalOwed = Math.max(0, invoices.reduce((s, inv) => s + Math.max(0, inv.totalAmount - inv.paidAmount), 0));
  const totalPaid = invoices.reduce((s, inv) => s + inv.paidAmount, 0);
  const overdueCount = invoices.filter(inv => inv.status === "overdue").length;

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return <GlassBadge variant="green" size="sm">Paid</GlassBadge>;
      case "overdue": return <GlassBadge variant="red" size="sm">Overdue</GlassBadge>;
      case "partial": return <GlassBadge variant="amber" size="sm">Partial</GlassBadge>;
      default: return <GlassBadge variant="blue" size="sm">Pending</GlassBadge>;
    }
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="My Payments"
        description="View your invoices and payment history"
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-lg font-bold text-white/90">€{totalPaid}</p>
              <p className="text-[10px] text-white/40">Total Paid</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-lg font-bold text-white/90">€{totalOwed}</p>
              <p className="text-[10px] text-white/40">Outstanding</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-lg font-bold text-white/90">{overdueCount}</p>
              <p className="text-[10px] text-white/40">Overdue</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-white/30 text-center py-8">No invoices found.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => {
            const remaining = inv.totalAmount - inv.paidAmount;
            return (
              <GlassCard key={inv.id} padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white/90">
                        Invoice — {new Date(inv.issuedDate).toLocaleDateString("el-GR", { month: "long", year: "numeric" })}
                      </h4>
                      {statusBadge(inv.status)}
                    </div>
                    <div className="space-y-0.5 mt-2">
                      {inv.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-white/40">
                          <span>{item.description}</span>
                          <span>€{item.amount}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-white/30">
                      <span>Issued: {new Date(inv.issuedDate).toLocaleDateString("el-GR")}</span>
                      <span>Due: {new Date(inv.dueDate).toLocaleDateString("el-GR")}</span>
                      {inv.paidDate && <span>Paid: {new Date(inv.paidDate).toLocaleDateString("el-GR")}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white/90">€{inv.totalAmount}</p>
                    {remaining > 0 && (
                      <p className="text-[10px] text-red-400">€{remaining} due</p>
                    )}
                    {inv.status === "paid" && (
                      <div className="flex items-center gap-1 text-emerald-400 mt-0.5">
                        <Check className="w-3 h-3" />
                        <span className="text-[10px]">Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </AnimatedPage>
  );
}
