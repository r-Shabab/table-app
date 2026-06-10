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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SortableColumn {
  id: string;
  label: string;
  filterType?: string;
}

interface SortRowProps {
  id: string;
  index: number;
  columnId: string;
  desc: boolean;
  sortableColumns: SortableColumn[];
  usedColumnIds: string[];
  onColumnChange: (columnId: string) => void;
  onDirectionChange: (desc: boolean) => void;
  onRemove: () => void;
}

function getDirectionOptions(filterType?: string) {
  switch (filterType) {
    case 'number':
      return [
        { label: '1 → 9', value: 'asc' },
        { label: '9 → 1', value: 'desc' },
      ];
    case 'date':
      return [
        { label: 'Oldest first', value: 'asc' },
        { label: 'Newest first', value: 'desc' },
      ];
    case 'boolean':
    case 'multiSelect':
      return [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' },
      ];
    default:
      return [
        { label: 'A → Z', value: 'asc' },
        { label: 'Z → A', value: 'desc' },
      ];
  }
}

export function SortRow({
  id,
  index,
  columnId,
  desc,
  sortableColumns,
  usedColumnIds,
  onColumnChange,
  onDirectionChange,
  onRemove,
}: SortRowProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentColumn = sortableColumns.find((c) => c.id === columnId);
  const availableColumns = sortableColumns.filter(
    (c) => c.id === columnId || !usedColumnIds.includes(c.id)
  );
  const directionOptions = getDirectionOptions(currentColumn?.filterType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-background p-2 transition-opacity',
        isDragging && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Priority badge */}
      <Badge
        variant="secondary"
        className="h-5 min-w-[1.25rem] rounded-full px-1.5 text-xs font-semibold tabular-nums"
      >
        {index + 1}
      </Badge>

      {/* Column combobox */}
      <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={comboboxOpen}
            className="h-8 w-[150px] justify-between px-3 font-normal"
          >
            <span className="truncate text-sm">{currentColumn?.label ?? 'Select column'}</span>
            <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search columns..." />
            <CommandList>
              <CommandEmpty>No column found.</CommandEmpty>
              <CommandGroup>
                {availableColumns.map((col) => (
                  <CommandItem
                    key={col.id}
                    onSelect={() => {
                      onColumnChange(col.id);
                      setComboboxOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        col.id === columnId ? 'opacity-100' : 'opacity-0'
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

      {/* Direction select */}
      <Select value={desc ? 'desc' : 'asc'} onValueChange={(v) => onDirectionChange(v === 'desc')}>
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {directionOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Delete button */}
      <Button
        variant="destructive"
        size="sm"
        className="ml-auto h-7 w-7 shrink-0 p-0 "
        onClick={onRemove}
        aria-label="Remove sort"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
