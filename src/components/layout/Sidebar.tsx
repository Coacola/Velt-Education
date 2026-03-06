"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, INSTITUTE_NAME } from "@/lib/constants";
import { sidebarVariants, sidebarLabelVariants } from "@/lib/motion";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ collapsed, onToggle, onNavClick }: { collapsed: boolean; onToggle: () => void; onNavClick?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/7 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center flex-shrink-0 shadow-glow-brand">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <motion.div
          variants={sidebarLabelVariants}
          animate={collapsed ? "collapsed" : "expanded"}
          className="overflow-hidden"
        >
          <p className="text-sm font-semibold text-white/95 whitespace-nowrap">{INSTITUTE_NAME}</p>
          <p className="text-[10px] text-white/35 whitespace-nowrap -mt-0.5">Admin Dashboard</p>
        </motion.div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <div className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onNavClick}>
                <motion.div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150",
                    "group relative",
                    active
                      ? "bg-brand-500/15 text-brand-300"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
                  )}
                  <Icon className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    active ? "text-brand-400" : "text-white/40 group-hover:text-white/70"
                  )} />
                  <motion.span
                    variants={sidebarLabelVariants}
                    animate={collapsed ? "collapsed" : "expanded"}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>

                  {/* Tooltip when collapsed — desktop only */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-canvas-700 border border-white/10 text-xs text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-glass">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="p-3 border-t border-white/7 flex-shrink-0 hidden md:block">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full",
            "text-white/35 hover:text-white/60 hover:bg-white/5 transition-colors duration-150"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
          )}
          <motion.span
            variants={sidebarLabelVariants}
            animate={collapsed ? "collapsed" : "expanded"}
            className="text-xs font-medium whitespace-nowrap overflow-hidden"
          >
            Collapse sidebar
          </motion.span>
        </button>
      </div>
    </>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  // Auto-close mobile drawer on navigation
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? "collapsed" : "expanded"}
        className="hidden md:flex fixed left-0 top-0 h-screen z-30 flex-col overflow-hidden"
        style={{
          background: "rgba(13,13,26,0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
            />
            <motion.aside
              className="fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden w-[280px] md:hidden"
              style={{
                background: "rgba(13,13,26,0.97)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRight: "1px solid rgba(255,255,255,0.07)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={onMobileClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent collapsed={false} onToggle={onToggle} onNavClick={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
