import { type FilterFn } from '@tanstack/react-table';
import { type ColumnFilterValue } from '../types/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const textFilter: FilterFn<any> = (row, columnId, fv: ColumnFilterValue) => {
  const cell = row.getValue(columnId);
  const { operator, value } = fv;

  if (operator === 'is_empty') return cell === null || cell === undefined || cell === '';
  if (operator === 'is_not_empty') return cell !== null && cell !== undefined && cell !== '';
  if (value === null || value === undefined || value === '') return true;

  const raw = String(cell ?? '').toLowerCase();
  const val = String(value).toLowerCase();

  switch (operator) {
    case 'contains':
      return raw.includes(val);
    case 'does_not_contain':
      return !raw.includes(val);
    case 'starts_with':
      return raw.startsWith(val);
    case 'ends_with':
      return raw.endsWith(val);
    case 'is':
      return raw === val;
    case 'is_not':
      return raw !== val;
    default:
      return true;
  }
};
textFilter.autoRemove = (val: unknown) => !val;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const numberFilter: FilterFn<any> = (row, columnId, fv: ColumnFilterValue) => {
  const cell = row.getValue(columnId);
  const { operator, value } = fv;

  if (operator === 'is_empty') return cell === null || cell === undefined;
  if (operator === 'is_not_empty') return cell !== null && cell !== undefined;
  if (value === null || value === undefined) return true;

  const num = Number(cell);

  switch (operator) {
    case 'eq':
      return num === Number(value);
    case 'neq':
      return num !== Number(value);
    case 'gt':
      return num > Number(value);
    case 'gte':
      return num >= Number(value);
    case 'lt':
      return num < Number(value);
    case 'lte':
      return num <= Number(value);
    case 'between': {
      const [min, max] = value as [number, number];
      return num >= Number(min) && num <= Number(max);
    }
    default:
      return true;
  }
};
numberFilter.autoRemove = (val: unknown) => !val;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dateFilter: FilterFn<any> = (row, columnId, fv: ColumnFilterValue) => {
  const cell = row.getValue(columnId);
  const { operator, value } = fv;

  if (operator === 'is_empty') return cell === null || cell === undefined || cell === '';
  if (operator === 'is_not_empty') return cell !== null && cell !== undefined && cell !== '';
  if (value === null || value === undefined || value === '') return true;

  const dateStr = typeof cell === 'string' ? cell.slice(0, 10) : '';
  const ts = cell ? new Date(String(cell)).getTime() : NaN;

  switch (operator) {
    case 'is':
      return dateStr === String(value);
    case 'is_not':
      return dateStr !== String(value);
    case 'before':
      return ts < new Date(String(value)).getTime();
    case 'after':
      return ts > new Date(String(value) + 'T23:59:59').getTime();
    case 'between': {
      const [from, to] = value as [string, string];
      if (!from && !to) return true;
      return ts >= new Date(from).getTime() && ts <= new Date(to + 'T23:59:59').getTime();
    }
    default:
      return true;
  }
};
dateFilter.autoRemove = (val: unknown) => !val;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const enumFilter: FilterFn<any> = (row, columnId, fv: ColumnFilterValue) => {
  const cell = row.getValue(columnId);
  const { operator, value } = fv;

  if (operator === 'is_empty') return cell === null || cell === undefined || cell === '';
  if (operator === 'is_not_empty') return cell !== null && cell !== undefined && cell !== '';
  if (!Array.isArray(value) || value.length === 0) return true;

  const strVal = String(cell ?? '');

  switch (operator) {
    case 'is_any_of':
      return (value as string[]).includes(strVal);
    case 'is_none_of':
      return !(value as string[]).includes(strVal);
    default:
      return true;
  }
};
enumFilter.autoRemove = (val: unknown) => !val;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const booleanFilterFn: FilterFn<any> = (row, columnId, fv: ColumnFilterValue) => {
  const cell = row.getValue(columnId);
  const { operator } = fv;
  if (operator === 'is_true') return cell === true;
  if (operator === 'is_false') return cell === false;
  return true;
};
booleanFilterFn.autoRemove = (val: unknown) => !val;
