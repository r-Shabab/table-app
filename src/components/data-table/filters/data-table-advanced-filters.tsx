import { useState } from 'react';
import { type Column, type Table } from '@tanstack/react-table';
import { Check, ChevronDown, Filter, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { getUniqueValues } from './data-table-filter-fns';

interface DataTableAdvancedFiltersProps<TData> {
  table: Table<TData>;
}

function MultiSelectFilter<TData>({ column, table: t }: { column: Column<TData>; table: Table<TData> }) {
  const [open, setOpen] = useState(false);
  const meta = column.columnDef.meta;
  const filterValue: string[] = (column.getFilterValue() as string[]) ?? [];
  const options = getUniqueValues(t, column.id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-8">
          {filterValue.length ? `${filterValue.length} selected` : `All ${meta?.title}`}
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${meta?.title}...`} />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const checked = filterValue.includes(option);
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      const next = checked
                        ? filterValue.filter((v) => v !== option)
                        : [...filterValue, option];
                      column.setFilterValue(next.length ? next : undefined);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex size-4 items-center justify-center rounded-sm border',
                        checked
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input',
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </div>
                    {option}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FilterControl<TData>({ column, table: t }: { column: Column<TData>; table: Table<TData> }) {
  const meta = column.columnDef.meta;
  const filterType = meta?.filterType ?? 'text';

  if (filterType === 'multiSelect') {
    return <MultiSelectFilter column={column} table={t} />;
  }

  if (filterType === 'number') {
    const value = column.getFilterValue() as string | undefined;
    return (
      <Input
        type="number"
        placeholder={`Filter ${meta?.title}...`}
        value={value ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="h-8"
      />
    );
  }

  if (filterType === 'date') {
    const value = column.getFilterValue() as string | undefined;
    return (
      <Input
        type="date"
        value={value ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="h-8"
      />
    );
  }

  const value = column.getFilterValue() as string | undefined;
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={`Search ${meta?.title}...`}
        value={value ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="h-8 pl-7"
      />
    </div>
  );
}

export function DataTableAdvancedFilters<TData>({ table }: DataTableAdvancedFiltersProps<TData>) {
  const filterableColumns = table
    .getAllColumns()
    .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanFilter());

  const hasActiveFilters = table.getState().columnFilters.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8">
          <Filter className="size-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 rounded bg-primary px-1 text-xs text-primary-foreground">
              {table.getState().columnFilters.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-4">
        <div className="mb-3 font-medium text-sm">Filters</div>
        <div className="space-y-3">
          {filterableColumns.map((column) => {
            const meta = column.columnDef.meta;
            if (!meta?.title) return null;
            return (
              <div key={column.id} className="space-y-1">
                <span className="text-xs text-muted-foreground">{meta.title}</span>
                <FilterControl column={column} table={table} />
              </div>
            );
          })}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full"
            onClick={() => table.resetColumnFilters()}
          >
            Clear all filters
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
