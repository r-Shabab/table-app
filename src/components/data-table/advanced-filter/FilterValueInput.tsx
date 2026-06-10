import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

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

import { type FilterOperator, type FilterRule, NO_VALUE_OPS, BETWEEN_OPS } from '../types/types';

interface FilterValueInputProps {
  filterType: string;
  operator: FilterOperator;
  value: FilterRule['value'];
  onChange: (value: FilterRule['value']) => void;
  enumOptions?: { label: string; value: string }[];
}

export function FilterValueInput({
  filterType,
  operator,
  value,
  onChange,
  enumOptions,
}: FilterValueInputProps) {
  // No input needed for these operators
  if (NO_VALUE_OPS.has(operator)) return null;

  const isBetween = BETWEEN_OPS.has(operator);

  if (filterType === 'text') {
    return (
      <Input
        className="h-8 min-w-[160px] text-sm focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
        placeholder="Value…"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || null)}
      />
    );
  }

  if (filterType === 'number') {
    if (isBetween) {
      const [min, max] = (value as [number, number] | null) ?? [undefined, undefined];
      return (
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            className="h-8 w-20 text-sm focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
            placeholder="Min"
            value={min ?? ''}
            onChange={(e) => onChange([Number(e.target.value), max ?? 0])}
          />
          <span className="shrink-0 text-xs text-muted-foreground">and</span>
          <Input
            type="number"
            className="h-8 w-20 text-sm focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
            placeholder="Max"
            value={max ?? ''}
            onChange={(e) => onChange([min ?? 0, Number(e.target.value)])}
          />
        </div>
      );
    }
    return (
      <Input
        type="number"
        className="h-8 w-28 text-sm focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
        placeholder="Value…"
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
      />
    );
  }

  if (filterType === 'date') {
    if (isBetween) {
      const [from, to] = (value as [string, string] | null) ?? ['', ''];
      return (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            className="h-8 w-[145px] text-sm focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
            value={from ?? ''}
            onChange={(e) => onChange([e.target.value, to ?? ''])}
          />
          <span className="shrink-0 text-xs text-muted-foreground">and</span>
          <Input
            type="date"
            className="h-8 w-[145px] text-sm focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
            value={to ?? ''}
            onChange={(e) => onChange([from ?? '', e.target.value])}
          />
        </div>
      );
    }
    return (
      <Input
        type="date"
        className="h-8 w-[155px] text-sm focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || null)}
      />
    );
  }

  if (filterType === 'multiSelect' && enumOptions) {
    return <EnumMultiSelect value={value} onChange={onChange} enumOptions={enumOptions} />;
  }

  return null;
}

function EnumMultiSelect({
  value,
  onChange,
  enumOptions,
}: {
  value: FilterRule['value'];
  onChange: (v: FilterRule['value']) => void;
  enumOptions: { label: string; value: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = (value as string[] | null) ?? [];

  const toggle = (optValue: string) => {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(next.length ? next : null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="h-8 min-w-[140px] justify-between px-3 font-normal"
        >
          <span className="truncate text-sm">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Select values…</span>
            ) : selected.length <= 2 ? (
              selected.join(', ')
            ) : (
              `${selected.length} selected`
            )}
          </span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {enumOptions.map((opt) => (
                <CommandItem key={opt.value} onSelect={() => toggle(opt.value)}>
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      selected.includes(opt.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
