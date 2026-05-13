'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';

interface TabItem {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ items, defaultValue, onValueChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0]?.value);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <div className={className}>
      {/* Tab List */}
      <div className="flex border-b border-border overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => handleTabChange(item.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[2px]',
              activeTab === item.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {items.map((item) =>
          activeTab === item.value ? (
            <div key={item.value} className="animate-in fade-in duration-200">
              {item.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
