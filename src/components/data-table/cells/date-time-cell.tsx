import React from 'react';

interface DateTimeCellProps {
  dateString?: string | Date | null;
  showTime?: boolean;
}

export const DateTimeCell = React.memo(({ dateString, showTime = false }: DateTimeCellProps) => {
  if (!dateString) return <span className="text-muted-foreground">-</span>;

  const date = new Date(dateString);

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

  if (!showTime) {
    return (
      <div className="whitespace-nowrap text-muted-foreground font-medium">{formattedDate}</div>
    );
  }

  const formattedTime = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return (
    <div className="flex flex-col whitespace-nowrap">
      <span className="font-medium text-foreground">{formattedDate}</span>
      <span className="text-xs text-muted-foreground">{formattedTime}</span>
    </div>
  );
});
DateTimeCell.displayName = 'DateTimeCell';
