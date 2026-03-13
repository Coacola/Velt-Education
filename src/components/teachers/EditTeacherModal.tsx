"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTeacher } from "@/lib/actions/teachers";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";
import type { Teacher } from "@/lib/types/teacher";

const SUBJECT_OPTIONS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Informatics", "Economics"];

interface EditTeacherModalProps {
  teacher: Teacher;
  open: boolean;
  onClose: () => void;
}

export function EditTeacherModal({ teacher, open, onClose }: EditTeacherModalProps) {
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState(teacher.firstName);
  const [lastName, setLastName] = useState(teacher.lastName);
  const [email, setEmail] = useState(teacher.email);
  const [phone, setPhone] = useState(teacher.phone);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(teacher.subjects);
  const [hourlyRate, setHourlyRate] = useState(String(teacher.hourlyRate));
  const [bio, setBio] = useState(teacher.bio || "");

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Name is required");
      return;
    }
    startTransition(async () => {
      const result = await updateTeacher(teacher.id, {
        firstName,
        lastName,
        email,
        phone,
        subjects: selectedSubjects,
        hourlyRate: parseFloat(hourlyRate) || 0,
        bio,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Teacher updated");
      onClose();
    });
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Edit Teacher" description="Update teacher information" size="md"
      footer={
        <>
          <GlassButton variant="ghost" onClick={onClose} disabled={isPending}>Cancel</GlassButton>
          <GlassButton variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
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
          <label className="text-xs font-medium text-white/60 mb-2 block">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 resize-none"
          />
        </div>
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
  );
}
