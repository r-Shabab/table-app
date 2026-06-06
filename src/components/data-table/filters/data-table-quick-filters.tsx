import { type Table } from '@tanstack/react-table';
import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

interface DataTableQuickFiltersProps<TData> {
  table: Table<TData>;
}

export function DataTableQuickFilters<TData>({ table }: DataTableQuickFiltersProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter((col) => col.columnDef.meta?.quickFilter);

  return (
    <>
      {columns.map((column) => {
        const meta = column.columnDef.meta;
        const filterValue: string[] = (column.getFilterValue() as string[]) ?? [];
        const options = getUniqueValues(table, column.id);

        const label =
          filterValue.length === 0
            ? meta?.title
            : filterValue.length === 1
              ? `${meta?.title}: ${options.find((o) => o === filterValue[0]) ?? filterValue[0]}`
              : `${meta?.title} (${filterValue.length})`;

        return (
          <Popover key={column.id}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8">
                {label}
                <ChevronDown className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="start">
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
      })}
    </>
  );
}
