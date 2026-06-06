import { type Table } from '@tanstack/react-table';

export function getUniqueValues<TData>(table: Table<TData>, columnId: string): string[] {
  return [
    ...new Set(
      table.getCoreRowModel().rows.map((row) => String(row.getValue(columnId))),
    ),
  ].sort();
}
