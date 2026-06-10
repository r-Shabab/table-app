import { useState, useEffect, useRef, type CSSProperties } from 'react';
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type PaginationState,
  type RowAction,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useLocation } from 'react-router-dom';
import { parseAsJson, useQueryState } from 'nuqs';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

import {
  textFilter,
  numberFilter,
  dateFilter,
  enumFilter,
  booleanFilterFn,
} from './advanced-filter/filterFns';
import { DataTablePagination } from './data-table-pagination';
import { DataTableHeader } from './data-table-header';
import { DataTableBulkActionDock, type BulkAction } from './data-table-bulk-action-dock';
import { DataTableFilterChips } from './quick-filters/data-table-filter-chips';

// ── Types ────────────────────────────────────────────────────────────────────

type UrlState = {
  sort?: SortingState;
  cf?: ColumnFiltersState;
  q?: string;
  page?: number;
  size?: number;
};

type StoredState = {
  columnVisibility?: VisibilityState;
  pageSize?: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function readStoredState(id: string): StoredState | null {
  try {
    const raw = localStorage.getItem(`dt_${id}`);
    return raw ? (JSON.parse(raw) as StoredState) : null;
  } catch {
    return null;
  }
}

function getPinStyles<TData>(column: Column<TData, unknown>): CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  return {
    position: 'sticky',
    left: pinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    zIndex: 1,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  bulkActions?: BulkAction<TData>[];
  rowActions?: RowAction<TData>[];
  showFilterChips?: boolean;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
  syncToUrl?: boolean;
  tableId?: string;
}

const LOADING_ROW_COUNT = 10;

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<TData, TValue>({
  columns,
  data,
  bulkActions = [],
  rowActions,
  showFilterChips = false,
  isLoading = false,
  emptyState,
  stickyHeader = true,
  syncToUrl = true,
  tableId,
}: DataTableProps<TData, TValue>) {
  const { pathname } = useLocation();

  // Stable ID — computed once at mount and never changes for this instance.
  const resolvedIdRef = useRef(
    (tableId ?? pathname.replace(/^\//, '').replace(/\//g, '-')) || 'table'
  );
  const resolvedId = resolvedIdRef.current;

  // ── nuqs URL state ──
  const [urlState, setUrlState] = useQueryState(
    resolvedId,
    parseAsJson<UrlState>((v) =>
      v !== null && typeof v === 'object' ? (v as UrlState) : null
    ).withDefault({})
  );

  // ── localStorage restore (once at mount) ──
  const storedStateRef = useRef(readStoredState(resolvedId));
  const storedState = storedStateRef.current;

  // ── Table state ──
  const [sorting, setSorting] = useState<SortingState>(syncToUrl ? (urlState?.sort ?? []) : []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    syncToUrl ? (urlState?.cf ?? []) : []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    storedState?.columnVisibility ?? {}
  );
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<string>(syncToUrl ? (urlState?.q ?? '') : '');
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: syncToUrl ? (urlState?.page ?? 0) : 0,
    pageSize: storedState?.pageSize ?? (syncToUrl ? (urlState?.size ?? 10) : 10),
  });

  // ── Table instance ──
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    filterFns: { textFilter, numberFilter, dateFilter, enumFilter, booleanFilterFn },
    columns,
    meta: { rowActions },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      columnPinning,
      pagination,
    },
  });

  // ── Always persist preferences to localStorage ──
  useEffect(() => {
    localStorage.setItem(
      `dt_${resolvedId}`,
      JSON.stringify({ columnVisibility, pageSize: pagination.pageSize } satisfies StoredState)
    );
  }, [resolvedId, columnVisibility, pagination.pageSize]);

  // ── Sync to URL via nuqs (debounced) ──
  const stateSnapshot = JSON.stringify({
    sort: sorting,
    cf: columnFilters,
    q: globalFilter,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });
  const debouncedSnapshot = useDebounce(stateSnapshot, 400);

  useEffect(() => {
    if (!syncToUrl) return;
    const state = JSON.parse(debouncedSnapshot) as UrlState;
    const isDefault =
      !state.sort?.length && !state.cf?.length && !state.q && state.page === 0 && state.size === 10;
    void setUrlState(isDefault ? null : state);
  }, [debouncedSnapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasPinning = columnPinning.left!.length > 0 || columnPinning.right!.length > 0;

  return (
    <div className="relative flex w-full flex-col rounded-xl border border-t-4 border-t-primary bg-card text-card-foreground shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b p-4 sm:px-5 sm:py-4">
        <DataTableHeader table={table} />
        {showFilterChips && <DataTableFilterChips table={table} />}
      </div>

      {/*
       * Table Section
       *
       * When stickyHeader is true we switch from overflow-x-auto (which would
       * create an implicit overflow-y scroll container and break `position:sticky`
       * on the thead) to overflow-auto with a capped height. This lets the thead
       * stick at top-0 relative to this container while both axes remain scrollable.
       */}
      <div className={cn('relative w-full')}>
        <Table
          containerClassName={cn(stickyHeader ? 'overflow-auto max-h-[70vh]' : 'overflow-x-auto')}
        >
          <TableHeader
            className={cn(
              'bg-secondary/50 border-b',
              stickyHeader && 'sticky top-0 z-10 bg-secondary'
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const pinned = hasPinning ? header.column.getIsPinned() : false;
                  return (
                    <TableHead
                      key={header.id}
                      style={hasPinning ? getPinStyles(header.column) : undefined}
                      className={cn(
                        'h-11 text-xs font-semibold uppercase tracking-wider text-secondary-foreground whitespace-nowrap',
                        pinned && 'bg-secondary/50',
                        pinned === 'left' && 'border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]',
                        pinned === 'right' && 'border-l shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: LOADING_ROW_COUNT }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-3">
                      <Skeleton className="h-5 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b border-border/50 transition-colors hover:bg-primary/5 data-[state=selected]:bg-primary/10 data-[state=selected]:border-primary/20"
                >
                  {row.getVisibleCells().map((cell) => {
                    const pinned = hasPinning ? cell.column.getIsPinned() : false;
                    return (
                      <TableCell
                        key={cell.id}
                        style={hasPinning ? getPinStyles(cell.column) : undefined}
                        className={cn(
                          'py-3',
                          pinned && 'bg-card',
                          pinned === 'left' && 'border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]',
                          pinned === 'right' && 'border-l shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {emptyState ?? 'No results found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Section */}
      <div className="rounded-b-xl border-t bg-muted/20 p-4 sm:p-5">
        <DataTablePagination table={table} />
      </div>

      {bulkActions.length > 0 && <DataTableBulkActionDock table={table} actions={bulkActions} />}
    </div>
  );
}
