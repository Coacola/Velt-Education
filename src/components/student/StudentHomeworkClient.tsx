"use client";

import { useState, useTransition, useRef } from "react";
import { ClipboardList, Check, AlertCircle, Clock, Search, FileText, Upload, Paperclip, Download, X } from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { Homework, HomeworkAttachment } from "@/lib/types/homework";
import { markHomeworkComplete, markHomeworkPending, submitHomeworkFile } from "@/lib/actions/student-homework";

interface StudentHomeworkClientProps {
  homework: Homework[];
}

type Filter = "all" | "pending" | "completed" | "overdue";

export function StudentHomeworkClient({ homework }: StudentHomeworkClientProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const filtered = homework.filter(hw => {
    if (filter !== "all" && hw.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return hw.title.toLowerCase().includes(q) || hw.className.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    pending: homework.filter(h => h.status === "pending").length,
    completed: homework.filter(h => h.status === "completed").length,
    overdue: homework.filter(h => h.status === "overdue").length,
  };

  const handleToggle = (hw: Homework) => {
    // If requires submission, don't allow simple toggle to complete
    if (hw.requiresSubmission && hw.status !== "completed") return;
    startTransition(async () => {
      if (hw.status === "completed") {
        await markHomeworkPending(hw.id);
      } else {
        await markHomeworkComplete(hw.id);
      }
    });
  };

  const handleFileUpload = async (hw: Homework, file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setUploadingId(hw.id);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Upload failed");
        return;
      }

      const result: HomeworkAttachment = await res.json();

      startTransition(async () => {
        await submitHomeworkFile(hw.id, result);
        toast.success("Homework submitted!");
      });
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "completed": return <GlassBadge variant="green" size="sm">Completed</GlassBadge>;
      case "overdue": return <GlassBadge variant="red" size="sm">Overdue</GlassBadge>;
      default: return <GlassBadge variant="amber" size="sm">Pending</GlassBadge>;
    }
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Homework"
        description="Track and complete your assignments"
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-lg font-bold text-white/90">{counts.pending}</p>
              <p className="text-[10px] text-white/40">Pending</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-lg font-bold text-white/90">{counts.completed}</p>
              <p className="text-[10px] text-white/40">Completed</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-lg font-bold text-white/90">{counts.overdue}</p>
              <p className="text-[10px] text-white/40">Overdue</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search homework..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "completed", "overdue"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Homework List */}
      {filtered.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-white/30 text-center py-8">No homework found.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(hw => (
            <HomeworkCard
              key={hw.id}
              hw={hw}
              isPending={isPending}
              uploadingId={uploadingId}
              onToggle={handleToggle}
              onFileUpload={handleFileUpload}
              statusBadge={statusBadge}
            />
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}

/* ---------- Individual homework card ---------- */

interface HomeworkCardProps {
  hw: Homework;
  isPending: boolean;
  uploadingId: string | null;
  onToggle: (hw: Homework) => void;
  onFileUpload: (hw: Homework, file: File) => void;
  statusBadge: (status: string) => React.ReactNode;
}

function HomeworkCard({ hw, isPending, uploadingId, onToggle, onFileUpload, statusBadge }: HomeworkCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadingId === hw.id;

  return (
    <GlassCard padding="sm" className={`transition-opacity ${isPending || isUploading ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox — only for non-submission homework */}
        {!hw.requiresSubmission ? (
          <button
            onClick={() => onToggle(hw)}
            disabled={isPending}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
              hw.status === "completed"
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            {hw.status === "completed" && <Check className="w-3 h-3" />}
          </button>
        ) : (
          <div className="mt-0.5 w-5 h-5 rounded-md border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <Upload className="w-3 h-3 text-purple-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className={`text-sm font-medium ${hw.status === "completed" ? "text-white/40 line-through" : "text-white/90"}`}>
                {hw.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <GlassBadge size="sm">{hw.subject}</GlassBadge>
                <span className="text-[10px] text-white/30">{hw.className}</span>
                {hw.requiresSubmission && (
                  <GlassBadge variant="purple" size="sm">PDF Required</GlassBadge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {statusBadge(hw.status)}
              <span className={`text-[10px] ${hw.status === "overdue" ? "text-red-400" : "text-white/40"}`}>
                Due: {new Date(hw.dueDate).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}
              </span>
            </div>
          </div>

          {hw.description && (
            <p className="text-xs text-white/30 mt-2 line-clamp-2">{hw.description}</p>
          )}

          {/* Teacher attachments */}
          {hw.attachments.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-white/30 mb-1 flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> Materials
              </p>
              <div className="flex flex-wrap gap-1.5">
                {hw.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
                  >
                    <FileText className="w-3 h-3 text-red-400" />
                    {att.name}
                    <Download className="w-2.5 h-2.5 text-white/20" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Submission upload area — only for requiresSubmission homework */}
          {hw.requiresSubmission && (
            <div className="mt-3">
              {hw.submissionFile ? (
                /* Already submitted */
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-emerald-400/80 font-medium">Your Submission</p>
                    <a
                      href={hw.submissionFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-red-400" />
                      {hw.submissionFile.name}
                      <Download className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  {/* Allow re-upload by marking pending first */}
                  <button
                    onClick={() => onToggle(hw)}
                    disabled={isPending}
                    className="text-[10px] text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    Resubmit
                  </button>
                </div>
              ) : hw.status !== "completed" ? (
                /* Upload prompt */
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) onFileUpload(hw, file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isPending}
                    className="w-full px-3 py-2.5 rounded-lg bg-purple-500/5 border border-dashed border-purple-500/20 text-xs text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-purple-400/20 border-t-purple-400/60 rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload your PDF submission
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
