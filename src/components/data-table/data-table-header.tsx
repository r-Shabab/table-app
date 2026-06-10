import { useEffect, useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

import { DataTableViewOptions } from './data-table-column-toggler';
import { DataTableQuickFilters } from './quick-filters/data-table-quick-filters';
import { FilterPanel } from './advanced-filter/FilterPanel';
import { SortPopover } from './advanced-sort/SortPopover';

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
}

export function DataTableHeader<TData>({ table }: DataTableHeaderProps<TData>) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);

  const filterableColumns = table
    .getAllColumns()
    .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanFilter());

  useEffect(() => {
    if (selectedColumn) {
      table.setGlobalFilter(undefined);
      table.getColumn(selectedColumn)?.setFilterValue(debouncedSearch || undefined);
    } else {
      table.setGlobalFilter(debouncedSearch || undefined);
    }
  }, [debouncedSearch, selectedColumn, table]);

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter ||
    searchValue.length > 0;

  const handleReset = () => {
    table.resetColumnFilters();
    table.setGlobalFilter(undefined);
    setSearchValue('');
    setSelectedColumn(null);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-1">
      <div className="flex flex-1 items-center gap-2">
        {/* Search Input & Column Combobox */}
        <div className="flex items-center">
          <div className="relative h-8">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-8 w-48 rounded-r-none pl-8 focus-visible:z-10"
            />
          </div>

          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="h-8 w-[140px] justify-between rounded-l-none border-l-0 px-3 font-normal"
              >
                <span className="truncate">
                  {selectedColumn
                    ? filterableColumns.find((c) => c.id === selectedColumn)?.columnDef.meta?.title
                    : 'All columns'}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search columns..." />
                <CommandList>
                  <CommandEmpty>No column found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedColumn(null);
                        setSearchValue('');
                        table.getAllColumns().forEach((col) => col.setFilterValue(undefined));
                        setComboboxOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selectedColumn === null ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      All columns
                    </CommandItem>
                    {filterableColumns.map((col) => (
                      <CommandItem
                        key={col.id}
                        onSelect={() => {
                          setSelectedColumn(col.id);
                          setSearchValue('');
                          table.setGlobalFilter(undefined);
                          table.getAllColumns().forEach((c) => c.setFilterValue(undefined));
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            selectedColumn === col.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {col.columnDef.meta?.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="hidden h-4 w-px bg-border md:block" />

        {/* Quick Filter Buttons */}
        <DataTableQuickFilters table={table} />
      </div>

      <div className="flex items-center gap-2">
        {/* Reset quick filters / search */}
        {isFiltered && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}

        <SortPopover table={table} />

        <FilterPanel table={table} />

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
