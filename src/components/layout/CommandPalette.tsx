"use client";

import { useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  CalendarCheck, CreditCard, FileText, ArrowRight
} from "lucide-react";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { mockStudents } from "@/lib/mock/students";
import { backdropVariants } from "@/lib/motion";

const NAV_COMMANDS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, description: "Command Center" },
  { label: "Students", href: "/admin/students", icon: Users, description: "Manage students" },
  { label: "Classes", href: "/admin/classes", icon: BookOpen, description: "View all classes" },
  { label: "Teachers", href: "/admin/teachers", icon: GraduationCap, description: "Teacher management" },
  { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck, description: "Track sessions" },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, description: "Invoice & payments" },
  { label: "Exams", href: "/admin/exams", icon: FileText, description: "Grades & exams" },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();

  const runCommand = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            className="absolute inset-0 bg-black/60"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            variants={backdropVariants}
            initial="hidden" animate="visible" exit="exit"
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="relative w-full max-w-[560px] z-10"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <Command className="w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
              style={{ background: "rgba(13,13,26,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
                <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Command.Input
                  placeholder="Search pages, students, actions..."
                  className="flex-1 bg-transparent border-none outline-none text-white/90 text-sm placeholder:text-white/30"
                />
                <kbd className="text-[10px] bg-white/8 border border-white/10 rounded px-1.5 py-0.5 font-mono text-white/30 flex-shrink-0">ESC</kbd>
              </div>

              <Command.List className="max-h-[380px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-white/30">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="mb-2">
                  {NAV_COMMANDS.map(cmd => (
                    <Command.Item
                      key={cmd.href}
                      value={cmd.label + " " + cmd.description}
                      onSelect={() => runCommand(() => router.push(cmd.href))}
                      className="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors my-0.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/8 flex items-center justify-center flex-shrink-0">
                        <cmd.icon className="w-3.5 h-3.5 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90">{cmd.label}</p>
                        <p className="text-xs text-white/40">{cmd.description}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Students">
                  {mockStudents.slice(0, 5).map(student => (
                    <Command.Item
                      key={student.id}
                      value={student.fullName + " " + student.year}
                      onSelect={() => runCommand(() => router.push(`/admin/students/${student.id}`))}
                      className="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors my-0.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-300">
                        {student.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90">{student.fullName}</p>
                        <p className="text-xs text-white/40">Year {student.year} · {student.school}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
