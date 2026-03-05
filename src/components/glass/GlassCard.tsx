"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "brand" | "green" | "red" | "amber" | "none";
  padding?: "sm" | "md" | "lg" | "none";
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
}

const paddingMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  none: "",
};

const glowMap = {
  brand: "hover:shadow-glow-brand",
  green: "hover:shadow-glow-green",
  red:   "hover:shadow-glow-red",
  amber: "hover:shadow-glow-amber",
  none:  "",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = false, glow = "none", padding = "md", onClick, style }, ref) => {
    const base = cn(
      "relative rounded-2xl shadow-glass overflow-hidden",
      "bg-white/5 backdrop-blur-[24px] -webkit-backdrop-blur-[24px]",
      "border border-white/8",
      paddingMap[padding],
      glowMap[glow],
      hover && "transition-all duration-200 cursor-pointer hover:bg-white/8 hover:border-white/18 hover:shadow-glass-hover hover:-translate-y-0.5",
      onClick && "cursor-pointer",
      className
    );

    if (hover || onClick) {
      return (
        <motion.div
          ref={ref}
          className={base}
          whileHover={hover ? { y: -3, scale: 1.01 } : undefined}
          whileTap={onClick ? { scale: 0.99 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={onClick}
          style={style}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={base} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";