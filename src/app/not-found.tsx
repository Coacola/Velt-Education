import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white/20 mb-4">404</h1>
        <p className="text-white/50 mb-6">Page not found</p>
        <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/20 text-brand-300 text-sm font-medium hover:bg-brand-500/30 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
