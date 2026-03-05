"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/glass/GlassCard";

interface RevenueChartProps {
  data: { month: string; revenue: number; collected: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <GlassCard padding="lg" className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Revenue Trend</h3>
          <p className="text-xs text-white/35 mt-0.5">Last 6 months</p>
        </div>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c6cff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6c6cff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.35)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.35)" }} tickFormatter={v => `€${v / 1000}k`} />
            <Tooltip
              contentStyle={{
                background: "rgba(13,13,26,0.95)", border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "12px", backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.90)", fontWeight: 500, fontSize: "13px" }}
              itemStyle={{ color: "rgba(255,255,255,0.70)", fontSize: "12px" }}
              formatter={(value: number) => [`€${value.toLocaleString()}`, undefined]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#6c6cff" strokeWidth={2} fill="url(#revGrad)" name="Expected" />
            <Area type="monotone" dataKey="collected" stroke="#34d399" strokeWidth={2} fill="url(#colGrad)" name="Collected" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
