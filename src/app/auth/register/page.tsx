'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    await authClient.signUp.email(
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully!');
          router.push('/dashboard');
          router.refresh();
        },
        onError: (ctx) => {
          const message = ctx.error.message || 'Registration failed';
          setError(message);
          toast.error(message);
        },
      }
    );

    setIsLoading(false);
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[.9fr_1.1fr]">
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 font-bold">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            MentorTrack
          </div>
          <p className="text-sm font-bold text-primary">Start your workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Set up a focused home for student progress and outreach.
          </p>

          <div className="mt-8">
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-10"
                  disabled={isLoading}
                />
              </div>

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
                  placeholder="At least 8 characters"
                  className="h-10"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  'Creating account...'
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_75%_20%,white_0,transparent_30%),radial-gradient(circle_at_15%_90%,white_0,transparent_25%)]" />
        <Sparkles className="relative size-8" />
        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground/65">
            Built for momentum
          </p>
          <h2 className="text-5xl font-bold leading-[1.08] tracking-[-0.05em]">
            Turn student signals into timely support.
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/75">
            Keep every assignment, call, and follow-up visible without turning mentorship into admin
            work.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/55">
          A clearer operating system for cohort care
        </p>
      </div>
    </div>
  );
}
