"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-white/60 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-11 sm:h-10 rounded-xl px-3 text-sm",
              "bg-white/5 border border-white/10",
              "text-white/95 placeholder:text-white/25",
              "transition-all duration-150",
              "focus:outline-none focus:border-brand-500/60 focus:bg-white/8 focus:ring-2 focus:ring-brand-500/20",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/35">{hint}</p>}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-white/60 uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-xl px-3 py-2.5 text-sm min-h-[80px] resize-none",
            "bg-white/5 border border-white/10",
            "text-white/95 placeholder:text-white/25",
            "transition-all duration-150",
            "focus:outline-none focus:border-brand-500/60 focus:bg-white/8 focus:ring-2 focus:ring-brand-500/20",
            error && "border-red-500/60",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

GlassTextarea.displayName = "GlassTextarea";