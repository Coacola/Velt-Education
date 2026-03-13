"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Phone, LayoutGrid, List } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassTable } from "@/components/glass/GlassTable";
import { cn, formatPercent, getAttendanceColor } from "@/lib/utils";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import type { Student } from "@/lib/types/student";
import type { Class } from "@/lib/types/class";

type StudentRow = Student & { classNames: string[] };

const col = createColumnHelper<StudentRow>();

interface TeacherStudentsClientProps {
  students: Student[];
  classes: Class[];
}

export function TeacherStudentsClient({ students, classes }: TeacherStudentsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Build student → classes map
  const studentClassMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cls of classes) {
      for (const sid of cls.studentIds) {
        if (!map.has(sid)) map.set(sid, []);
        map.get(sid)!.push(cls.name);
      }
    }
    return map;
  }, [classes]);

  // Enrich students with class names for the table
  const enriched: StudentRow[] = useMemo(
    () => students.map(s => ({ ...s, classNames: studentClassMap.get(s.id) || [] })),
    [students, studentClassMap]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return enriched;
    const q = search.toLowerCase();
    return enriched.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const columns = useMemo(() => [
    col.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: "name",
      header: "Student",
      cell: info => (
        <div>
          <p className="font-medium text-white/90">{info.getValue()}</p>
          <p className="text-xs text-white/35">{info.row.original.school}</p>
        </div>
      ),
      size: 200,
    }),
    col.accessor("year", {
      header: "Year",
      cell: info => <GlassBadge variant="brand" size="sm">{info.getValue()}΄</GlassBadge>,
      size: 70,
    }),
    col.accessor("classNames", {
      header: "Classes",
      cell: info => {
        const names = info.getValue();
        if (!names.length) return <span className="text-white/25">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {names.map(n => (
              <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/45">{n}</span>
            ))}
          </div>
        );
      },
      size: 220,
    }),
    col.accessor("attendanceRate", {
      header: "Attendance",
      cell: info => {
        const rate = info.getValue();
        return (
          <span className={cn("text-xs font-medium", getAttendanceColor(rate))}>
            {formatPercent(rate)}
          </span>
        );
      },
      size: 100,
    }),
    col.accessor("phone", {
      header: "Phone",
      cell: info => {
        const phone = info.getValue();
        if (!phone) return <span className="text-white/25">—</span>;
        return (
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Phone className="w-3 h-3" />
            {phone}
          </div>
        );
      },
      size: 140,
    }),
  ], []);

  const viewToggle = (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          viewMode === "grid" ? "bg-white/10 text-white/80" : "text-white/30 hover:text-white/50"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          viewMode === "list" ? "bg-white/10 text-white/80" : "text-white/30 hover:text-white/50"
        )}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AnimatedPage>
      <PageHeader
        title="My Students"
        description={`${filtered.length} student${filtered.length !== 1 ? "s" : ""} in your classes`}
        actions={viewToggle}
      />

      <div className="mb-5 w-full sm:w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
          />
        </div>
      </div>

      {viewMode === "list" ? (
        <GlassTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => router.push(`/teacher/students/${row.id}`)}
          emptyTitle="No students found"
          emptyDescription="No students match your search."
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map(student => (
            <motion.div key={student.id} variants={listItemVariants}>
              <Link href={`/teacher/students/${student.id}`}>
                <GlassCard hover padding="sm" className="cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white/90">{student.firstName} {student.lastName}</h4>
                      <p className="text-[10px] text-white/35">{student.school}</p>
                    </div>
                    <GlassBadge variant="brand" size="sm">{student.year}΄</GlassBadge>
                  </div>

                  {/* Classes for this student */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {student.classNames.map(name => (
                      <span key={name} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{name}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className={cn("font-medium", getAttendanceColor(student.attendanceRate))}>
                      {formatPercent(student.attendanceRate)} att.
                    </span>
                    {student.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {student.phone}
                      </span>
                    )}
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-white/30">No students found.</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
