"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { CommandPaletteContext, useCommandPaletteState } from "@/hooks/useCommandPalette";
import { useSidebar } from "@/hooks/useSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar();
  const cmdPalette = useCommandPaletteState();

  return (
    <CommandPaletteContext.Provider value={cmdPalette}>
      <div className="min-h-screen">
        <Sidebar
          collapsed={sidebar.collapsed}
          onToggle={sidebar.toggle}
          mobileOpen={sidebar.mobileOpen}
          onMobileClose={sidebar.closeMobile}
        />
        <Topbar
          sidebarCollapsed={sidebar.collapsed}
          onMenuToggle={sidebar.toggle}
          onMobileMenuToggle={sidebar.toggleMobile}
        />

        <main
          className="pt-14 min-h-screen transition-[margin-left] duration-300 ml-0 md:ml-[var(--sidebar-width)]"
          style={{
            "--sidebar-width": sidebar.collapsed ? "64px" : "240px",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          } as React.CSSProperties}
        >
          <div className="p-3 sm:p-4 md:p-6">
            {children}
          </div>
        </main>

        <CommandPalette />
      </div>
    </CommandPaletteContext.Provider>
  );
}
