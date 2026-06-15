'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/auth');

  if (isAuthRoute) return <main className="min-h-screen">{children}</main>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}
