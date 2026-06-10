import type { Column } from '@tanstack/react-table';
import {
  format,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// ── Presets ───────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  getDates: () => [string, string];
}

const DATE_PRESETS: Preset[] = [
  {
    label: 'Today',
    getDates: () => {
      const d = new Date();
      return [format(startOfDay(d), 'yyyy-MM-dd'), format(endOfDay(d), 'yyyy-MM-dd')];
    },
  },
  {
    label: 'Yesterday',
    getDates: () => {
      const d = subDays(new Date(), 1);
      return [format(startOfDay(d), 'yyyy-MM-dd'), format(endOfDay(d), 'yyyy-MM-dd')];
    },
  },
  {
    label: 'Last 7 days',
    getDates: () => [
      format(subDays(new Date(), 6), 'yyyy-MM-dd'),
      format(new Date(), 'yyyy-MM-dd'),
    ],
  },
  {
    label: 'Last 30 days',
    getDates: () => [
      format(subDays(new Date(), 29), 'yyyy-MM-dd'),
      format(new Date(), 'yyyy-MM-dd'),
    ],
  },
  {
    label: 'This month',
    getDates: () => {
      const d = new Date();
      return [format(startOfMonth(d), 'yyyy-MM-dd'), format(endOfMonth(d), 'yyyy-MM-dd')];
    },
  },
  {
    label: 'Last month',
    getDates: () => {
      const d = subMonths(new Date(), 1);
      return [format(startOfMonth(d), 'yyyy-MM-dd'), format(endOfMonth(d), 'yyyy-MM-dd')];
    },
  },
  {
    label: 'This quarter',
    getDates: () => {
      const d = new Date();
      return [format(startOfQuarter(d), 'yyyy-MM-dd'), format(endOfQuarter(d), 'yyyy-MM-dd')];
    },
  },
  {
    label: 'This year',
    getDates: () => {
      const d = new Date();
      return [format(startOfYear(d), 'yyyy-MM-dd'), format(endOfYear(d), 'yyyy-MM-dd')];
    },
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function DateRangeContent<TData>({
  column,
  close,
}: {
  column: Column<TData, unknown>;
  close: () => void;
}) {
  const filterValue = (column.getFilterValue() as [string, string]) ?? [];
  const hasActiveFilter = !!filterValue[0] || !!filterValue[1];

  const dateRange: DateRange = {
    from:
      filterValue[0] && isValid(parseISO(filterValue[0])) ? parseISO(filterValue[0]) : undefined,
    to: filterValue[1] && isValid(parseISO(filterValue[1])) ? parseISO(filterValue[1]) : undefined,
  };

  const handleSelect = (range: DateRange | undefined) => {
    const from = range?.from && isValid(range.from) ? format(range.from, 'yyyy-MM-dd') : undefined;
    const to = range?.to && isValid(range.to) ? format(range.to, 'yyyy-MM-dd') : undefined;
    column.setFilterValue([from, to]);
  };

  const applyPreset = (preset: Preset) => {
    column.setFilterValue(preset.getDates());
  };

  const activePreset = DATE_PRESETS.find((p) => {
    const [from, to] = p.getDates();
    return filterValue[0] === from && filterValue[1] === to;
  });

  return (
    <div className="flex flex-col">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-1.5 border-b p-3">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              activePreset?.label === preset.label
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="p-3">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          captionLayout="dropdown"
          numberOfMonths={1}
          className="w-full"
        />
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/40 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full"
          disabled={!hasActiveFilter}
          onClick={() => {
            column.setFilterValue(undefined);
            close();
          }}
        >
          Clear filter
        </Button>
      </div>
    </div>
  );
}
