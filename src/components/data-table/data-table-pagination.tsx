import { type Table } from '@tanstack/react-table';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '../ui/button';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = table.getFilteredRowModel().rows.length;

  const fromItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const toItem = Math.min((pageIndex + 1) * pageSize, totalItems);

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left */}
      <div className="text-sm font-medium text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <>
            <span className="text-foreground">
              {table.getFilteredSelectedRowModel().rows.length}
            </span>{' '}
            of {totalItems} selected
          </>
        ) : (
          <>Total {totalItems} items</> // Nice default state when nothing is selected
        )}
      </div>

      {/* Right */}
      <div className="flex flex-wrap items-center gap-6 sm:justify-end">
        {/* Rows per page & Info Group */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] hover:text-gray-600 focus:outline-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent position="popper" side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Showing{' '}
            <span className="text-foreground">
              {fromItem} – {toItem}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8 hover:bg-muted"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-4" />
          </Button>

          {visiblePages[0] > 0 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-sm hover:bg-muted"
                onClick={() => table.setPageIndex(0)}
              >
                1
              </Button>
              {visiblePages[0] > 1 && (
                <span className="px-1.5 text-xs text-muted-foreground">...</span>
              )}
            </>
          )}

          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'ghost'}
              size="icon"
              className={`size-8 text-sm ${page !== currentPage && 'hover:bg-muted'}`}
              onClick={() => table.setPageIndex(page)}
            >
              {page + 1}
            </Button>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
                <span className="px-1.5 text-xs text-muted-foreground">...</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-sm hover:bg-muted"
                onClick={() => table.setPageIndex(totalPages - 1)}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-8 hover:bg-muted"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
