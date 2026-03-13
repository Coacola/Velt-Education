import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function AttendanceLoading() {
  return <TablePageSkeleton filters={2} cols={5} rows={8} />;
}
