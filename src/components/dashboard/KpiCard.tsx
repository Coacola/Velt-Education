"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { listItemVariants } from "@/lib/motion";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  glow?: "brand" | "green" | "red" | "amber";
}

export function KpiCard({
  title, value, change, changeLabel, icon, iconColor = "text-brand-400",
  iconBg = "bg-brand-500/10", glow,
}: KpiCardProps) {
  const glowMap = {
    brand: "hover:shadow-glow-brand",
    green: "hover:shadow-glow-green",
    red:   "hover:shadow-glow-red",
    amber: "hover:shadow-glow-amber",
  };

  return (
    <motion.div
      variants={listItemVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative rounded-2xl p-5 overflow-hidden cursor-pointer",
        "bg-white/5 border border-white/8 shadow-glass",
        "hover:bg-white/8 hover:border-white/18 hover:shadow-glass-hover",
        "transition-all duration-200",
        glow && glowMap[glow]
      )}
      style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-white/45 uppercase tracking-wide">{title}</p>
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <span className={cn("w-4 h-4", iconColor)}>{icon}</span>
        </div>
      </div>

      <p className="text-2xl font-bold text-white/95 tracking-tight">{value}</p>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md",
            change >= 0 ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
          )}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? "+" : ""}{change}%
          </span>
          {changeLabel && <span className="text-xs text-white/30">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
