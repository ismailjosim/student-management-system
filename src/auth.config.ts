/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// ✅ FIX 1: correct Zod email validation
const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const authConfig = {
  providers: [
    Credentials({
      name: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        try {
          // ✅ FIX 2: guard (credentials can be undefined)
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          // Validate input
          const validated = credentialsSchema.safeParse(credentials);

          if (!validated.success) {
            console.log('Validation failed:', validated.error.flatten());
            return null;
          }

          const { email, password } = validated.data;

          // Connect DB
          await connectDB();

          // FIX 3: ensure password is selected safely
          const user = await User.findOne({ email }).select('+password');

          if (!user) {
            console.log('User not found');
            return null;
          }

          if (user.isActive === false) {
            console.log('User inactive');
            return null;
          }

          // FIX 4: safer password check
          if (typeof user.comparePassword !== 'function') {
            console.log('comparePassword missing in model');
            return null;
          }

          const isPasswordValid = await user.comparePassword(password);

          if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
          }

          // FIX 5: return consistent user object
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role ?? 'viewer',
          };
        } catch (error) {
          console.error('AUTH ERROR:', error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24h
  },

  jwt: {
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'viewer';
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as any) ?? 'viewer';
      }

      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
