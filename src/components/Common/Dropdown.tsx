'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DropdownOption {
  label: string;
  value: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownProps {
  trigger: string | React.ReactNode;
  options: DropdownOption[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, options, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: DropdownOption) => {
    option.onClick?.();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
      >
        {trigger}
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 min-w-50 rounded-md border border-border bg-background shadow-lg z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors',
                  option.variant === 'danger' && 'text-destructive hover:bg-destructive/10'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
