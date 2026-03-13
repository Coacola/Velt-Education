import { GridPageSkeleton } from "@/components/shared/PageSkeleton";

export default function Loading() {
  return <GridPageSkeleton cards={4} filters={1} />;
}
