"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  breadcrumb?: string;
}

export function PageHeader({ title, description, actions, className, breadcrumb }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div>
        {breadcrumb && (
          <p className="text-xs text-white/35 mb-1 uppercase tracking-wide font-medium">{breadcrumb}</p>
        )}
        <h1 className="text-xl font-semibold text-white/95">{title}</h1>
        {description && <p className="text-sm text-white/50 mt-0.5">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}