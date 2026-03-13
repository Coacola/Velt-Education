import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { SessionDetailClient } from "@/components/attendance/SessionDetailClient";
import { getSessionById } from "@/lib/services/attendance";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const attSession = await getSessionById(session.user.tenantId, params.id);
  if (!attSession) notFound();

  return <SessionDetailClient session={attSession} />;
}
