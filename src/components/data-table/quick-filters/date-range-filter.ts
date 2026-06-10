import { type FilterFn } from '@tanstack/react-table';
import { parseISO, isWithinInterval, startOfDay, endOfDay, isValid } from 'date-fns';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dateRangeFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue: [string | undefined, string | undefined]
) => {
  const rowValue = row.getValue(columnId) as string;
  if (!rowValue) return false;

  const rowDate = parseISO(rowValue);
  if (!isValid(rowDate)) return false;

  const [fromStr, toStr] = filterValue;

  const fromDate =
    fromStr && isValid(parseISO(fromStr)) ? startOfDay(parseISO(fromStr)) : undefined;
  const toDate = toStr && isValid(parseISO(toStr)) ? endOfDay(parseISO(toStr)) : undefined;

  // If no filters are set, show everything
  if (!fromDate && !toDate) return true;

  // Otherwise check if within range
  return isWithinInterval(rowDate, {
    start: fromDate || new Date(0),
    end: toDate || new Date(8640000000000000),
  });
};
