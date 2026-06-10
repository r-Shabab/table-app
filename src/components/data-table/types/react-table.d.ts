import '@tanstack/react-table';
import { type FilterFn } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface FilterFns {
    textFilter: FilterFn<unknown>;
    numberFilter: FilterFn<unknown>;
    dateFilter: FilterFn<unknown>;
    enumFilter: FilterFn<unknown>;
    booleanFilterFn: FilterFn<unknown>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    title: string;
    filterType?: 'text' | 'multiSelect' | 'number' | 'date' | 'boolean';
    quickFilter?: boolean;
    /** Set false to exclude this column from the advanced filter panel */
    filterable?: boolean;
    /** Explicit enum options for multiSelect columns; falls back to faceted unique values */
    enumOptions?: { label: string; value: string }[];
    /** Set false to exclude this column from the advanced sort popover */
    sortable?: boolean;
  }

  export interface RowAction<TData> {
    label: string;
    icon?: LucideIcon;
    onClick: (row: TData) => void;
    /** Guard to completely hide the action (e.g., RBAC) */
    hidden?: (row: TData) => boolean;
    /** Guard to disable the action but keep it visible */
    disabled?: (row: TData) => boolean;
    /** Whether this action needs red/destructive styling */
    isDestructive?: boolean;
    /** Adds a separator line above this action */
    requireSeparator?: boolean;
  }

  interface TableMeta<TData> {
    rowActions?: RowAction<TData>[];
  }
}
