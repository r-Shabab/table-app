import React from 'react';
import { Copy } from 'lucide-react';
// Import your toast library, e.g., sonner or react-hot-toast
import { toast } from 'sonner';

interface CopyableCellProps {
  value?: string | null;
  label?: string; // What to show in the toast (e.g., "SKU")
  maxWidth?: string;
}

export const CopyableCell = React.memo(
  ({ value, label = 'Value', maxWidth = 'max-w-[200px]' }: CopyableCellProps) => {
    if (!value) return <span className="text-muted-foreground">-</span>;

    const handleCopy = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    };

    return (
      <div className="group flex items-center gap-2">
        <span className={`truncate ${maxWidth} font-medium`}>{value}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 transition-opacity group-hover:opacity-100 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
          aria-label={`Copy ${label}`}
        >
          <Copy className="size-3.5" />
        </button>
      </div>
    );
  }
);
CopyableCell.displayName = 'CopyableCell';
