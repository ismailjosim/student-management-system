'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const errorFromUrl = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          toast.success('Login successful!');
          router.push(callbackUrl);
          router.refresh();
        },
        onError: (ctx) => {
          const message = ctx.error.message || 'Login failed';
          setError(message);
          toast.error(message);
        },
      }
    );
    setIsLoading(false);
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_20%,white_0,transparent_32%),radial-gradient(circle_at_80%_80%,white_0,transparent_24%)]" />
        <div className="relative flex items-center gap-3 text-lg font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            <GraduationCap className="size-5" />
          </span>
          MentorTrack
        </div>
        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground/65">
            Student success, organized
          </p>
          <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.05em]">
            See who needs attention before they fall behind.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-primary-foreground/75">
            One calm workspace for cohort progress, mentor outreach, assignments, and follow-ups.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-primary-foreground/80 sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4" /> Live cohort insights
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Secure team access
            </span>
          </div>
        </div>
        <p className="relative text-xs text-primary-foreground/55">Mentor operations platform</p>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-6 flex items-center gap-3 font-bold">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-5" />
              </span>
              MentorTrack
            </div>
          </div>
          <p className="text-sm font-bold text-primary">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Sign in to your workspace</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Continue managing student progress and mentor follow-ups.
          </p>

          <div className="mt-8">
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {errorFromUrl && (
              <div className="mb-4 p-4 bg-warning-soft border border-warning-border rounded-lg">
                <p className="text-warning-foreground text-sm">
                  {errorFromUrl === 'unauthorized'
                    ? 'You do not have permission to access this page'
                    : 'An error occurred during login'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-10"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-10"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              New to MentorTrack?{' '}
              <Link href="/auth/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
          <p className="mt-12 text-center text-xs text-muted-foreground">
            © 2026 MentorTrack. Secure student operations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
