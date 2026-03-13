"use client";

import { User, Mail, Phone, School, Calendar, BookOpen, CreditCard, BarChart3, CalendarCheck } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import type { Student } from "@/lib/types/student";
import type { Class } from "@/lib/types/class";

interface StudentProfileClientProps {
  student: Student;
  classes: Class[];
}

export function StudentProfileClient({ student, classes }: StudentProfileClientProps) {
  return (
    <AnimatedPage>
      <PageHeader
        title="My Profile"
        description="Your student information"
      />

      {/* Profile Header */}
      <GlassCard className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/30 to-brand-600/30 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
            <User className="w-7 h-7 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white/90">{student.fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <GlassBadge variant="brand" size="sm">{student.year}΄ Λυκείου</GlassBadge>
              <GlassBadge size="sm">{student.school}</GlassBadge>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-[10px] text-white/40 mb-1">Attendance</p>
            <p className="text-lg font-bold text-white/90">{student.attendanceRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/40 mb-1">Avg Grade</p>
            <p className="text-lg font-bold text-white/90">{student.avgGrade > 0 ? `${student.avgGrade}/20` : "—"}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/40 mb-1">Classes</p>
            <p className="text-lg font-bold text-white/90">{classes.length}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={student.email} />
            <InfoRow icon={Phone} label="Phone" value={student.phone} />
            <InfoRow icon={School} label="School" value={student.school} />
            <InfoRow icon={Calendar} label="Enrolled Since" value={new Date(student.enrolledSince).toLocaleDateString("el-GR", { month: "long", year: "numeric" })} />
            <InfoRow icon={CreditCard} label="Monthly Fee" value={`€${student.monthlyFee}`} />
          </div>
        </GlassCard>

        {/* Parent/Guardian Info */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Parent / Guardian</h3>
          <div className="space-y-3">
            <InfoRow icon={User} label="Name" value={student.parentName} />
            <InfoRow icon={Phone} label="Phone" value={student.parentPhone} />
          </div>
        </GlassCard>

        {/* Enrolled Classes */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Enrolled Classes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {classes.map(cls => (
              <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white/90 truncate">{cls.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/40">{cls.subject}</span>
                    {cls.schedule.length > 0 && (
                      <>
                        <span className="text-[10px] text-white/20">·</span>
                        <span className="text-[10px] text-white/30">{cls.schedule.map(s => s.day.slice(0, 3)).join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AnimatedPage>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-white/30 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/40">{label}</p>
        <p className="text-sm text-white/80 truncate">{value}</p>
      </div>
    </div>
  );
}
