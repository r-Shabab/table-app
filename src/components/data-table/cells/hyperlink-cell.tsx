import React from 'react';
import { LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HyperlinkCellProps {
  label?: string | null;
  href?: string | null;
  maxWidth?: string;
}

export const HyperlinkCell = React.memo(
  ({ label, href, maxWidth = 'max-w-[200px]' }: HyperlinkCellProps) => {
    if (!label) return <span className="text-muted-foreground">-</span>;
    if (!href) return <span className={`truncate ${maxWidth} font-medium`}>{label}</span>;

    return (
      <Link
        to={href}
        className="group flex items-center gap-1.5 font-medium text-primary transition-colors hover:underline"
        onClick={(e) => e.stopPropagation()} // Prevent row click events
      >
        <span className={`truncate ${maxWidth}`}>{label}</span>
        <LinkIcon className="size-3.5 opacity-50 transition-opacity group-hover:opacity-100" />
      </Link>
    );
  }
);
HyperlinkCell.displayName = 'HyperlinkCell';
