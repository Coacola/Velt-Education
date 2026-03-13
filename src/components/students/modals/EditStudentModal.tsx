"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateStudent } from "@/lib/actions/students";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { GlassButton } from "@/components/glass/GlassButton";
import type { Student } from "@/lib/types/student";

const schema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().default(""),
  parentName: z.string().default(""),
  parentPhone: z.string().default(""),
  year: z.enum(["Α", "Β", "Γ"]),
  school: z.string().default(""),
  monthlyFee: z.coerce.number().min(0, "Must be 0 or more"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EditStudentModalProps {
  open: boolean;
  onClose: () => void;
  student: Student;
}

export function EditStudentModal({ open, onClose, student }: EditStudentModalProps) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      year: student.year,
      school: student.school,
      monthlyFee: student.monthlyFee,
      notes: student.notes || "",
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await updateStudent(student.id, data);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Student updated successfully");
      onClose();
    });
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title="Edit Student"
      description={`Editing ${student.fullName}`}
      size="lg"
      footer={
        <>
          <GlassButton variant="ghost" onClick={onClose} disabled={isPending}>Cancel</GlassButton>
          <GlassButton variant="primary" onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </GlassButton>
        </>
      }
    >
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label="First Name" {...register("firstName")} error={errors.firstName?.message} />
        <GlassInput label="Last Name" {...register("lastName")} error={errors.lastName?.message} />
        <GlassInput label="Email" type="email" {...register("email")} error={errors.email?.message} />
        <GlassInput label="Phone" {...register("phone")} error={errors.phone?.message} />
        <GlassInput label="Parent Name" {...register("parentName")} error={errors.parentName?.message} />
        <GlassInput label="Parent Phone" {...register("parentPhone")} error={errors.parentPhone?.message} />
        <GlassSelect
          label="Year"
          options={[
            { value: "Α", label: "Α΄ Λυκείου" },
            { value: "Β", label: "Β΄ Λυκείου" },
            { value: "Γ", label: "Γ΄ Λυκείου" },
          ]}
          {...register("year")}
          error={errors.year?.message}
        />
        <GlassInput label="School" {...register("school")} error={errors.school?.message} />
        <GlassInput label="Monthly Fee (€)" type="number" step="0.01" {...register("monthlyFee")} error={errors.monthlyFee?.message} />
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-white/60 uppercase tracking-wide mb-1.5 block">Notes</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-sm bg-white/5 border border-white/10 text-white/90 placeholder:text-white/25 transition-all duration-150 focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 resize-none"
            placeholder="Add notes about this student..."
          />
        </div>
      </form>
    </GlassModal>
  );
}
