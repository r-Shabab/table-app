import { useState } from 'react';
import { type Table, type SortingState } from '@tanstack/react-table';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowUpDown, Plus, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import { SortRow, type SortableColumn } from './SortRow';

const MAX_SORTS = 3;

type SortEntry = { columnId: string; desc: boolean };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SortPopover<TData = any>({ table }: { table: Table<TData> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SortEntry[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortableColumns: SortableColumn[] = table
    .getAllColumns()
    .filter(
      (col) =>
        col.getCanSort() && col.columnDef.meta?.sortable !== false && col.columnDef.meta?.title
    )
    .map((col) => ({
      id: col.id,
      label: col.columnDef.meta!.title,
      filterType: col.columnDef.meta?.filterType,
    }));

  const activeSortCount = table.getState().sorting.length;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Initialize draft from current table sort state
      setDraft(table.getState().sorting.map((s) => ({ columnId: s.id, desc: s.desc })));
    }
    setOpen(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraft((prev) => {
        const oldIndex = prev.findIndex((e) => e.columnId === active.id);
        const newIndex = prev.findIndex((e) => e.columnId === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleAddSort = () => {
    const usedIds = draft.map((e) => e.columnId);
    const next = sortableColumns.find((c) => !usedIds.includes(c.id));
    if (!next) return;
    setDraft((prev) => [...prev, { columnId: next.id, desc: false }]);
  };

  const handleColumnChange = (index: number, columnId: string) => {
    setDraft((prev) => prev.map((entry, i) => (i === index ? { ...entry, columnId } : entry)));
  };

  const handleDirectionChange = (index: number, desc: boolean) => {
    setDraft((prev) => prev.map((entry, i) => (i === index ? { ...entry, desc } : entry)));
  };

  const handleRemove = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    const newSorting: SortingState = draft.map((e) => ({ id: e.columnId, desc: e.desc }));
    table.setSorting(newSorting);
    setOpen(false);
  };

  const handleReset = () => {
    table.setSorting([]);
    setOpen(false);
  };

  const usedColumnIds = draft.map((e) => e.columnId);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2" aria-label="Sort">
          <ArrowUpDown className="size-4" />
          Sort
          {activeSortCount > 0 && <Separator orientation="vertical" className="mx-0.5 h-full" />}
          {activeSortCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[1.25rem] rounded-full px-1.5 bg-primary text-primary-foreground text-xs"
            >
              {activeSortCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[460px] p-0" align="end">
        <div className="flex flex-col">
          {/* Body */}
          <div className="p-3">
            {draft.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No sort applied. Add a column to sort by.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={draft.map((e) => e.columnId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {draft.map((entry, index) => (
                      <SortRow
                        key={entry.columnId}
                        id={entry.columnId}
                        index={index}
                        columnId={entry.columnId}
                        desc={entry.desc}
                        sortableColumns={sortableColumns}
                        usedColumnIds={usedColumnIds}
                        onColumnChange={(colId) => handleColumnChange(index, colId)}
                        onDirectionChange={(desc) => handleDirectionChange(index, desc)}
                        onRemove={() => handleRemove(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-sm"
              onClick={handleAddSort}
              disabled={draft.length >= MAX_SORTS || sortableColumns.length === 0}
            >
              <Plus className="size-3.5" />
              Add sort
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button size="sm" className="h-8" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
