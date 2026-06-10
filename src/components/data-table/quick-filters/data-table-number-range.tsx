import type { Column } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NumberRangeContent<TData>({
  column,
  close,
}: {
  column: Column<TData, unknown>;
  close: () => void;
}) {
  const filterValue = (column.getFilterValue() as [number, number]) ?? [];
  const [minBound, maxBound] = column.getFacetedMinMaxValues() ?? [];

  const hasActiveFilter = filterValue[0] !== undefined || filterValue[1] !== undefined;

  return (
    <div className="flex flex-col">
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={minBound !== undefined ? `Min (${minBound})` : 'Min'}
            value={filterValue[0] ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              column.setFilterValue((old: [number, number]) => [
                val ? Number(val) : undefined,
                old?.[1],
              ]);
            }}
            className="h-8 flex-1"
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder={maxBound !== undefined ? `Max (${maxBound})` : 'Max'}
            value={filterValue[1] ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                val ? Number(val) : undefined,
              ]);
            }}
            className="h-8 flex-1"
          />
        </div>
      </div>

      {/* Footer block with background */}
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
