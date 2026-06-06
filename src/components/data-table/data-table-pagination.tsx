import { type Table } from '@tanstack/react-table';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '../ui/select';
import { Button } from '../ui/button';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;

  const totalItems = table.getFilteredRowModel().rows.length;

  const fromItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const toItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  // Page navigation
  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const maxVisiblePages = 5;

  const getVisiblePages = () => {
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(0, currentPage - half);
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(0, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col gap-4 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Left */}
      <div className="min-h-5 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} selected
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Rows per page</span>

          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-18">
              <SelectValue />
            </SelectTrigger>

            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="text-sm font-medium whitespace-nowrap">
          Showing {fromItem}–{toItem} of {totalItems}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>

          {visiblePages[0] > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 min-w-8 px-2"
                onClick={() => table.setPageIndex(0)}
              >
                1
              </Button>

              {visiblePages[0] > 1 && <span className="px-1 text-muted-foreground">...</span>}
            </>
          )}

          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="icon"
              className="h-8 min-w-8 px-2"
              onClick={() => table.setPageIndex(page)}
            >
              {page + 1}
            </Button>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
                <span className="px-1 text-muted-foreground">...</span>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 min-w-8 px-2"
                onClick={() => table.setPageIndex(totalPages - 1)}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
