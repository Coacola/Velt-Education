import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function PaymentsLoading() {
  return <TablePageSkeleton kpis={4} filters={2} cols={6} rows={8} />;
}
