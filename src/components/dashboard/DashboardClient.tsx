"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, AlertTriangle, CalendarCheck } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "./KpiCard";
import { RevenueChart } from "./RevenueChart";
import { AttendanceChart } from "./AttendanceChart";
import { ActivityFeed } from "./ActivityFeed";
import { UnpaidWidget } from "./UnpaidWidget";
import { RiskWidget } from "./RiskWidget";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { listContainerVariants } from "@/lib/motion";
import type { Student } from "@/lib/types/student";
import type { ActivityEvent } from "@/lib/types/activity";

interface DashboardClientProps {
  students: Student[];
  activity: ActivityEvent[];
  totalStudents: number;
  monthlyCollected: number;
  totalOutstanding: number;
  avgAttendance: number;
  atRiskStudents: Student[];
  revenueTrend: { month: string; revenue: number; collected: number }[];
  attendanceTrend: { week: string; present: number; absent: number; late: number }[];
}

export function DashboardClient({
  students, activity, totalStudents, monthlyCollected, totalOutstanding,
  avgAttendance, atRiskStudents, revenueTrend, attendanceTrend,
}: DashboardClientProps) {
  return (
    <AnimatedPage>
      <PageHeader title="Command Center" description="Overview of Velt Education operations" />

      {/* KPI Row */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <KpiCard
          title="Active Students"
          value={totalStudents}
          change={8}
          changeLabel="vs last month"
          icon={<Users className="w-4 h-4" />}
          iconColor="text-brand-400"
          iconBg="bg-brand-500/10"
          glow="brand"
        />
        <KpiCard
          title="Monthly Collected"
          value={formatCurrency(monthlyCollected)}
          change={5}
          changeLabel="vs last month"
          icon={<DollarSign className="w-4 h-4" />}
          iconColor="text-green-400"
          iconBg="bg-green-400/10"
          glow="green"
        />
        <KpiCard
          title="Outstanding Balance"
          value={formatCurrency(totalOutstanding)}
          change={-12}
          changeLabel="vs last month"
          icon={<DollarSign className="w-4 h-4" />}
          iconColor="text-amber-400"
          iconBg="bg-amber-400/10"
          glow="amber"
        />
        <KpiCard
          title="Attendance Rate (30d)"
          value={formatPercent(avgAttendance)}
          change={3}
          changeLabel="vs last month"
          icon={<CalendarCheck className="w-4 h-4" />}
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
        />
      </motion.div>

      {/* Row 2: Charts + Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-8">
          <RevenueChart data={revenueTrend} />
        </div>
        <div className="lg:col-span-4">
          <UnpaidWidget students={students} />
        </div>
      </div>

      {/* Row 3: Attendance Chart + Activity Feed + Risk Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <AttendanceChart data={attendanceTrend} />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeed events={activity} />
        </div>
        <div className="lg:col-span-3">
          <RiskWidget students={atRiskStudents} />
        </div>
      </div>
    </AnimatedPage>
  );
}
