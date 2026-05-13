import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  closeable?: boolean;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  { icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }
> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
};

export function Alert({ type, title, message, onClose, closeable = true, className }: AlertProps) {
  const config = alertConfig[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        config.textColor,
        className
      )}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold text-sm">{title}</h3>}
        <p className={cn('text-sm', title && 'mt-1')}>{message}</p>
      </div>
      {closeable && onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
