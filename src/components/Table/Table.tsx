import React from 'react';
import { cn } from '@/lib/cn';

interface TableProps {
  children?: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children?: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children?: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

interface TableCellProps {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return <thead className={cn('bg-muted/50 border-b border-border', className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn('divide-y divide-border', className)}>{children}</tbody>;
}

export function TableRow({ children, className, clickable, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-muted/50',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, align = 'left' }: TableCellProps) {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return <td className={cn('px-4 py-3 text-foreground', alignClass, className)}>{children}</td>;
}

interface TableHeadCellProps extends TableCellProps {
  sortable?: boolean;
  onSort?: () => void;
}

export function TableHeadCell({
  children,
  className,
  align = 'left',
  sortable,
  onSort,
}: TableHeadCellProps) {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <th
      className={cn(
        'px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider',
        alignClass,
        sortable && 'cursor-pointer hover:text-foreground',
        className
      )}
      onClick={onSort}
    >
      {children}
    </th>
  );
}
