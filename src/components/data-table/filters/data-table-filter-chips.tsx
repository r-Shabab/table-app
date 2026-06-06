import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DataTableFilterChipsProps<TData> {
  table: Table<TData>;
}

export function DataTableFilterChips<TData>({ table }: DataTableFilterChipsProps<TData>) {
  const globalFilter = table.getState().globalFilter as string | undefined;
  const columnFilters = table.getState().columnFilters;

  if (!globalFilter && columnFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-4">
      {globalFilter && (
        <Chip
          label={`Search: "${globalFilter}"`}
          onRemove={() => table.setGlobalFilter(undefined)}
        />
      )}
      {columnFilters.map((cf) => {
        const column = table.getColumn(cf.id);
        if (!column) return null;
        const meta = column.columnDef.meta;
        const filterValue = cf.value;
        // eslint-disable-next-line no-useless-assignment
        let display = '';

        if (Array.isArray(filterValue)) {
          display = filterValue.join(', ');
        } else {
          display = String(filterValue);
        }

        return (
          <Chip
            key={cf.id}
            label={`${meta?.title ?? cf.id}: ${display}`}
            onRemove={() => column.setFilterValue(undefined)}
          />
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={() => {
          table.setGlobalFilter(undefined);
          table.resetColumnFilters();
        }}
      >
        Clear all
      </Button>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 text-xs">
      {label}
      <button type="button" onClick={onRemove} className="ml-0.5 rounded-sm p-0.5 hover:bg-muted">
        <X className="size-3" />
      </button>
    </div>
  );
}
