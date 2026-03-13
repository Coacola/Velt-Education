"use client";

import { useState, useMemo, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList, Plus, Trash2, X, Upload, FileText,
  Paperclip, CheckCircle2, Clock, BookTemplate, Copy,
  Calendar, Users, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { createHomeworkAsTeacher, deleteHomeworkAsTeacher } from "@/lib/actions/teacher-homework";
import { createTemplateAsTeacher, deleteTemplateAsTeacher } from "@/lib/actions/teacher-templates";
import type { TeacherHomework } from "@/lib/services/teacher-homework";
import type { HomeworkTemplate } from "@/lib/services/teacher-templates";
import type { Class } from "@/lib/types/class";
import type { HomeworkAttachment } from "@/lib/types/homework";

interface TeacherHomeworkClientProps {
  homework: TeacherHomework[];
  classes: Class[];
  templates: HomeworkTemplate[];
}

type Tab = "assignments" | "templates";

export function TeacherHomeworkClient({ homework, classes, templates }: TeacherHomeworkClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("assignments");
  const [classFilter, setClassFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [prefillTemplate, setPrefillTemplate] = useState<HomeworkTemplate | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const sorted = [...homework].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    if (classFilter === "all") return sorted;
    return sorted.filter(h => h.classId === classFilter);
  }, [homework, classFilter]);

  const stats = useMemo(() => ({
    total: homework.length,
    withAttachments: homework.filter(h => h.attachments.length > 0).length,
    requireSubmission: homework.filter(h => h.requiresSubmission).length,
  }), [homework]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also remove all student submissions.`)) return;
    startTransition(async () => {
      const result = await deleteHomeworkAsTeacher(id);
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Homework deleted");
      router.refresh();
    });
  };

  const handleDeleteTemplate = (id: string, title: string) => {
    if (!confirm(`Delete template "${title}"?`)) return;
    startTransition(async () => {
      const result = await deleteTemplateAsTeacher(id);
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Template deleted");
      router.refresh();
    });
  };

  const handleUseTemplate = (tpl: HomeworkTemplate) => {
    setPrefillTemplate(tpl);
    setShowModal(true);
  };

  const isDueSoon = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return diff >= 0 && diff <= 3;
  };

  const isPastDue = (dateStr: string) =>
    new Date(dateStr) < new Date(new Date().toDateString());

  return (
    <AnimatedPage>
      <PageHeader
        title="Homework"
        description="Create and manage assignments for your classes"
        actions={
          <div className="flex gap-2">
            <GlassButton onClick={() => { setShowTemplateModal(true); }} variant="ghost" leftIcon={<BookTemplate className="w-4 h-4" />}>
              New Template
            </GlassButton>
            <GlassButton onClick={() => { setPrefillTemplate(null); setShowModal(true); }} leftIcon={<Plus className="w-4 h-4" />}>
              New Assignment
            </GlassButton>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5 pb-1">
        {([
          { key: "assignments" as Tab, label: "Assignments", count: homework.length },
          { key: "templates" as Tab, label: "Templates", count: templates.length },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white/10 text-white border-b-2 border-brand-500"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.label} <span className="text-[10px] text-white/30 ml-1">({t.count})</span>
          </button>
        ))}
      </div>

      {tab === "assignments" ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <GlassCard padding="sm">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-lg font-bold text-white/90">{stats.total}</p>
                  <p className="text-[10px] text-white/40">Total Assignments</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard padding="sm">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-white/90">{stats.withAttachments}</p>
                  <p className="text-[10px] text-white/40">With PDFs</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard padding="sm">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-lg font-bold text-white/90">{stats.requireSubmission}</p>
                  <p className="text-[10px] text-white/40">Require Upload</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Class filter */}
          <div className="flex gap-1 mb-4 flex-wrap">
            <button
              onClick={() => setClassFilter("all")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                classFilter === "all" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              All Classes
            </button>
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setClassFilter(cls.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  classFilter === cls.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>

          {/* Homework list */}
          {filtered.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-white/30 text-center py-12">
                No homework assignments yet. Create your first one!
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {filtered.map(hw => (
                <GlassCard key={hw.id} padding="sm" className={`transition-opacity ${isPending ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold text-white/90">{hw.title}</h4>
                        {hw.requiresSubmission && <GlassBadge variant="purple" size="sm">PDF Required</GlassBadge>}
                        {hw.attachments.length > 0 && (
                          <GlassBadge variant="blue" size="sm">
                            <Paperclip className="w-2.5 h-2.5 mr-1 inline" />
                            {hw.attachments.length} PDF{hw.attachments.length > 1 ? "s" : ""}
                          </GlassBadge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <GlassBadge size="sm">{hw.subject}</GlassBadge>
                        <span className="text-[10px] text-white/30">{hw.className}</span>
                      </div>
                      {hw.description && <p className="text-xs text-white/40 line-clamp-2 mb-2">{hw.description}</p>}
                      {hw.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {hw.attachments.map((att, i) => (
                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
                            >
                              <FileText className="w-3 h-3 text-red-400" />{att.name}
                              <span className="text-white/20">({(att.size / 1024).toFixed(0)}KB)</span>
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-[10px] text-white/30">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(hw.dueDate).toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" })}
                          {isPastDue(hw.dueDate) && <span className="text-red-400 ml-1">Past due</span>}
                          {!isPastDue(hw.dueDate) && isDueSoon(hw.dueDate) && <span className="text-amber-400 ml-1">Due soon</span>}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {hw.completedCount}/{hw.studentCount} completed
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(hw.id, hw.title)} disabled={isPending}
                      className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Templates tab */
        <>
          {templates.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <BookTemplate className="w-8 h-8 text-white/15 mx-auto mb-3" />
                <p className="text-sm text-white/30 mb-1">No templates yet</p>
                <p className="text-xs text-white/20">Create a reusable template to quickly assign homework to any class.</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map(tpl => (
                <GlassCard key={tpl.id} padding="sm" className={`transition-opacity ${isPending ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-white/90">{tpl.title}</h4>
                    <button onClick={() => handleDeleteTemplate(tpl.id, tpl.title)} disabled={isPending}
                      className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {tpl.description && <p className="text-xs text-white/40 line-clamp-2 mb-2">{tpl.description}</p>}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {tpl.requiresSubmission && <GlassBadge variant="purple" size="sm">PDF Required</GlassBadge>}
                    {tpl.attachments.length > 0 && (
                      <GlassBadge variant="blue" size="sm">
                        <Paperclip className="w-2.5 h-2.5 mr-1 inline" />{tpl.attachments.length} PDF{tpl.attachments.length > 1 ? "s" : ""}
                      </GlassBadge>
                    )}
                  </div>
                  <GlassButton onClick={() => handleUseTemplate(tpl)} variant="ghost" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />}>
                    Use Template
                  </GlassButton>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}

      {/* Assignment creation modal */}
      {showModal && (
        <HomeworkModal
          classes={classes}
          prefill={prefillTemplate}
          onClose={() => { setShowModal(false); setPrefillTemplate(null); }}
          isPending={isPending}
          onSubmit={(data) => {
            startTransition(async () => {
              const result = await createHomeworkAsTeacher(data);
              if ("error" in result) { toast.error(result.error); return; }
              toast.success("Homework created!");
              setShowModal(false);
              setPrefillTemplate(null);
              router.refresh();
            });
          }}
        />
      )}

      {/* Template creation modal */}
      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          isPending={isPending}
          onSubmit={(data) => {
            startTransition(async () => {
              const result = await createTemplateAsTeacher(data);
              if ("error" in result) { toast.error(result.error); return; }
              toast.success("Template saved!");
              setShowTemplateModal(false);
              router.refresh();
            });
          }}
        />
      )}
    </AnimatedPage>
  );
}

/* ================= CLASS PICKER ================= */

function ClassPicker({ classes, selectedId, onSelect }: {
  classes: Class[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2">Select Class *</label>
      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
        {classes.map(cls => {
          const isSelected = cls.id === selectedId;
          const scheduleStr = cls.schedule
            .map(s => `${s.day.slice(0, 3)} ${s.startTime}–${s.endTime}`)
            .join(", ");

          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => onSelect(cls.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? "bg-brand-500/10 border-brand-500/40 ring-1 ring-brand-500/20"
                  : "bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                    <span className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-white/80"}`}>
                      {cls.name}
                    </span>
                    <GlassBadge size="sm">{cls.subject}</GlassBadge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-4">
                    {scheduleStr && (
                      <span className="text-[10px] text-white/35 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {scheduleStr}
                      </span>
                    )}
                    <span className="text-[10px] text-white/35 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cls.studentIds.length} students
                    </span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? "border-brand-500 bg-brand-500" : "border-white/20"
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================= HOMEWORK MODAL ================= */

interface HomeworkModalProps {
  classes: Class[];
  prefill: HomeworkTemplate | null;
  onClose: () => void;
  onSubmit: (data: {
    classId: string;
    title: string;
    description?: string;
    dueDate: string;
    attachments: HomeworkAttachment[];
    requiresSubmission: boolean;
  }) => void;
  isPending: boolean;
}

function HomeworkModal({ classes, prefill, onClose, onSubmit, isPending }: HomeworkModalProps) {
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState(prefill?.title || "");
  const [description, setDescription] = useState(prefill?.description || "");
  const [dueDate, setDueDate] = useState("");
  const [requiresSubmission, setRequiresSubmission] = useState(prefill?.requiresSubmission || false);
  const [attachments, setAttachments] = useState<HomeworkAttachment[]>(prefill?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "application/pdf") { toast.error(`${file.name} is not a PDF`); continue; }
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10MB limit`); continue; }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) { const err = await res.json(); toast.error(err.error || "Upload failed"); continue; }
        const result: HomeworkAttachment = await res.json();
        setAttachments(prev => [...prev, result]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) { toast.error("Please select a class"); return; }
    if (!title || !dueDate) { toast.error("Please fill in required fields"); return; }
    onSubmit({ classId, title, description: description || undefined, dueDate, attachments, requiresSubmission });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a1a]/95 border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white/90">New Assignment</h3>
            {prefill && <p className="text-[10px] text-brand-400 mt-0.5">From template: {prefill.title}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class picker */}
          <ClassPicker classes={classes} selectedId={classId} onSelect={setClassId} />

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 Exercises"
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Optional instructions..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50 resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Due Date *</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 focus:outline-none focus:border-brand-500/50"
              required
            />
          </div>

          {/* PDF Attachments */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              PDF Attachments <span className="text-white/20">(worksheets, readings, etc.)</span>
            </label>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple
              onChange={handleFileUpload} className="hidden"
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="w-full px-3 py-3 rounded-xl bg-white/5 border border-dashed border-white/15 text-sm text-white/40 hover:text-white/60 hover:bg-white/8 hover:border-white/25 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" />Click to upload PDFs</>
              )}
            </button>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-white/70 truncate flex-1">{att.name}</span>
                    <span className="text-[10px] text-white/30">{(att.size / 1024).toFixed(0)}KB</span>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                      className="p-0.5 rounded text-white/20 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Require Submission */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <button type="button" onClick={() => setRequiresSubmission(!requiresSubmission)}
              className={`relative w-10 h-5 rounded-full transition-colors ${requiresSubmission ? "bg-brand-500" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${requiresSubmission ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <div>
              <p className="text-xs font-medium text-white/80">Require PDF Submission</p>
              <p className="text-[10px] text-white/30">Students must upload a PDF of their work</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <GlassButton type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</GlassButton>
            <GlassButton type="submit" disabled={isPending || !classId || !title || !dueDate} className="flex-1">
              {isPending ? "Creating..." : "Create Assignment"}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= TEMPLATE MODAL ================= */

interface TemplateModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    attachments: HomeworkAttachment[];
    requiresSubmission: boolean;
  }) => void;
  isPending: boolean;
}

function TemplateModal({ onClose, onSubmit, isPending }: TemplateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiresSubmission, setRequiresSubmission] = useState(false);
  const [attachments, setAttachments] = useState<HomeworkAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "application/pdf") { toast.error(`${file.name} is not a PDF`); continue; }
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10MB limit`); continue; }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) { const err = await res.json(); toast.error(err.error || "Upload failed"); continue; }
        const result: HomeworkAttachment = await res.json();
        setAttachments(prev => [...prev, result]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { toast.error("Title is required"); return; }
    onSubmit({ title, description: description || undefined, attachments, requiresSubmission });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a1a]/95 border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white/90">New Template</h3>
            <p className="text-[10px] text-white/30 mt-0.5">Prepare an assignment to reuse across classes</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Weekly Reading Quiz"
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Default instructions for this template..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50 resize-none"
            />
          </div>

          {/* PDF Attachments */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              PDF Attachments <span className="text-white/20">(default materials)</span>
            </label>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple
              onChange={handleFileUpload} className="hidden"
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="w-full px-3 py-3 rounded-xl bg-white/5 border border-dashed border-white/15 text-sm text-white/40 hover:text-white/60 hover:bg-white/8 hover:border-white/25 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" />Click to upload PDFs</>
              )}
            </button>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-white/70 truncate flex-1">{att.name}</span>
                    <span className="text-[10px] text-white/30">{(att.size / 1024).toFixed(0)}KB</span>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                      className="p-0.5 rounded text-white/20 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Require Submission */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <button type="button" onClick={() => setRequiresSubmission(!requiresSubmission)}
              className={`relative w-10 h-5 rounded-full transition-colors ${requiresSubmission ? "bg-brand-500" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${requiresSubmission ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <div>
              <p className="text-xs font-medium text-white/80">Require PDF Submission</p>
              <p className="text-[10px] text-white/30">Students must upload a PDF of their work</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <GlassButton type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</GlassButton>
            <GlassButton type="submit" disabled={isPending || !title} className="flex-1">
              {isPending ? "Saving..." : "Save Template"}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
