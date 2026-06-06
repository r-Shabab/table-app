import { useEffect, useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { ChevronDown, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { DataTableViewOptions } from './data-table-column-toggler';
import { DataTableQuickFilters } from './filters/data-table-quick-filters';
import { DataTableAdvancedFilters } from './filters/data-table-advanced-filters';

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
}

export function DataTableHeader<TData>({ table }: DataTableHeaderProps<TData>) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
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

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-48 rounded-r-none pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-l-none border-l-0 h-8">
                {selectedColumn
                  ? filterableColumns.find((c) => c.id === selectedColumn)?.columnDef.meta?.title
                  : 'All columns'}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={selectedColumn ?? '__all__'}
                onValueChange={(value) => {
                  setSelectedColumn(value === '__all__' ? null : value);
                  setSearchValue('');
                  table.setGlobalFilter(undefined);
                  table.getAllColumns().forEach((col) => col.setFilterValue(undefined));
                }}
              >
                <DropdownMenuRadioItem value="__all__">All columns</DropdownMenuRadioItem>
                {filterableColumns.map((col) => (
                  <DropdownMenuRadioItem key={col.id} value={col.id}>
                    {col.columnDef.meta?.title}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DataTableQuickFilters table={table} />
        <DataTableAdvancedFilters table={table} />
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
