"use client";

import { useState, useTransition } from "react";
import { Trash2, X, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { updateClass } from "@/lib/actions/classes";
import { createClassroom, deleteClassroom } from "@/lib/actions/classrooms";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";
import { GlassButton } from "@/components/glass/GlassButton";
import type { Class } from "@/lib/types/class";
import type { Teacher } from "@/lib/types/teacher";
import type { Classroom } from "@/lib/services/classrooms";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

interface EditClassModalProps {
  cls: Class;
  teachers: Teacher[];
  classrooms?: Classroom[];
  open: boolean;
  onClose: () => void;
}

export function EditClassModal({ cls, teachers, classrooms: initialClassrooms = [], open, onClose }: EditClassModalProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(cls.name);
  const [subject, setSubject] = useState<string>(cls.subject);
  const [year, setYear] = useState<string>(cls.year);
  const [teacherId, setTeacherId] = useState(cls.teacherId);
  const [capacity, setCapacity] = useState(String(cls.capacity));
  const [scheduleSlots, setScheduleSlots] = useState<Array<{ day: string; startTime: string; endTime: string; room?: string }>>(
    cls.schedule.map(s => ({ day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room }))
  );

  // Classrooms state
  const [localClassrooms, setLocalClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [newRoomName, setNewRoomName] = useState("");
  const [manageRoomsOpen, setManageRoomsOpen] = useState(false);

  const handleAddClassroom = async () => {
    const roomName = newRoomName.trim();
    if (!roomName) return;
    const result = await createClassroom(roomName);
    if ("error" in result) { toast.error(result.error); return; }
    if (result.data) {
      setLocalClassrooms(prev => {
        if (prev.some(r => r.id === result.data!.id)) return prev;
        return [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name));
      });
      toast.success(`Classroom "${roomName}" added`);
    }
    setNewRoomName("");
  };

  const handleDeleteClassroom = async (id: string) => {
    const result = await deleteClassroom(id);
    if ("error" in result) { toast.error(result.error); return; }
    const deleted = localClassrooms.find(r => r.id === id);
    setLocalClassrooms(prev => prev.filter(r => r.id !== id));
    if (deleted) {
      setScheduleSlots(prev => prev.map(s => s.room === deleted.name ? { ...s, room: undefined } : s));
    }
    toast.success("Classroom removed");
  };

  const addSlot = () => {
    setScheduleSlots(prev => [...prev, { day: "Monday", startTime: "17:00", endTime: "18:30" }]);
  };

  const removeSlot = (index: number) => {
    setScheduleSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    setScheduleSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }
    startTransition(async () => {
      const result = await updateClass(cls.id, {
        name,
        subject,
        year: year as "Α" | "Β" | "Γ",
        teacherId,
        capacity: parseInt(capacity) || 8,
        schedule: scheduleSlots as Array<{ day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"; startTime: string; endTime: string; room?: string }>,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Class updated successfully");
      onClose();
    });
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Edit Class" description="Update class details" size="md"
      footer={
        <>
          <GlassButton variant="ghost" onClick={onClose} disabled={isPending}>Cancel</GlassButton>
          <GlassButton variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </GlassButton>
        </>
      }
    >
      <div className="space-y-4">
        <GlassInput label="Class Name" value={name} onChange={e => setName(e.target.value)} />
        <GlassSelect label="Subject" value={subject} onChange={e => setSubject(e.target.value)} options={[{value:"Mathematics",label:"Mathematics"},{value:"Physics",label:"Physics"},{value:"Chemistry",label:"Chemistry"},{value:"Biology",label:"Biology"},{value:"English",label:"English"},{value:"History",label:"History"},{value:"Informatics",label:"Informatics"}]} />
        <GlassSelect label="Year" value={year} onChange={e => setYear(e.target.value)} options={[{value:"Α",label:"Α΄"},{value:"Β",label:"Β΄"},{value:"Γ",label:"Γ΄"}]} />
        <GlassSelect label="Teacher" value={teacherId} onChange={e => setTeacherId(e.target.value)} options={teachers.map(t => ({value:t.id,label:t.fullName}))} />
        <GlassInput label="Capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white/60">Schedule</label>
            <button type="button" onClick={addSlot} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">+ Add time slot</button>
          </div>
          <div className="space-y-2">
            {scheduleSlots.map((slot, i) => (
              <div key={i} className="flex flex-col gap-2 p-2.5 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <select value={slot.day} onChange={e => updateSlot(i, "day", e.target.value)} className="bg-transparent text-xs text-white/80 border border-white/10 rounded-lg px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500">
                    {DAYS.map(d => <option key={d} value={d} className="bg-gray-900">{d.slice(0, 3)}</option>)}
                  </select>
                  <input type="time" value={slot.startTime} onChange={e => updateSlot(i, "startTime", e.target.value)} className="bg-transparent text-xs text-white/80 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500" />
                  <span className="text-white/30 text-xs">–</span>
                  <input type="time" value={slot.endTime} onChange={e => updateSlot(i, "endTime", e.target.value)} className="bg-transparent text-xs text-white/80 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500" />
                  <button type="button" onClick={() => removeSlot(i)} className="text-red-400/60 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                  <select
                    value={slot.room || ""}
                    onChange={e => updateSlot(i, "room", e.target.value)}
                    className="bg-transparent text-xs text-white/70 border border-white/10 rounded-lg px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500"
                  >
                    <option value="" className="bg-gray-900">No room</option>
                    {localClassrooms.map(r => (
                      <option key={r.id} value={r.name} className="bg-gray-900">{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {scheduleSlots.length === 0 && (
              <p className="text-xs text-white/30 italic">No schedule slots. Add one above.</p>
            )}
          </div>
        </div>

        {/* Classrooms Management */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white/60 flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5" /> Classrooms
            </label>
            <button type="button" onClick={() => setManageRoomsOpen(!manageRoomsOpen)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              {manageRoomsOpen ? "Done" : "Manage"}
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddClassroom(); } }}
              placeholder="Add new classroom..."
              className="flex-1 bg-white/5 text-xs text-white/80 border border-white/10 rounded-lg px-3 py-1.5 placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
            />
            <button
              type="button"
              onClick={handleAddClassroom}
              disabled={!newRoomName.trim()}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          {manageRoomsOpen && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {localClassrooms.length === 0 && (
                <p className="text-xs text-white/25 italic py-1">No classrooms saved yet.</p>
              )}
              {localClassrooms.map(room => (
                <div key={room.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 group">
                  <span className="text-xs text-white/60">{room.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClassroom(room.id)}
                    className="text-red-400/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassModal>
  );
}
