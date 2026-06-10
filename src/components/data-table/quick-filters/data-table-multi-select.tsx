import type { Column } from '@tanstack/react-table';
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function MultiSelectContent<TData>({
  column,
  close,
}: {
  column: Column<TData, unknown>;
  close: () => void;
}) {
  const meta = column.columnDef.meta;
  const filterValue = (column.getFilterValue() as string[]) ?? [];
  const facets = column.getFacetedUniqueValues();
  const options = Array.from(facets.keys()).sort();

  return (
    <Command>
      <CommandInput placeholder={`Search ${meta?.title}...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => {
            const checked = filterValue.includes(option as string);
            const count = facets.get(option) ?? 0;

            return (
              <CommandItem
                key={String(option)}
                onSelect={() => {
                  const next = checked
                    ? filterValue.filter((v) => v !== option)
                    : [...filterValue, option as string];
                  column.setFilterValue(next.length ? next : undefined);
                }}
                className="hover:bg-muted/50"
              >
                <div
                  className={cn(
                    'mr-2 flex size-4 items-center justify-center rounded-sm border transition-colors',
                    checked
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-secondary-foreground opacity-50 [&_svg]:invisible'
                  )}
                >
                  <Check className={cn('size-3', checked && 'text-primary-foreground')} />
                </div>
                <span className="flex-1 truncate">{String(option)}</span>

                {/* Beautifully padded count badge pinned to the right */}
                <span className="ml-auto flex h-5 items-center justify-center rounded-md bg-primary px-1.5 text-[10px] font-medium tabular-nums text-primary-foreground">
                  {count}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {filterValue.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  column.setFilterValue(undefined);
                  close();
                }}
                className="justify-center text-center text-sm font-medium"
              >
                Clear filters
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}
