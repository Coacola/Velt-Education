import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function Loading() {
  return <TablePageSkeleton kpis={0} filters={0} cols={3} rows={5} />;
}
