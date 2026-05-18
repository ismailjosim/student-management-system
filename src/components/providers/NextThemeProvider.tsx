'use client';

import { ThemeProvider } from 'next-themes';
import type React from 'react';

interface NextThemeProviderProps {
  children: React.ReactNode;
}

export function NextThemeProvider({ children }: NextThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
