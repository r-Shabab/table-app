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
    <div className="flex flex-wrap items-center gap-2 pb-4">
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>

      {globalFilter && (
        <Chip
          label="Search"
          value={`"${globalFilter}"`}
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
        if (typeof filterValue === 'boolean') {
          display = filterValue ? 'Yes' : 'No';
        } else if (Array.isArray(filterValue)) {
          display =
            filterValue.length > 2 ? `${filterValue.length} selected` : filterValue.join(', ');
        } else {
          display = String(filterValue);
        }

        return (
          <Chip
            key={cf.id}
            label={(meta?.title as string) ?? cf.id}
            value={display}
            onRemove={() => column.setFilterValue(undefined)}
          />
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => {
          table.setGlobalFilter(undefined);
          table.resetColumnFilters();
        }}
      >
        Clear filters
      </Button>
    </div>
  );
}

interface ChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

function Chip({ label, value, onRemove }: ChipProps) {
  return (
    <div className="group flex h-7 items-center gap-1.5 rounded-md border bg-secondary px-2 text-xs transition-colors hover:bg-secondary/80">
      <span className="font-medium text-muted-foreground">{label}</span>

      <div className="h-3.5 w-px bg-border" />

      <span className="max-w-[150px] truncate font-medium text-secondary-foreground">{value}</span>

      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 flex size-4 items-center justify-center rounded-sm opacity-50 ring-offset-background transition-all hover:bg-background hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
