'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  RefreshCw,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { APP_NAME } from '@/lib/constants';
import { PAGE_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/cn';

const navLinks = [
  { label: 'Dashboard', href: PAGE_ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Students', href: PAGE_ROUTES.STUDENTS, icon: Users },
  { label: 'Bulk Update', href: PAGE_ROUTES.BULK_UPDATE, icon: RefreshCw },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={PAGE_ROUTES.DASHBOARD}
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary hover:opacity-80 transition-opacity"
        >
          <GraduationCap className="w-6 h-6" />
          <span>{APP_NAME}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{session.user.role}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}

            {/* Mobile User Section */}
            {session?.user && (
              <>
                <div className="border-t my-3 pt-3">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {session.user.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: '/auth/login' });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
