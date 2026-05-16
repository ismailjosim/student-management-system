'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'unauthorized':
        return 'You do not have permission to access this page';
      case 'invalid_credentials':
        return 'Invalid email or password';
      case 'user_inactive':
        return 'Your account has been deactivated';
      default:
        return 'An authentication error occurred';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Error</h1>
          <p className="text-slate-600 mb-6">{getErrorMessage(error)}</p>

          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
