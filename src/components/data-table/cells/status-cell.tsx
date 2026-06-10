import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  status?: string | null;
  // Optional override map if a specific table needs custom colors
  variantMap?: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'>;
}

const defaultVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  COMPLETED: 'default',
  PAID: 'default',
  INACTIVE: 'secondary',
  DRAFT: 'secondary',
  PENDING: 'outline',
  SUSPENDED: 'destructive',
  FAILED: 'destructive',
  OVERDUE: 'destructive',
};

export const StatusCell = React.memo(
  ({ status, variantMap = defaultVariantMap }: StatusCellProps) => {
    if (!status) return <span className="text-muted-foreground">-</span>;

    const normalized = status.toUpperCase();
    const variant = variantMap[normalized] || 'outline';

    return (
      <Badge variant={variant} className="font-medium shadow-none capitalize">
        {status.toLowerCase().replace(/_/g, ' ')}
      </Badge>
    );
  }
);
StatusCell.displayName = 'StatusCell';
