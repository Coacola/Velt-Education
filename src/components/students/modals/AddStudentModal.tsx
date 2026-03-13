"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createStudent } from "@/lib/actions/students";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { GlassButton } from "@/components/glass/GlassButton";

const schema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Required"),
  parentName: z.string().min(2, "Required"),
  parentPhone: z.string().min(5, "Required"),
  year: z.enum(["Α", "Β", "Γ"]),
  school: z.string().min(2, "Required"),
  monthlyFee: z.coerce.number().min(0, "Must be 0 or more"),
});

type FormData = z.infer<typeof schema>;

interface AddStudentModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddStudentModal({ open, onClose }: AddStudentModalProps) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: "Α",
      monthlyFee: 140,
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await createStudent(data);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`Student "${data.firstName} ${data.lastName}" added successfully`);
      reset();
      onClose();
    });
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title="Add New Student"
      description="Enter the student details below"
      size="lg"
      footer={
        <>
          <GlassButton variant="ghost" onClick={onClose} disabled={isPending}>Cancel</GlassButton>
          <GlassButton variant="primary" onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? "Adding..." : "Add Student"}
          </GlassButton>
        </>
      }
    >
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label="First Name" {...register("firstName")} error={errors.firstName?.message} placeholder="Enter first name" />
        <GlassInput label="Last Name" {...register("lastName")} error={errors.lastName?.message} placeholder="Enter last name" />
        <GlassInput label="Email" type="email" {...register("email")} error={errors.email?.message} placeholder="student@email.com" />
        <GlassInput label="Phone" {...register("phone")} error={errors.phone?.message} placeholder="+357 99 ..." />
        <GlassInput label="Parent Name" {...register("parentName")} error={errors.parentName?.message} placeholder="Parent full name" />
        <GlassInput label="Parent Phone" {...register("parentPhone")} error={errors.parentPhone?.message} placeholder="+357 99 ..." />
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
        <GlassInput label="School" {...register("school")} error={errors.school?.message} placeholder="School name" />
        <GlassInput label="Monthly Fee (€)" type="number" step="0.01" {...register("monthlyFee")} error={errors.monthlyFee?.message} placeholder="140" />
      </form>
    </GlassModal>
  );
}
