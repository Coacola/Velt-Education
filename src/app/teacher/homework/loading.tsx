import { GlassCard } from "@/components/glass/GlassCard";

export default function TeacherHomeworkLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-white/5 rounded-lg" />
      <div className="h-4 w-72 bg-white/5 rounded-lg" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <GlassCard key={i} padding="sm">
            <div className="h-12 bg-white/5 rounded" />
          </GlassCard>
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <GlassCard key={i}>
            <div className="h-20 bg-white/5 rounded" />
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
