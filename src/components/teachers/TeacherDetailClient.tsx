"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, BookOpen, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassModal } from "@/components/glass/GlassModal";
import { EditTeacherModal } from "@/components/teachers/EditTeacherModal";
import { deleteTeacher } from "@/lib/actions/teachers";
import type { Teacher } from "@/lib/types/teacher";
import type { Class } from "@/lib/types/class";

interface TeacherDetailClientProps {
  teacher: Teacher;
  classes: Class[];
}

export function TeacherDetailClient({ teacher, classes }: TeacherDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const studentCount = new Set(classes.flatMap(c => c.studentIds)).size;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTeacher(teacher.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Teacher deleted");
      router.push("/admin/teachers");
    });
  };

  return (
    <AnimatedPage>
      <Link href="/admin/teachers" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />Back to Teachers
      </Link>
      <GlassCard padding="lg" className="mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white shadow-glow-brand flex-shrink-0">{teacher.firstName[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-white/95">{teacher.fullName}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <GlassButton variant="ghost" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setEditOpen(true)}>
                  Edit
                </GlassButton>
                <GlassButton variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteOpen(true)} className="text-red-400 hover:text-red-300">
                  Delete
                </GlassButton>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {teacher.subjects.map(s => <GlassBadge key={s} variant="brand">{s}</GlassBadge>)}
            </div>
            <div className="flex items-center gap-5 mt-3 text-xs text-white/40 flex-wrap">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{teacher.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{teacher.phone}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{classes.length} classes</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{studentCount} students</span>
            </div>
          </div>
        </div>
      </GlassCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Bio</h3>
          <p className="text-sm text-white/60 leading-relaxed">{teacher.bio || "No bio yet."}</p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {teacher.qualifications.map(q => <GlassBadge key={q} variant="purple" size="sm">{q}</GlassBadge>)}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Active Classes</h3>
          {classes.length === 0 ? (
            <p className="text-xs text-white/30 italic py-4 text-center">No classes assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {classes.map(cls => (
                <Link key={cls.id} href={`/admin/classes/${cls.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cls.color }} />
                    <div>
                      <p className="text-sm font-medium text-white/85">{cls.name}</p>
                      <p className="text-xs text-white/35">{cls.studentIds.length} students</p>
                    </div>
                  </div>
                  <GlassBadge size="sm">{cls.year}΄</GlassBadge>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <EditTeacherModal teacher={teacher} open={editOpen} onClose={() => setEditOpen(false)} />

      <GlassModal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Teacher" description="This action cannot be undone." size="sm"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setDeleteOpen(false)} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleDelete} disabled={isPending} className="!bg-red-500/20 !text-red-300 hover:!bg-red-500/30">
              {isPending ? "Deleting..." : "Delete"}
            </GlassButton>
          </>
        }
      >
        <p className="text-sm text-white/60">
          Are you sure you want to delete <strong className="text-white/80">{teacher.fullName}</strong>? This will not affect their existing classes.
        </p>
      </GlassModal>
    </AnimatedPage>
  );
}
