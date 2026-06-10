import React from 'react';
import { Check, Minus, X } from 'lucide-react';

interface BooleanCellProps {
  value?: boolean | null;
  showCrossForFalse?: boolean; // If true, shows a Red X instead of a muted Minus
}

export const BooleanCell = React.memo(({ value, showCrossForFalse = false }: BooleanCellProps) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (value) {
    return <Check className="size-5 text-emerald-600" aria-label="True" />;
  }

  if (showCrossForFalse) {
    return <X className="size-5 text-destructive" aria-label="False" />;
  }

  return <Minus className="size-5 text-muted-foreground opacity-50" aria-label="False" />;
});
BooleanCell.displayName = 'BooleanCell';
