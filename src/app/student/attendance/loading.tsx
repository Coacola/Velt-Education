import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function Loading() {
  return <TablePageSkeleton kpis={4} filters={1} cols={5} rows={8} />;
}
