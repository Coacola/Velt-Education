import { notFound } from "next/navigation";
import { SessionDetailClient } from "@/components/attendance/SessionDetailClient";
import { mockSessions, getSessionById } from "@/lib/mock";

export function generateStaticParams() {
  return mockSessions.map(s => ({ id: s.id }));
}

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const session = getSessionById(params.id);
  if (!session) notFound();
  return <SessionDetailClient session={session} />;
}
