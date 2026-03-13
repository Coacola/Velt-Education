import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function ExamsLoading() {
  return <TablePageSkeleton filters={2} cols={6} rows={6} />;
}
