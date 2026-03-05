"use client";

import { cn } from "@/lib/utils";

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "green" | "amber" | "red" | "blue" | "purple";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

const variantMap = {
  default: "bg-white/8 text-white/70 border-white/10",
  brand:   "bg-brand-500/15 text-brand-300 border-brand-500/20",
  green:   "bg-green-400/10 text-green-400 border-green-400/20",
  amber:   "bg-amber-400/10 text-amber-400 border-amber-400/20",
  red:     "bg-red-400/10 text-red-400 border-red-400/20",
  blue:    "bg-blue-400/10 text-blue-400 border-blue-400/20",
  purple:  "bg-purple-400/10 text-purple-400 border-purple-400/20",
};

const dotColorMap = {
  default: "bg-white/40",
  brand:   "bg-brand-400",
  green:   "bg-green-400",
  amber:   "bg-amber-400",
  red:     "bg-red-400",
  blue:    "bg-blue-400",
  purple:  "bg-purple-400",
};

const sizeMap = {
  sm: "text-xs px-2 py-0.5 rounded-md",
  md: "text-xs px-2.5 py-1 rounded-lg",
};

export function GlassBadge({ children, variant = "default", size = "sm", className, dot }: GlassBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium border backdrop-blur-sm",
      variantMap[variant],
      sizeMap[size],
      className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColorMap[variant])} />}
      {children}
    </span>
  );
}