"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassTable } from "@/components/glass/GlassTable";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { AttendanceSession } from "@/lib/types/attendance";
import type { Class } from "@/lib/types/class";

const col = createColumnHelper<AttendanceSession>();

interface AttendanceClientProps {
  sessions: AttendanceSession[];
  classes: Class[];
}

export function AttendanceClient({ sessions, classes }: AttendanceClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const columns = [
    col.accessor("className", { header: "Class", size: 200 }),
    col.accessor("date", { header: "Date", cell: i => formatDate(i.getValue()), size: 120 }),
    col.accessor("teacherName", { header: "Teacher", size: 180 }),
    col.display({
      id: "attendance",
      header: "Attendance",
      cell: i => {
        const r = i.row.original.records;
        const present = r.filter(x => x.status === "present" || x.status === "late").length;
        return <span className="text-white/70">{present}/{r.length}</span>;
      },
      size: 100,
    }),
    col.accessor("status", {
      header: "Status",
      cell: i => (
        <GlassBadge variant={i.getValue() === "completed" ? "green" : i.getValue() === "scheduled" ? "blue" : "red"} dot size="sm">
          {i.getValue()}
        </GlassBadge>
      ),
      size: 120,
    }),
  ];

  return (
    <AnimatedPage>
      <PageHeader
        title="Attendance"
        description={`${sessions.length} sessions`}
        actions={<GlassButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>New Session</GlassButton>}
      />
      <div className="flex items-center gap-3 mb-5">
        <div className="w-full sm:w-64">
          <GlassInput placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
        </div>
      </div>
      <GlassTable
        columns={columns}
        data={sessions}
        onRowClick={row => router.push(`/admin/attendance/${row.id}`)}
        globalFilter={debouncedSearch}
        mobileCardRenderer={(session) => {
          const r = session.records;
          const present = r.filter(x => x.status === "present" || x.status === "late").length;
          return (
            <div className="glass-panel p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/90">{session.className}</p>
                <GlassBadge variant={session.status === "completed" ? "green" : session.status === "scheduled" ? "blue" : "red"} dot size="sm">
                  {session.status}
                </GlassBadge>
              </div>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{formatDate(session.date)}</span>
                <span>{session.teacherName}</span>
                <span>{present}/{r.length} present</span>
              </div>
            </div>
          );
        }}
      />

      <GlassModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Session" size="md"
        footer={<><GlassButton variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</GlassButton><GlassButton variant="primary" onClick={() => setCreateOpen(false)}>Create</GlassButton></>}
      >
        <div className="space-y-4">
          <GlassSelect label="Class" options={classes.map(c => ({value:c.id,label:c.name}))} />
          <GlassInput label="Date" type="date" />
          <div className="grid grid-cols-2 gap-4">
            <GlassInput label="Start Time" type="time" />
            <GlassInput label="End Time" type="time" />
          </div>
          <GlassInput label="Topic" placeholder="Lesson topic (optional)" />
        </div>
      </GlassModal>
    </AnimatedPage>
  );
}
