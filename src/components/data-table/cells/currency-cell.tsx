import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyCellProps {
  amount?: number | null;
  currency?: string;
  locale?: string;
  className?: string;
}

export const CurrencyCell = React.memo(
  ({ amount, currency = 'USD', locale = 'en-US', className }: CurrencyCellProps) => {
    if (amount === null || amount === undefined) {
      return <div className="text-right text-muted-foreground">-</div>;
    }

    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    // Negative numbers often get specific styling in ERPs
    const isNegative = amount < 0;

    return (
      <div
        className={cn(
          'text-center font-medium tabular-nums',
          isNegative ? 'text-destructive' : 'text-foreground',
          className
        )}
      >
        {formatted}
      </div>
    );
  }
);
CurrencyCell.displayName = 'CurrencyCell';
