"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}

const variantMap = {
  primary:   "bg-brand-gradient text-white shadow-glow-brand border border-brand-500/30 hover:brightness-110",
  secondary: "bg-white/5 border border-white/10 text-white/90 hover:bg-white/8 hover:border-white/20 shadow-glass",
  ghost:     "bg-transparent border border-transparent text-white/60 hover:text-white hover:bg-white/5 hover:border-white/10",
  danger:    "bg-danger-gradient text-white shadow-glow-red border border-red-500/30 hover:brightness-110",
  success:   "bg-success-gradient text-white shadow-glow-green border border-green-500/30 hover:brightness-110",
};

const sizeMap = {
  sm:   "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md:   "h-9 px-4 text-sm gap-2 rounded-xl",
  lg:   "h-11 px-6 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-xl justify-center",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, className, variant = "secondary", size = "md", loading, leftIcon, rightIcon, disabled, onClick, type }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium transition-all duration-150",
          "backdrop-blur-[12px] -webkit-backdrop-blur-[12px]",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-1 focus:ring-offset-canvas-950",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantMap[variant],
          sizeMap[size],
          className
        )}
        whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";