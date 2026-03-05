"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { backdropVariants, modalContentVariants } from "@/lib/motion";
import { GlassButton } from "./GlassButton";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function GlassModal({ open, onClose, title, description, children, size = "md", footer }: GlassModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/70"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "relative w-full rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)]",
              "bg-canvas-800/95 border border-white/10",
              "overflow-hidden z-10",
              sizeMap[size]
            )}
            style={{ backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-white/8">
              <div>
                <h2 className="text-base font-semibold text-white/95">{title}</h2>
                {description && <p className="text-sm text-white/50 mt-0.5">{description}</p>}
              </div>
              <GlassButton variant="ghost" size="icon" onClick={onClose} className="mt-0.5 flex-shrink-0">
                <X className="w-4 h-4" />
              </GlassButton>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8 bg-white/2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}