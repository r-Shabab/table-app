import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BulkAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: TData[]) => void;
  variant?: 'default' | 'destructive';
  disabled?: (rows: TData[]) => boolean;
}

interface DataTableBulkActionDockProps<TData> {
  table: Table<TData>;
  actions: BulkAction<TData>[];
}

export function DataTableBulkActionDock<TData>({
  table,
  actions,
}: DataTableBulkActionDockProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;
  const isVisible = count > 0;

  const selectedData = selectedRows.map((r) => r.original);

  const totalFilteredCount = table.getFilteredRowModel().rows.length;
  const pageRowCount = table.getRowModel().rows.length;
  // Show "select all N" only when the current page is fully selected but more rows exist
  const showSelectAll = count > 0 && count === pageRowCount && count < totalFilteredCount;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* "Select all N matching records" banner */}
      {showSelectAll && (
        <div
          className={cn(
            'pointer-events-auto rounded-lg border bg-background px-4 py-2 text-sm shadow-md ring-1 ring-black/5 transition-all duration-300 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          )}
        >
          <span className="text-muted-foreground">All {count} rows on this page are selected.</span>{' '}
          <button
            onClick={() => table.toggleAllRowsSelected(true)}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Select all {totalFilteredCount} matching records
          </button>
        </div>
      )}

      {/* Dock pill */}
      <div
        className={cn(
          'pointer-events-auto flex items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-lg shadow-black/10 ring-1 ring-black/5 transition-all duration-300 ease-out',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        )}
      >
        {/* Selection count */}
        <div className="flex items-center gap-2 border-r pr-3">
          <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1.5 text-xs font-semibold tabular-nums text-primary-foreground">
            {count}
          </span>
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {count === 1 ? 'row selected' : 'rows selected'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {actions.map((action, i) => {
            const isDisabled = action.disabled?.(selectedData) ?? false;
            const isDestructive = action.variant === 'destructive';
            return (
              <Button
                key={i}
                variant={isDestructive ? 'destructive' : 'ghost'}
                size="sm"
                disabled={isDisabled}
                onClick={() => action.onClick(selectedData)}
                className={cn(
                  'h-8 gap-1.5 px-3 text-sm',
                  !isDestructive && 'text-foreground hover:bg-muted'
                )}
              >
                {action.icon && <action.icon className="size-4 shrink-0" />}
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Divider + deselect */}
        <div className="border-l pl-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => table.resetRowSelection()}
            aria-label="Clear selection"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
