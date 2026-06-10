import { type Row, type Table } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
}

export function DataTableRowActions<TData>({ row, table }: DataTableRowActionsProps<TData>) {
  const data = row.original;
  const actions = table.options.meta?.rowActions ?? [];

  // Filter out actions hidden by RBAC or row-level logic
  const visibleActions = actions.filter((action) => (action.hidden ? !action.hidden(data) : true));

  if (visibleActions.length === 0) {
    return null; // Don't render the ... menu if user has no actions available
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {visibleActions.map((action, index) => {
          const Icon = action.icon;
          const isDisabled = action.disabled?.(data);

          return (
            <div key={action.label}>
              {action.requireSeparator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                key={index}
                disabled={isDisabled}
                onClick={() => action.onClick(data)}
                className={
                  action.isDestructive
                    ? 'text-destructive focus:bg-destructive/10 focus:text-destructive'
                    : ''
                }
              >
                {Icon && <Icon className="mr-2 size-4" />}
                {action.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
