"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, ChevronDown, Settings, LogOut,
  User, ShieldCheck, GraduationCap, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { GlassButton } from "@/components/glass/GlassButton";
import type { NavItem } from "@/components/layout/Sidebar";

interface TopbarUser {
  name?: string;
  email?: string;
}

interface TopbarProps {
  sidebarCollapsed: boolean;
  onMenuToggle: () => void;
  onMobileMenuToggle?: () => void;
  user?: TopbarUser;
  navItems?: readonly NavItem[];
  roleLabel?: string;
  basePath?: string;
}

export function Topbar({ sidebarCollapsed, onMenuToggle, onMobileMenuToggle, user, navItems = NAV_ITEMS, roleLabel = "Admin", basePath = "/admin" }: TopbarProps) {
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentNav = navItems.find(item => {
    if (item.href === basePath) return pathname === basePath;
    return pathname.startsWith(item.href);
  });

  const displayName = user?.name || roleLabel;
  const displayEmail = user?.email || "";

  return (
    <div
      className="fixed top-0 right-0 z-20 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-14 left-0 md:left-[var(--sidebar-width)]"
      style={{
        "--sidebar-width": sidebarCollapsed ? "64px" : "240px",
        transition: "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        background: "rgba(8,8,16,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      } as React.CSSProperties}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMobileMenuToggle}
        className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-white/80 truncate">
          {currentNav?.label ?? "Dashboard"}
        </h2>
      </div>

      {/* Search — icon on mobile, full bar on sm+ */}
      <button
        onClick={() => setOpen(true)}
        className="flex sm:hidden items-center justify-center w-9 h-9 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors flex-shrink-0"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "hidden sm:flex items-center gap-2.5 h-8 px-3 rounded-xl",
          "bg-white/5 border border-white/8 hover:border-white/18 hover:bg-white/8",
          "text-white/35 hover:text-white/50 transition-all duration-150 text-xs min-w-[160px]"
        )}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="text-[10px] bg-white/8 border border-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>

      {/* Notifications */}
      <div className="relative">
        <GlassButton variant="ghost" size="icon" onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }} className="relative">
          <Bell className="w-4 h-4" />
        </GlassButton>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
              style={{ background: "rgba(13,13,26,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
            >
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-sm font-semibold text-white/90">Notifications</p>
              </div>
              <div className="px-4 py-6 text-center text-xs text-white/35">
                No new notifications
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
          className="flex items-center gap-2 pl-2 pr-1 sm:pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center text-xs font-bold text-white shadow-glow-brand">{displayName[0]?.toUpperCase() || "A"}</div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-white/85 leading-none">{displayName}</p>
            <p className="text-[10px] text-white/35 leading-none mt-0.5">{roleLabel}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-colors hidden sm:block" />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
              style={{ background: "rgba(13,13,26,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
            >
              <div className="px-3 py-3 border-b border-white/8">
                <p className="text-xs font-semibold text-white/85">{displayName}</p>
                <p className="text-[10px] text-white/40">{displayEmail}</p>
              </div>
              <div className="p-2">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors">
                  <User className="w-3.5 h-3.5" />Profile
                </button>
                <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors">
                  <Settings className="w-3.5 h-3.5" />Settings
                </button>
                <div className="h-px bg-white/8 my-1.5" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-[-1]" onClick={() => { setNotifOpen(false); setProfileOpen(false); }} />
      )}
    </div>
  );
}
