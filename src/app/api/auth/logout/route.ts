import { redirect } from 'next/navigation';

export async function GET() {
  // Clear session by redirecting to login
  // NextAuth v5 doesn't have built-in logout API, so we use middleware
  redirect('/auth/login');
}
