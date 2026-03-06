"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function GlassSelect({ label, error, options, placeholder, className, ...props }: GlassSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-white/60 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full h-11 sm:h-10 rounded-xl px-3 pr-8 text-sm appearance-none",
            "bg-white/5 border border-white/10",
            "text-white/90 placeholder:text-white/25",
            "transition-all duration-150",
            "focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-red-500/60",
            className
          )}
          {...props}
        >
          {placeholder && <option value="" className="bg-canvas-800">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-canvas-800">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}