export type FilterOperator =
  // text
  | 'contains'
  | 'does_not_contain'
  | 'starts_with'
  | 'ends_with'
  // shared text + date
  | 'is'
  | 'is_not'
  // number
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  // shared number + date
  | 'between'
  // date
  | 'before'
  | 'after'
  // shared across types
  | 'is_empty'
  | 'is_not_empty'
  // boolean
  | 'is_true'
  | 'is_false'
  // enum / multiSelect
  | 'is_any_of'
  | 'is_none_of';

export type FilterValue =
  | string
  | number
  | [number, number]
  | [string, string]
  | string[]
  | null;

/** Shape written to TanStack columnFilters by both the panel and (after migration) quick filters */
export interface ColumnFilterValue {
  operator: FilterOperator;
  value: FilterValue;
}

/** Panel-local row type — includes a stable UUID for dnd-kit */
export interface FilterRule {
  id: string;
  columnId: string;
  filterType: string;
  operator: FilterOperator;
  value: FilterValue;
}

export interface FilterableColumn {
  id: string;
  label: string;
  filterType: string;
  enumOptions?: { label: string; value: string }[];
}

export interface OperatorOption {
  value: FilterOperator;
  label: string;
}

export const NO_VALUE_OPS = new Set<FilterOperator>([
  'is_empty',
  'is_not_empty',
  'is_true',
  'is_false',
]);

export const BETWEEN_OPS = new Set<FilterOperator>(['between']);

export const OPERATOR_OPTIONS: Record<string, OperatorOption[]> = {
  text: [
    { value: 'contains', label: 'contains' },
    { value: 'does_not_contain', label: 'does not contain' },
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  number: [
    { value: 'eq', label: '=' },
    { value: 'neq', label: '≠' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '≥' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '≤' },
    { value: 'between', label: 'between' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  date: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  boolean: [
    { value: 'is_true', label: 'is true' },
    { value: 'is_false', label: 'is false' },
  ],
  multiSelect: [
    { value: 'is_any_of', label: 'is any of' },
    { value: 'is_none_of', label: 'is none of' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
};

export function getDefaultOperator(filterType: string): FilterOperator {
  return OPERATOR_OPTIONS[filterType]?.[0]?.value ?? 'contains';
}

export function getDefaultValue(
  filterType: string,
  operator: FilterOperator
): FilterRule['value'] {
  if (NO_VALUE_OPS.has(operator)) return null;
  if (BETWEEN_OPS.has(operator)) {
    return filterType === 'number' ? [0, 0] : ['', ''];
  }
  if (filterType === 'multiSelect') return [];
  return null;
}
