import type { Metadata } from 'next';
import './globals.css';

import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/Layout/Navbar';
import { Footer } from '@/components/Layout/Footer';
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
      <body className="min-h-full flex flex-col bg-background">
        <NextThemeProvider>
          <AuthProvider>
            <Toaster position="top-center" />
            <Navbar />
            <main className="min-h-screen container mx-auto">{children}</main>
            <Footer />
          </AuthProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
