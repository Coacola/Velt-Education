"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, MessageSquare, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { updateStudent } from "@/lib/actions/students";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { EditStudentModal } from "./modals/EditStudentModal";
import { cn, formatCurrency, formatPercent, formatDate, getAttendanceColor, getGradeColor, getPaymentStatusStyle, getAttendanceStatusStyle } from "@/lib/utils";
import type { Student } from "@/lib/types/student";
import type { Class } from "@/lib/types/class";
import type { Invoice } from "@/lib/types/payment";
import type { AttendanceSession } from "@/lib/types/attendance";
import type { Exam } from "@/lib/types/exam";

interface StudentProfileClientProps {
  student: Student;
  classes: Class[];
  invoices: Invoice[];
  sessions: AttendanceSession[];
  exams: Exam[];
  basePath?: string; // "/admin" (default) or "/teacher"
}

export function StudentProfileClient({ student, classes, invoices, sessions, exams, basePath = "/admin" }: StudentProfileClientProps) {
  const isAdmin = basePath === "/admin";
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [notesValue, setNotesValue] = useState(student.notes || "");
  const [notesSaving, startNotesTransition] = useTransition();

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "attendance", label: "Attendance" },
    { id: "payments", label: "Payments" },
    { id: "grades", label: "Grades" },
    { id: "notes", label: "Notes" },
  ];

  const paymentStyle = getPaymentStatusStyle(student.paymentStatus);

  const handleSaveNotes = () => {
    startNotesTransition(async () => {
      const result = await updateStudent(student.id, { notes: notesValue });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Notes saved");
    });
  };

  return (
    <AnimatedPage>
      {/* Back button */}
      <Link href={`${basePath}/students`} className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Students
      </Link>

      {/* Header */}
      <GlassCard padding="lg" className="mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white shadow-glow-brand flex-shrink-0">
            {student.firstName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white/95">{student.fullName}</h1>
              <GlassBadge variant="brand">{student.year}΄</GlassBadge>
              {student.atRisk && <GlassBadge variant="red" dot>At Risk</GlassBadge>}
              <GlassBadge variant={student.paymentStatus === "paid" ? "green" : student.paymentStatus === "partial" ? "amber" : "red"} dot>
                {paymentStyle.label}
              </GlassBadge>
            </div>
            <p className="text-sm text-white/45 mt-1">{student.school} · Enrolled since {formatDate(student.enrolledSince)}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-xs"><span className="text-white/40">Attendance:</span> <span className={cn("font-semibold", getAttendanceColor(student.attendanceRate))}>{formatPercent(student.attendanceRate)}</span></div>
              <div className="text-xs"><span className="text-white/40">Avg Grade:</span> <span className={cn("font-semibold", getGradeColor(student.avgGrade))}>{student.avgGrade.toFixed(1)}/20</span></div>
              {student.outstandingBalance > 0 && (
                <div className="text-xs"><span className="text-white/40">Outstanding:</span> <span className="font-semibold text-red-400">{formatCurrency(student.outstandingBalance)}</span></div>
              )}
              <div className="text-xs"><span className="text-white/40">Monthly Fee:</span> <span className="font-semibold text-white/80">{formatCurrency(student.monthlyFee)}</span></div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <GlassButton variant="secondary" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setEditOpen(true)}>Edit</GlassButton>
              <GlassButton variant="secondary" size="sm" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>Record Payment</GlassButton>
              <GlassButton variant="ghost" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>Message Parent</GlassButton>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 bg-white/3 rounded-xl border border-white/6 w-full sm:w-fit overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-brand-500/20 text-brand-300 shadow-inner"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/70 mb-3">Contact Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white/80">{student.email}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Phone</span><span className="text-white/80">{student.phone}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Parent</span><span className="text-white/80">{student.parentName}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Parent Phone</span><span className="text-white/80">{student.parentPhone}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Monthly Fee</span><span className="text-white/80 font-medium">{formatCurrency(student.monthlyFee)}</span></div>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/70 mb-3">Enrolled Classes</h3>
            <div className="space-y-2">
              {classes.length === 0 && <p className="text-sm text-white/30">Not enrolled in any classes yet.</p>}
              {classes.map(cls => (
                <Link key={cls.id} href={`${basePath}/classes/${cls.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cls.color }} />
                    <div>
                      <p className="text-sm font-medium text-white/85">{cls.name}</p>
                      <p className="text-xs text-white/40">{cls.schedule.map(s => `${s.day} ${s.startTime}`).join(", ")}</p>
                    </div>
                  </div>
                  <GlassBadge>{cls.subject}</GlassBadge>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "attendance" && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Attendance History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Date</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Class</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.flatMap(session =>
                  session.records.filter(r => r.studentId === student.id).map(record => {
                    const style = getAttendanceStatusStyle(record.status);
                    return (
                      <tr key={`${session.id}-${record.studentId}`} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-3 py-2.5 text-sm text-white/70">{formatDate(session.date)}</td>
                        <td className="px-3 py-2.5 text-sm text-white/70">{session.className}</td>
                        <td className="px-3 py-2.5">
                          <GlassBadge variant={record.status === "present" ? "green" : record.status === "absent" ? "red" : record.status === "late" ? "amber" : "default"} dot size="sm">
                            {style.label}
                          </GlassBadge>
                        </td>
                      </tr>
                    );
                  })
                )}
                {sessions.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-8 text-sm text-white/30">No attendance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {activeTab === "payments" && (
        <div className="space-y-4">
          {/* Outstanding balance summary */}
          {invoices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GlassCard className="!p-4">
                <p className="text-xs text-white/40 mb-1">Total Billed</p>
                <p className="text-lg font-bold text-white/90">{formatCurrency(invoices.reduce((s, i) => s + i.totalAmount, 0))}</p>
              </GlassCard>
              <GlassCard className="!p-4">
                <p className="text-xs text-white/40 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(invoices.reduce((s, i) => s + i.paidAmount, 0))}</p>
              </GlassCard>
              <GlassCard className="!p-4">
                <p className="text-xs text-white/40 mb-1">Outstanding Balance</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(invoices.reduce((s, i) => s + Math.max(0, i.totalAmount - i.paidAmount), 0))}</p>
              </GlassCard>
            </div>
          )}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white/70 mb-3">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Date</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Description</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Amount</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Paid</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Balance</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const ps = getPaymentStatusStyle(inv.status);
                    const balance = inv.totalAmount - inv.paidAmount;
                    return (
                      <tr key={inv.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-3 py-2.5 text-sm text-white/70">{formatDate(inv.issuedDate)}</td>
                        <td className="px-3 py-2.5 text-sm text-white/50">{inv.notes || "Tuition"}</td>
                        <td className="px-3 py-2.5 text-sm text-white/70">{formatCurrency(inv.totalAmount)}</td>
                        <td className="px-3 py-2.5 text-sm text-white/70">{formatCurrency(inv.paidAmount)}</td>
                        <td className="px-3 py-2.5 text-sm"><span className={cn("font-medium", balance > 0 ? "text-red-400" : "text-white/40")}>{balance > 0 ? formatCurrency(balance) : "—"}</span></td>
                        <td className="px-3 py-2.5">
                          <GlassBadge variant={inv.status === "paid" ? "green" : inv.status === "partial" ? "amber" : "red"} dot>{ps.label}</GlassBadge>
                        </td>
                      </tr>
                    );
                  })}
                  {invoices.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-sm text-white/30">No invoices yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "grades" && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Exam Grades</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Exam</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Subject</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Date</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase">Score</th>
                </tr>
              </thead>
              <tbody>
                {exams.flatMap(exam =>
                  exam.grades.filter(g => g.studentId === student.id).map(grade => (
                    <tr key={`${exam.id}-${grade.studentId}`} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-3 py-2.5 text-sm text-white/80 font-medium">{exam.title}</td>
                      <td className="px-3 py-2.5 text-sm text-white/60">{exam.subject}</td>
                      <td className="px-3 py-2.5 text-sm text-white/60">{formatDate(exam.date)}</td>
                      <td className="px-3 py-2.5"><span className={cn("font-bold", getGradeColor(grade.score))}>{grade.score}/{exam.maxScore}</span></td>
                    </tr>
                  ))
                )}
                {exams.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-sm text-white/30">No exam grades yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {activeTab === "notes" && (
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70">Notes</h3>
            <GlassButton
              variant="secondary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSaveNotes}
              disabled={notesSaving || notesValue === (student.notes || "")}
            >
              {notesSaving ? "Saving..." : "Save Notes"}
            </GlassButton>
          </div>
          <textarea
            value={notesValue}
            onChange={e => setNotesValue(e.target.value)}
            rows={6}
            className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-white/90 placeholder:text-white/25 transition-all duration-150 focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 resize-none"
            placeholder="Add notes about this student..."
          />
        </GlassCard>
      )}

      {isAdmin && <EditStudentModal open={editOpen} onClose={() => setEditOpen(false)} student={student} />}
    </AnimatedPage>
  );
}
