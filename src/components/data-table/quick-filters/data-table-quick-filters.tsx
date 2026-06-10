import { type Table } from '@tanstack/react-table';
import { Hash, Calendar, ListFilter, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { NumberRangeContent } from '@/components/data-table/quick-filters/data-table-number-range';
import { DateRangeContent } from '@/components/data-table/quick-filters/data-table-date-range';
import { MultiSelectContent } from '@/components/data-table/quick-filters/data-table-multi-select';

// --- Main Component ---
const formatDateBadge = (dateString: string) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  }).format(new Date(dateString));
};

export function DataTableQuickFilters<TData>({ table }: { table: Table<TData> }) {
  const columns = table.getAllColumns().filter((col) => col.columnDef.meta?.quickFilter);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {columns.map((column) => {
        const meta = column.columnDef.meta;
        const filterType = meta?.filterType ?? 'multiSelect';
        const filterValue = column.getFilterValue();

        // Dynamic Width Mapping
        const popoverWidth =
          filterType === 'date'
            ? 'w-[340px]'
            : filterType === 'number'
              ? 'w-[260px]'
              : filterType === 'boolean'
                ? 'w-[180px]'
                : 'w-[220px]';

        // Dynamic Icon Resolution
        const FilterIcon =
          filterType === 'date'
            ? Calendar
            : filterType === 'number'
              ? Hash
              : filterType === 'boolean'
                ? ToggleLeft
                : ListFilter;

        // Badge Content Resolution
        // eslint-disable-next-line no-useless-assignment
        let isFiltered = false;
        let badgeContent: React.ReactNode = null;

        if (filterType === 'number') {
          const val = filterValue as [number, number];
          isFiltered = Array.isArray(val) && (val[0] !== undefined || val[1] !== undefined);
          if (isFiltered) badgeContent = `${val[0] ?? '0'} - ${val[1] ?? 'Max'}`;
        } else if (filterType === 'date') {
          const val = filterValue as [string, string];
          isFiltered = Array.isArray(val) && (!!val[0] || !!val[1]);
          if (isFiltered) {
            badgeContent = `${val[0] ? formatDateBadge(val[0]) : 'Any'} - ${val[1] ? formatDateBadge(val[1]) : 'Any'}`;
          }
        } else if (filterType === 'boolean') {
          const val = filterValue as boolean | undefined;
          isFiltered = val !== undefined;
          if (isFiltered) badgeContent = val ? 'Yes' : 'No';
        } else {
          const val = (filterValue as string[]) ?? [];
          isFiltered = val.length > 0;
          if (isFiltered) badgeContent = val.length > 2 ? `${val.length} selected` : val.join(', ');
        }

        return (
          <Popover key={column.id}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('h-8 transition-all', !isFiltered && 'border-dashed')}
              >
                {/* Dynamically assigned Icon */}
                <FilterIcon className="mr-2 size-3.5 text-muted-foreground" />
                {meta?.title}

                {isFiltered && (
                  <>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <Badge
                      variant="secondary"
                      className="rounded-sm bg-primary px-1 font-normal text-primary-foreground"
                    >
                      {badgeContent}
                    </Badge>
                  </>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className={cn(popoverWidth, 'p-0')} align="start">
              {filterType === 'number' && <NumberRangeContent column={column} close={() => {}} />}
              {filterType === 'date' && <DateRangeContent column={column} close={() => {}} />}
              {filterType === 'multiSelect' && (
                <MultiSelectContent column={column} close={() => {}} />
              )}
              {filterType === 'boolean' && (
                <div className="p-2 space-y-1">
                  {[
                    { label: 'All', value: undefined },
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ].map((opt) => {
                    const active = (filterValue as boolean | undefined) === opt.value;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => column.setFilterValue(opt.value)}
                        className={cn(
                          'w-full rounded-md px-3 py-1.5 text-left text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {filterType === 'text' && (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  Text filtering is not supported as a Quick Filter.
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
