import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function Loading() {
  return <TablePageSkeleton kpis={2} filters={1} cols={5} rows={6} />;
}
