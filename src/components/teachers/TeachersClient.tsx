"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createTeacher } from "@/lib/actions/teachers";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Teacher } from "@/lib/types/teacher";
import type { Class } from "@/lib/types/class";

const SUBJECT_OPTIONS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Informatics", "Economics"];

interface TeachersClientProps {
  teachers: Teacher[];
  classes: Class[];
}

export function TeachersClient({ teachers, classes }: TeachersClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("25");

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSelectedSubjects([]);
    setHourlyRate("25");
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleCreate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (selectedSubjects.length === 0) {
      toast.error("Select at least one subject");
      return;
    }
    startTransition(async () => {
      const result = await createTeacher({
        firstName,
        lastName,
        email,
        phone,
        subjects: selectedSubjects,
        hourlyRate: parseFloat(hourlyRate) || 0,
        qualifications: [],
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`Teacher ${firstName} ${lastName} added`);
      resetForm();
      setCreateOpen(false);
    });
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Teachers"
        description={`${teachers.length} teachers`}
        actions={
          <GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            Add Teacher
          </GlassButton>
        }
      />
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={listContainerVariants} initial="hidden" animate="visible">
        {teachers.map(teacher => {
          const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
          const studentCount = new Set(teacherClasses.flatMap(c => c.studentIds)).size;
          return (
            <motion.div key={teacher.id} variants={listItemVariants}>
              <Link href={`/admin/teachers/${teacher.id}`}>
                <GlassCard hover>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-sm font-bold text-white">{teacher.firstName[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-white/90">{teacher.fullName}</p>
                      <p className="text-xs text-white/40">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {teacher.subjects.map(s => <GlassBadge key={s} size="sm">{s}</GlassBadge>)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{teacherClasses.length} classes</span>
                    <span>{studentCount} students</span>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add Teacher Modal */}
      <GlassModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Teacher" description="Add a new teacher to your center" size="md"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setCreateOpen(false)} disabled={isPending}>Cancel</GlassButton>
            <GlassButton variant="primary" onClick={handleCreate} disabled={isPending}>
              {isPending ? "Adding..." : "Add Teacher"}
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <GlassInput label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <GlassInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <GlassInput label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          <GlassInput label="Hourly Rate (€)" type="number" step="0.01" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
          <div>
            <label className="text-xs font-medium text-white/60 mb-2 block">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleSubject(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSubjects.includes(s)
                      ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
