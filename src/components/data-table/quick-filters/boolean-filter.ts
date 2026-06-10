import { type FilterFn } from '@tanstack/react-table';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const booleanFilter: FilterFn<any> = (row, columnId, filterValue: boolean) => {
  return row.getValue<boolean>(columnId) === filterValue;
};

booleanFilter.autoRemove = (val: unknown) => val === undefined || val === null;
