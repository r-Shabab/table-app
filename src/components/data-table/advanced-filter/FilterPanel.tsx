import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
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
import { Filter, Plus, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import {
  type FilterRule,
  type FilterableColumn,
  type ColumnFilterValue,
  NO_VALUE_OPS,
  BETWEEN_OPS,
  getDefaultOperator,
  getDefaultValue,
} from '../types/types';
import { FilterRow } from './FilterRow';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FilterPanel<TData = any>({ table }: { table: Table<TData> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterRule[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Columns eligible for the advanced filter panel
  const filterableColumns: FilterableColumn[] = table
    .getAllColumns()
    .filter(
      (col) =>
        col.columnDef.meta?.filterable !== false &&
        col.columnDef.meta?.title &&
        col.columnDef.meta?.filterType
    )
    .map((col) => ({
      id: col.id,
      label: col.columnDef.meta!.title,
      filterType: col.columnDef.meta!.filterType!,
      enumOptions:
        col.columnDef.meta?.enumOptions ??
        (col.columnDef.meta?.filterType === 'multiSelect'
          ? Array.from(col.getFacetedUniqueValues().keys())
              .sort()
              .map((v) => ({ label: String(v), value: String(v) }))
          : undefined),
    }));

  const filterableIds = new Set(filterableColumns.map((c) => c.id));

  // Badge only counts filters managed by this panel (not quick filters)
  const activeRuleCount = table
    .getState()
    .columnFilters.filter((cf) => filterableIds.has(cf.id)).length;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Initialise draft from the current columnFilters for panel-managed columns
      const rules: FilterRule[] = table
        .getState()
        .columnFilters.filter((cf) => filterableIds.has(cf.id))
        .map((cf) => {
          const cv = cf.value as ColumnFilterValue | undefined;
          const col = filterableColumns.find((c) => c.id === cf.id);
          const filterType = col?.filterType ?? 'text';
          return {
            id: `${cf.id}-${Math.random().toString(36).substring(2, 11)}`,
            columnId: cf.id,
            filterType,
            operator: cv?.operator ?? getDefaultOperator(filterType),
            value: cv?.value ?? null,
          };
        });
      setDraft(rules);
    }
    setOpen(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDraft((prev) => {
        const oldIndex = prev.findIndex((r) => r.id === active.id);
        const newIndex = prev.findIndex((r) => r.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleAddFilter = () => {
    const first = filterableColumns[0];
    if (!first) return;
    const operator = getDefaultOperator(first.filterType);
    setDraft((prev) => [
      ...prev,
      {
        id: `${first.id}-${Math.random().toString(36).substring(2, 11)}`,
        columnId: first.id,
        filterType: first.filterType,
        operator,
        value: getDefaultValue(first.filterType, operator),
      },
    ]);
  };

  const handleRuleUpdate = (ruleId: string, updates: Partial<FilterRule>) => {
    setDraft((prev) =>
      prev.map((rule) => {
        if (rule.id !== ruleId) return rule;

        // Column change — reset operator + value to match the new type
        if (updates.columnId !== undefined && updates.columnId !== rule.columnId) {
          const newCol = filterableColumns.find((c) => c.id === updates.columnId);
          const newType = newCol?.filterType ?? 'text';
          const newOp = getDefaultOperator(newType);
          return {
            ...rule,
            columnId: updates.columnId,
            filterType: newType,
            operator: newOp,
            value: getDefaultValue(newType, newOp),
          };
        }

        // Operator change — reset value when crossing value/no-value or between boundary
        if (updates.operator !== undefined && updates.operator !== rule.operator) {
          const wasNoValue = NO_VALUE_OPS.has(rule.operator);
          const isNoValue = NO_VALUE_OPS.has(updates.operator);
          const wasBetween = BETWEEN_OPS.has(rule.operator);
          const isBetween = BETWEEN_OPS.has(updates.operator);
          if (wasNoValue !== isNoValue || wasBetween !== isBetween) {
            return {
              ...rule,
              ...updates,
              value: getDefaultValue(rule.filterType, updates.operator),
            };
          }
        }

        return { ...rule, ...updates };
      })
    );
  };

  const handleRemoveRule = (ruleId: string) => {
    setDraft((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleApply = () => {
    // 1. Clear existing panel-managed filters
    table
      .getState()
      .columnFilters.filter((cf) => filterableIds.has(cf.id))
      .forEach((cf) => table.getColumn(cf.id)?.setFilterValue(undefined));

    // 2. Write valid rules to columnFilters
    draft.forEach((rule) => {
      if (!rule.columnId || !filterableIds.has(rule.columnId)) return;
      const requiresValue = !NO_VALUE_OPS.has(rule.operator);
      const hasValue =
        rule.value !== null &&
        rule.value !== undefined &&
        !(typeof rule.value === 'string' && !rule.value) &&
        !(Array.isArray(rule.value) && !rule.value.length);
      if (requiresValue && !hasValue) return;

      table.getColumn(rule.columnId)?.setFilterValue({
        operator: rule.operator,
        value: rule.value,
      } satisfies ColumnFilterValue);
    });

    setOpen(false);
  };

  const handleReset = () => {
    // Only clear panel-managed columns — leaves quick filters untouched
    table
      .getState()
      .columnFilters.filter((cf) => filterableIds.has(cf.id))
      .forEach((cf) => table.getColumn(cf.id)?.setFilterValue(undefined));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2" aria-label="Filter">
          <Filter className="size-4" />
          Filter
          {activeRuleCount > 0 && <Separator orientation="vertical" className="mx-0.5 h-full" />}
          {activeRuleCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[1.25rem] rounded-full bg-primary px-1.5 text-xs text-primary-foreground"
            >
              {activeRuleCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[720px] p-0" align="end">
        <div className="flex flex-col">
          {/* Rules body */}
          <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto p-3">
            {draft.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No filters applied. Add a condition below.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={draft.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {draft.map((rule, index) => (
                    <FilterRow
                      key={rule.id}
                      rule={rule}
                      index={index}
                      filterableColumns={filterableColumns}
                      onUpdate={handleRuleUpdate}
                      onRemove={handleRemoveRule}
                    />
                  ))}
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
              onClick={handleAddFilter}
              disabled={filterableColumns.length === 0}
            >
              <Plus className="size-3.5" />
              Add filter
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
