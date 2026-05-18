import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/Layout/Navbar';
import { Footer } from '@/components/Layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NextThemeProvider } from '@/components/providers/NextThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
