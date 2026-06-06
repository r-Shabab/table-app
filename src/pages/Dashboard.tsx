import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { users } from '@/data/users';
import { DataTable } from '@/components/data-table/data-table';
import { userColumns } from '@/components/columns/user-columns';

function Dashboard() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button>
          <Plus className="size-4" />
          Create User
        </Button>
      </div>

      <div className="container mx-auto py-10">
        <DataTable columns={userColumns} data={users} />
      </div>
    </div>
  );
}

export default Dashboard;
