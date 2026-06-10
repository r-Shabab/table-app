import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileCellProps {
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
}

export const ProfileCell = React.memo(({ title, subtitle, imageUrl }: ProfileCellProps) => {
  if (!title) return <span className="text-muted-foreground">-</span>;

  const initials = title.substring(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-8">
        {imageUrl && <AvatarImage src={imageUrl} alt={title} />}
        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="max-w-[200px] truncate font-medium text-foreground">{title}</span>
        {subtitle && (
          <span className="max-w-[200px] truncate text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  );
});
ProfileCell.displayName = 'ProfileCell';
