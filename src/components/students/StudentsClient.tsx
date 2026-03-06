"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Search, Eye, CreditCard, AlertTriangle } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassTable } from "@/components/glass/GlassTable";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { cn, formatCurrency, formatPercent, getPaymentStatusStyle, getAttendanceColor, getGradeColor } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { AddStudentModal } from "./modals/AddStudentModal";
import type { Student, PaymentStatus, SchoolYear } from "@/lib/types/student";

const columnHelper = createColumnHelper<Student>();

interface StudentsClientProps {
  initialData: Student[];
}

export function StudentsClient({ initialData }: StudentsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    let data = initialData;
    if (yearFilter) data = data.filter(s => s.year === yearFilter);
    if (statusFilter) data = data.filter(s => s.paymentStatus === statusFilter);
    if (riskFilter) data = data.filter(s => s.atRisk);
    return data;
  }, [initialData, yearFilter, statusFilter, riskFilter]);

  const columns = useMemo(() => [
    columnHelper.accessor("fullName", {
      header: "Student",
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-300">
            {info.row.original.firstName[0]}
          </div>
          <div>
            <p className="font-medium text-white/90">{info.getValue()}</p>
            <p className="text-xs text-white/40">{info.row.original.school}</p>
          </div>
        </div>
      ),
      size: 220,
    }),
    columnHelper.accessor("year", {
      header: "Year",
      cell: info => <GlassBadge variant="brand">{info.getValue()}΄</GlassBadge>,
      size: 80,
    }),
    columnHelper.accessor("subjects", {
      header: "Subjects",
      cell: info => (
        <div className="flex gap-1 flex-wrap">
          {info.getValue().slice(0, 2).map(s => (
            <GlassBadge key={s} size="sm">{s}</GlassBadge>
          ))}
        </div>
      ),
      enableSorting: false,
      size: 200,
    }),
    columnHelper.accessor("attendanceRate", {
      header: "Attendance",
      cell: info => (
        <span className={cn("font-medium", getAttendanceColor(info.getValue()))}>
          {formatPercent(info.getValue())}
        </span>
      ),
      size: 100,
    }),
    columnHelper.accessor("avgGrade", {
      header: "Avg Grade",
      cell: info => (
        <span className={cn("font-medium", getGradeColor(info.getValue()))}>
          {info.getValue().toFixed(1)}/20
        </span>
      ),
      size: 100,
    }),
    columnHelper.accessor("outstandingBalance", {
      header: "Balance",
      cell: info => (
        <span className={cn("font-medium", info.getValue() > 0 ? "text-red-400" : "text-white/40")}>
          {info.getValue() > 0 ? formatCurrency(info.getValue()) : "—"}
        </span>
      ),
      size: 100,
    }),
    columnHelper.accessor("paymentStatus", {
      header: "Status",
      cell: info => {
        const style = getPaymentStatusStyle(info.getValue());
        return (
          <GlassBadge variant={info.getValue() === "paid" ? "green" : info.getValue() === "partial" ? "amber" : "red"} dot>
            {style.label}
          </GlassBadge>
        );
      },
      size: 130,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: info => (
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <GlassButton variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/admin/students/${info.row.original.id}`); }}>
            <Eye className="w-3.5 h-3.5" />
          </GlassButton>
        </div>
      ),
      size: 50,
    }),
  ], [router]);

  return (
    <AnimatedPage>
      <PageHeader
        title="Students"
        description={`${initialData.length} enrolled students`}
        actions={
          <GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
            Add Student
          </GlassButton>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-5">
        <div className="w-full sm:w-64">
          <GlassInput
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <GlassSelect
          options={[
            { value: "", label: "All Years" },
            { value: "Α", label: "Α΄ Λυκείου" },
            { value: "Β", label: "Β΄ Λυκείου" },
            { value: "Γ", label: "Γ΄ Λυκείου" },
          ]}
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="w-full sm:w-36"
        />
        <GlassSelect
          options={[
            { value: "", label: "All Statuses" },
            { value: "paid", label: "Paid" },
            { value: "partial", label: "Partial" },
            { value: "overdue", label: "Overdue" },
          ]}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-36"
        />
        <GlassButton
          variant={riskFilter ? "danger" : "ghost"}
          size="sm"
          leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
          onClick={() => setRiskFilter(p => !p)}
        >
          At Risk
        </GlassButton>
      </div>

      <GlassTable
        columns={columns}
        data={filtered}
        onRowClick={row => router.push(`/admin/students/${row.id}`)}
        globalFilter={debouncedSearch}
        pagination
        mobileCardRenderer={(student) => (
          <div className="glass-panel p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300">
                  {student.firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{student.fullName}</p>
                  <p className="text-xs text-white/40">{student.school}</p>
                </div>
              </div>
              <GlassBadge variant="brand" size="sm">{student.year}΄</GlassBadge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium", getAttendanceColor(student.attendanceRate))}>
                {formatPercent(student.attendanceRate)} att.
              </span>
              <span className={cn("font-medium", student.outstandingBalance > 0 ? "text-red-400" : "text-white/40")}>
                {student.outstandingBalance > 0 ? formatCurrency(student.outstandingBalance) : "Paid"}
              </span>
              <GlassBadge variant={student.paymentStatus === "paid" ? "green" : student.paymentStatus === "partial" ? "amber" : "red"} dot size="sm">
                {getPaymentStatusStyle(student.paymentStatus).label}
              </GlassBadge>
            </div>
          </div>
        )}
      />

      <AddStudentModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </AnimatedPage>
  );
}
