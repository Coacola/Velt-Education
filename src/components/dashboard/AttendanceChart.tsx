"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GlassCard } from "@/components/glass/GlassCard";

interface AttendanceChartProps {
  data: { week: string; present: number; absent: number; late: number }[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <GlassCard padding="lg" className="h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white/80">Attendance Breakdown</h3>
        <p className="text-xs text-white/35 mt-0.5">Weekly overview (%)</p>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
            <Tooltip
              contentStyle={{
                background: "rgba(13,13,26,0.95)", border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "12px", backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.90)", fontWeight: 500 }}
              itemStyle={{ color: "rgba(255,255,255,0.70)", fontSize: "12px" }}
            />
            <Bar dataKey="present" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} name="Present" />
            <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
            <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
