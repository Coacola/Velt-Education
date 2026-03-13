export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-4 w-32 bg-white/5 rounded" />
      <div className="h-32 bg-white/5 rounded-2xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-9 w-20 bg-white/5 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="h-48 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}
