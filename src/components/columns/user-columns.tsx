import { type ColumnDef } from '@tanstack/react-table';
import type { User } from '../../types/user-types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '../data-table/data-table-column-header';

export type UserColumn = ColumnDef<User>;

export const userColumns: UserColumn[] = [
  {
    id: 'select',
    meta: { title: 'Select' },
    header: ({ table }) => {
      const isAll = table.getIsAllPageRowsSelected();
      const isSome = table.getIsSomePageRowsSelected();
      const checkedState: boolean | 'indeterminate' = isAll
        ? true
        : isSome
          ? 'indeterminate'
          : false;

      return (
        <Checkbox
          checked={checkedState}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    meta: { title: 'Name' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'email',
    meta: { title: 'Email' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: 'role',
    meta: { title: 'Role' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
  },
  {
    accessorKey: 'status',
    meta: { title: 'Status' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  },
  {
    accessorKey: 'salary',
    meta: { title: 'Salary' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Salary" />,

    cell: ({ row }) => {
      const salary = parseFloat(row.getValue('salary'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(salary);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    meta: { title: 'Created At' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
  },
  {
    id: 'actions',
    meta: { title: 'Actions' },
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">View menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View user</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem>Delete user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
