import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TextCellProps {
  text?: string | null;
  maxWidth?: string;
  className?: string;
}

export const TextCell = React.memo(
  ({ text, maxWidth = 'max-w-[200px]', className }: TextCellProps) => {
    if (!text) return <span className="text-muted-foreground">-</span>;

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(`truncate ${maxWidth} font-medium`, className)}>{text}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px] break-words">
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);
TextCell.displayName = 'TextCell';
