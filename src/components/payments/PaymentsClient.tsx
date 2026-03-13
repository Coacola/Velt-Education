"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { DollarSign, Search, AlertTriangle, CheckCircle, Clock, Plus, FileText, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { recordPayment, generateMonthlyInvoices } from "@/lib/actions/payments";
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
import type { Invoice } from "@/lib/types/payment";
import type { Student } from "@/lib/types/student";

const col = createColumnHelper<Invoice>();

interface PaymentsClientProps {
  invoices: Invoice[];
  students: Student[];
}

type FilterMode = "all" | "month" | "range";

export function PaymentsClient({ invoices, students }: PaymentsClientProps) {
  const [search, setSearch] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search);

  // Date filtering state
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Form state for recording payment
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Generate invoices state
  const [genMonth, setGenMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Build student phone lookup for search
  const studentPhoneMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students) {
      map.set(s.id, `${s.phone || ""} ${s.parentPhone || ""}`);
    }
    return map;
  }, [students]);

  const resetPayForm = () => {
    setAmount("");
    setMethod("cash");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setSelectedInvoice(null);
  };

  const openPayDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setAmount(String(invoice.totalAmount - invoice.paidAmount));
    setPayModalOpen(true);
  };

  const handleRecord = () => {
    if (!selectedInvoice) return;
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!paymentDate) {
      toast.error("Please select a date");
      return;
    }
    startTransition(async () => {
      const result = await recordPayment({
        invoiceId: selectedInvoice.id,
        studentId: selectedInvoice.studentId,
        amount: amountNum,
        method: method as "cash" | "bank_transfer" | "card",
        paymentDate,
        notes: notes || undefined,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Payment recorded successfully");
      resetPayForm();
      setPayModalOpen(false);
    });
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateMonthlyInvoices(genMonth);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`Generated ${result.data?.generated} invoices for ${genMonth}`);
      setGenerateOpen(false);
    });
  };

  // Filter invoices by date (month or range) + search (name & phone)
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Date filtering
    if (filterMode === "month" && selectedMonth) {
      filtered = filtered.filter(i => i.issuedDate.startsWith(selectedMonth));
    } else if (filterMode === "range") {
      if (dateFrom) {
        filtered = filtered.filter(i => i.issuedDate >= dateFrom);
      }
      if (dateTo) {
        filtered = filtered.filter(i => i.issuedDate <= dateTo);
      }
    }

    // Search by name & phone
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(i => {
        const nameMatch = i.studentName.toLowerCase().includes(q);
        const phones = studentPhoneMap.get(i.studentId) || "";
        const phoneMatch = phones.toLowerCase().includes(q);
        return nameMatch || phoneMatch;
      });
    }

    return [...filtered].sort((a, b) => b.issuedDate.localeCompare(a.issuedDate));
  }, [invoices, filterMode, selectedMonth, dateFrom, dateTo, debouncedSearch, studentPhoneMap]);

  const collected = filteredInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const outstanding = filteredInvoices.reduce((s, i) => s + Math.max(0, i.totalAmount - i.paidAmount), 0);
  const overdueCount = filteredInvoices.filter(i => i.status === "overdue").length;
  const total = filteredInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const collectionRate = total > 0 ? Math.round((collected / total) * 100) : 0;

  const columns = useMemo(() => [
    col.accessor("studentName", {
      header: "Student",
      cell: i => (
        <Link
          href={`/admin/students/${i.row.original.studentId}`}
          className="text-brand-300 hover:text-brand-200 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          {i.getValue()}
        </Link>
      ),
      size: 200,
    }),
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
    col.display({
      id: "actions",
      header: "",
      cell: i => {
        const inv = i.row.original;
        if (inv.status === "paid") return null;
        return (
          <button
            onClick={e => { e.stopPropagation(); openPayDialog(inv); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 hover:border-green-500/40 transition-colors text-xs font-semibold"
          >
            <CreditCard className="w-3 h-3" />
            Pay
          </button>
        );
      },
      size: 90,
    }),
  ], []);

  return (
    <AnimatedPage>
      <PageHeader
        title="Payments"
        description="Invoice and payment management"
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="ghost" leftIcon={<FileText className="w-4 h-4" />} onClick={() => setGenerateOpen(true)}>
              Generate Invoices
            </GlassButton>
            <GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => {
              setSelectedInvoice(null);
              setPayModalOpen(true);
            }}>
              Record Payment
            </GlassButton>
          </div>
        }
      />

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={listContainerVariants} initial="hidden" animate="visible">
        <KpiCard title="Collected" value={formatCurrency(collected)} icon={<CheckCircle className="w-4 h-4" />} iconColor="text-green-400" iconBg="bg-green-400/10" glow="green" />
        <KpiCard title="Outstanding" value={formatCurrency(outstanding)} icon={<Clock className="w-4 h-4" />} iconColor="text-amber-400" iconBg="bg-amber-400/10" glow="amber" />
        <KpiCard title="Overdue" value={overdueCount} icon={<AlertTriangle className="w-4 h-4" />} iconColor="text-red-400" iconBg="bg-red-400/10" glow="red" />
        <KpiCard title="Collection Rate" value={`${collectionRate}%`} icon={<DollarSign className="w-4 h-4" />} iconColor="text-brand-400" iconBg="bg-brand-500/10" />
      </motion.div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search with phone support */}
          <div className="w-full sm:w-72">
            <GlassInput placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
          </div>

          {/* Filter mode tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-xl border border-white/10">
            {([
              { key: "all", label: "All" },
              { key: "month", label: "Month" },
              { key: "range", label: "Date Range" },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterMode(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  filterMode === tab.key
                    ? "bg-brand-500/20 text-brand-300"
                    : "text-white/40 hover:text-white/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Month picker */}
        {filterMode === "month" && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand-500/50 [color-scheme:dark]"
            />
          </div>
        )}

        {/* Date range picker */}
        {filterMode === "range" && (
          <div className="flex items-center gap-3 flex-wrap">
            <Calendar className="w-4 h-4 text-white/30 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder="From"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand-500/50 [color-scheme:dark]"
              />
              <span className="text-white/30 text-xs">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder="To"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand-500/50 [color-scheme:dark]"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <GlassTable
        columns={columns}
        data={filteredInvoices}
        pagination
        mobileCardRenderer={(invoice) => {
          const bal = invoice.totalAmount - invoice.paidAmount;
          const ps = getPaymentStatusStyle(invoice.status);
          return (
            <div className="glass-panel p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <Link href={`/admin/students/${invoice.studentId}`} className="text-sm font-medium text-brand-300">
                  {invoice.studentName}
                </Link>
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/35">Due: {formatDate(invoice.dueDate)}</span>
                {invoice.status !== "paid" && (
                  <button
                    onClick={() => openPayDialog(invoice)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 text-xs font-semibold"
                  >
                    <CreditCard className="w-3 h-3" />
                    Pay
                  </button>
                )}
              </div>
            </div>
          );
        }}
      />

      {/* Mark as Paid Dialog */}
      <GlassModal open={payModalOpen} onClose={() => { setPayModalOpen(false); resetPayForm(); }} title="Record Payment" size="md"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => { setPayModalOpen(false); resetPayForm(); }} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleRecord} disabled={isPending || !selectedInvoice}>
              {isPending ? "Recording..." : "Record Payment"}
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          {selectedInvoice ? (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-sm font-medium text-white/80">{selectedInvoice.studentName}</p>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span>Total: {formatCurrency(selectedInvoice.totalAmount)}</span>
                <span>Paid: {formatCurrency(selectedInvoice.paidAmount)}</span>
                <span className="text-red-400 font-medium">Balance: {formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}</span>
              </div>
              <p className="text-xs text-white/30">Due: {formatDate(selectedInvoice.dueDate)}</p>
            </div>
          ) : (
            <GlassSelect
              label="Select Invoice"
              value=""
              onChange={e => {
                const inv = invoices.find(i => i.id === e.target.value);
                if (inv) openPayDialog(inv);
              }}
              options={invoices.filter(i => i.status !== "paid").map(i => ({
                value: i.id,
                label: `${i.studentName} — ${formatCurrency(i.totalAmount - i.paidAmount)} due`,
              }))}
            />
          )}
          <GlassInput label="Amount (€)" type="number" step="0.01" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
          <GlassSelect label="Payment Method" value={method} onChange={e => setMethod(e.target.value)} options={[{value:"cash",label:"Cash"},{value:"bank_transfer",label:"Bank Transfer"},{value:"card",label:"Card"}]} />
          <GlassInput label="Payment Date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
          <div>
            <label className="text-xs font-medium text-white/60 mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional comments..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 resize-none"
            />
          </div>
        </div>
      </GlassModal>

      {/* Generate Monthly Invoices */}
      <GlassModal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Monthly Invoices" description="Create pending invoices for all students based on their monthly fee" size="sm"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setGenerateOpen(false)} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleGenerate} disabled={isPending}>
              {isPending ? "Generating..." : "Generate"}
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlassInput label="Month" type="month" value={genMonth} onChange={e => setGenMonth(e.target.value)} />
          <p className="text-xs text-white/40">
            This will create invoices for all active students who don&apos;t already have one for the selected month. Each invoice will use the student&apos;s monthly fee.
          </p>
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
