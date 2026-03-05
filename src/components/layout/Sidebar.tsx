"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, INSTITUTE_NAME } from "@/lib/constants";
import { sidebarVariants, sidebarLabelVariants } from "@/lib/motion";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? "collapsed" : "expanded"}
      className="fixed left-0 top-0 h-screen z-30 flex flex-col overflow-hidden"
      style={{
        background: "rgba(13,13,26,0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
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
              <Link key={item.href} href={item.href}>
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

                  {/* Tooltip when collapsed */}
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

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/7 flex-shrink-0">
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
    </motion.aside>
  );
}
