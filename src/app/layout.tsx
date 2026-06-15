import type { Metadata } from 'next';
import './globals.css';

import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/Layout/AppShell';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NextThemeProvider } from '@/components/providers/NextThemeProvider';

export const metadata: Metadata = {
  title: 'MentorTrack — Student Management',
  description: 'Student Mentorship Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full bg-background">
        <NextThemeProvider>
          <AuthProvider>
            <Toaster position="top-center" />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
