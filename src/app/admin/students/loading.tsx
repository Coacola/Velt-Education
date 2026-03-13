import { TablePageSkeleton } from "@/components/shared/PageSkeleton";

export default function StudentsLoading() {
  return <TablePageSkeleton filters={3} cols={7} rows={10} />;
}
