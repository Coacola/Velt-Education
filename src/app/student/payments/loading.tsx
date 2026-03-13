import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function Loading() {
  return <TablePageSkeleton kpis={3} filters={1} cols={4} rows={6} />;
}
