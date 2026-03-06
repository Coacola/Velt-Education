"use client";

import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { DollarSign, Search, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GlassTable } from "@/components/glass/GlassTable";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { cn, formatCurrency, formatDate, getPaymentStatusStyle } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { listContainerVariants } from "@/lib/motion";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Invoice } from "@/lib/types/payment";
import type { Student } from "@/lib/types/student";

const col = createColumnHelper<Invoice>();

interface PaymentsClientProps {
  invoices: Invoice[];
  students: Student[];
}

export function PaymentsClient({ invoices, students }: PaymentsClientProps) {
  const [search, setSearch] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const collected = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const outstanding = invoices.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;
  const total = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const collectionRate = total > 0 ? Math.round((collected / total) * 100) : 0;

  const columns = useMemo(() => [
    col.accessor("studentName", { header: "Student", size: 200 }),
    col.accessor("issuedDate", { header: "Issued", cell: i => formatDate(i.getValue()), size: 110 }),
    col.accessor("dueDate", { header: "Due", cell: i => formatDate(i.getValue()), size: 110 }),
    col.accessor("totalAmount", { header: "Total", cell: i => formatCurrency(i.getValue()), size: 90 }),
    col.accessor("paidAmount", { header: "Paid", cell: i => formatCurrency(i.getValue()), size: 90 }),
    col.display({
      id: "balance",
      header: "Balance",
      cell: i => {
        const bal = i.row.original.totalAmount - i.row.original.paidAmount;
        return <span className={cn("font-medium", bal > 0 ? "text-red-400" : "text-white/40")}>{bal > 0 ? formatCurrency(bal) : "—"}</span>;
      },
      size: 90,
    }),
    col.accessor("status", {
      header: "Status",
      cell: i => {
        const s = getPaymentStatusStyle(i.getValue());
        return <GlassBadge variant={i.getValue() === "paid" ? "green" : i.getValue() === "partial" ? "amber" : "red"} dot>{s.label}</GlassBadge>;
      },
      size: 130,
    }),
  ], []);

  return (
    <AnimatedPage>
      <PageHeader
        title="Payments"
        description="Invoice and payment management"
        actions={<GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setPayModalOpen(true)}>Record Payment</GlassButton>}
      />

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={listContainerVariants} initial="hidden" animate="visible">
        <KpiCard title="Collected" value={formatCurrency(collected)} icon={<CheckCircle className="w-4 h-4" />} iconColor="text-green-400" iconBg="bg-green-400/10" glow="green" />
        <KpiCard title="Outstanding" value={formatCurrency(outstanding)} icon={<Clock className="w-4 h-4" />} iconColor="text-amber-400" iconBg="bg-amber-400/10" glow="amber" />
        <KpiCard title="Overdue" value={overdueCount} icon={<AlertTriangle className="w-4 h-4" />} iconColor="text-red-400" iconBg="bg-red-400/10" glow="red" />
        <KpiCard title="Collection Rate" value={`${collectionRate}%`} icon={<DollarSign className="w-4 h-4" />} iconColor="text-brand-400" iconBg="bg-brand-500/10" />
      </motion.div>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-full sm:w-64">
          <GlassInput placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
        </div>
      </div>
      <GlassTable
        columns={columns}
        data={invoices}
        globalFilter={debouncedSearch}
        pagination
        mobileCardRenderer={(invoice) => {
          const bal = invoice.totalAmount - invoice.paidAmount;
          const ps = getPaymentStatusStyle(invoice.status);
          return (
            <div className="glass-panel p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/90">{invoice.studentName}</p>
                <GlassBadge variant={invoice.status === "paid" ? "green" : invoice.status === "partial" ? "amber" : "red"} dot size="sm">
                  {ps.label}
                </GlassBadge>
              </div>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Total: {formatCurrency(invoice.totalAmount)}</span>
                <span>Paid: {formatCurrency(invoice.paidAmount)}</span>
                <span className={cn("font-medium", bal > 0 ? "text-red-400" : "text-white/40")}>
                  {bal > 0 ? formatCurrency(bal) : "—"}
                </span>
              </div>
              <div className="text-xs text-white/35">
                Due: {formatDate(invoice.dueDate)}
              </div>
            </div>
          );
        }}
      />

      <GlassModal open={payModalOpen} onClose={() => setPayModalOpen(false)} title="Record Payment" size="md"
        footer={<><GlassButton variant="ghost" onClick={() => setPayModalOpen(false)}>Cancel</GlassButton><GlassButton variant="primary" onClick={() => { setPayModalOpen(false); toast.success("Payment recorded"); }}>Record</GlassButton></>}
      >
        <div className="space-y-4">
          <GlassSelect label="Student" options={students.map(s => ({value:s.id,label:s.fullName}))} />
          <GlassInput label="Amount (EUR)" type="number" placeholder="0" />
          <GlassSelect label="Method" options={[{value:"cash",label:"Cash"},{value:"bank_transfer",label:"Bank Transfer"},{value:"card",label:"Card"}]} />
          <GlassInput label="Date" type="date" />
          <GlassInput label="Notes" placeholder="Optional notes" />
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
