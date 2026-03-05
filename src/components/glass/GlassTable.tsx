"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { listItemVariants, listContainerVariants } from "@/lib/motion";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { GlassButton } from "./GlassButton";

interface GlassTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  globalFilter?: string;
  pagination?: boolean;
  pageSize?: number;
}

export function GlassTable<TData>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyTitle = "No data found",
  emptyDescription = "Nothing to display here.",
  globalFilter = "",
  pagination = false,
  pageSize = 20,
}: GlassTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    initialState: { pagination: { pageSize } },
  });

  if (isLoading) return <SkeletonTable rows={5} />;

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-white/8 shadow-glass">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-canvas-900/80" style={{ backdropFilter: "blur(8px)" }}>
              {table.getHeaderGroups().map(hg =>
                hg.headers.map(header => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide whitespace-nowrap",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-white/70 transition-colors"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-white/25">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <motion.tbody
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {table.getRowModel().rows.map((row, i) => (
              <motion.tr
                key={row.id}
                variants={listItemVariants}
                className={cn(
                  "border-b border-white/5 transition-colors duration-150",
                  "hover:bg-white/3",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-white/80">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-white/40">
            {table.getFilteredRowModel().rows.length} total rows
          </p>
          <div className="flex items-center gap-2">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </GlassButton>
            <span className="text-xs text-white/50">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
}