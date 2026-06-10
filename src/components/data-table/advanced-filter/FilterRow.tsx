import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, ChevronsUpDown, GripVertical, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import { type FilterRule, type FilterableColumn, OPERATOR_OPTIONS } from '../types/types';
import { FilterValueInput } from './FilterValueInput';

interface FilterRowProps {
  rule: FilterRule;
  index: number;
  filterableColumns: FilterableColumn[];
  onUpdate: (id: string, updates: Partial<FilterRule>) => void;
  onRemove: (id: string) => void;
}

export function FilterRow({ rule, index, filterableColumns, onUpdate, onRemove }: FilterRowProps) {
  const [colOpen, setColOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rule.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentColumn = filterableColumns.find((c) => c.id === rule.columnId);
  const operatorOptions = OPERATOR_OPTIONS[rule.filterType] ?? OPERATOR_OPTIONS['text'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-nowrap items-center gap-2 rounded-md border bg-background p-2 transition-opacity w-full overflow-hidden',
        isDragging && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Where / spacer */}
      <div className="flex w-[60px] shrink-0 items-center justify-end">
        {index === 0 ? (
          <span className="pr-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Where
          </span>
        ) : (
          // and text for subsequent rules
          <span className="pr-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            and
          </span>
        )}
      </div>

      {/* Column combobox */}
      <Popover open={colOpen} onOpenChange={setColOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={colOpen}
            className="h-8 w-[150px] shrink-0 justify-between px-3 font-normal"
          >
            <span className="truncate text-sm">{currentColumn?.label ?? 'Select column'}</span>
            <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search columns…" />
            <CommandList>
              <CommandEmpty>No column found.</CommandEmpty>
              <CommandGroup>
                {filterableColumns.map((col) => (
                  <CommandItem
                    key={col.id}
                    onSelect={() => {
                      onUpdate(rule.id, { columnId: col.id });
                      setColOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        col.id === rule.columnId ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {col.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Operator select */}
      <Select
        value={rule.operator}
        onValueChange={(v) => onUpdate(rule.id, { operator: v as FilterRule['operator'] })}
      >
        <SelectTrigger className="h-8 w-[160px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operatorOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value input */}
      <div className="flex-1 overflow-hidden min-w-[160px]">
        <FilterValueInput
          filterType={rule.filterType}
          operator={rule.operator}
          value={rule.value}
          onChange={(v) => onUpdate(rule.id, { value: v })}
          enumOptions={currentColumn?.enumOptions}
        />
      </div>

      {/* Delete button */}
      <Button
        variant="destructive"
        size="sm"
        className="ml-auto h-7 w-7 shrink-0 p-0"
        onClick={() => onRemove(rule.id)}
        aria-label="Remove filter"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
