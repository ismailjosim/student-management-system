/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

// Validation schema for login
const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedCredentials = credentialsSchema.parse(credentials);

          // Connect to database
          await connectDB();

          // Find user by email with password field
          const user = await User.findOne({ email: validatedCredentials.email }).select(
            '+password'
          );

          if (!user) {
            throw new Error('Invalid email or password');
          }

          if (!user.isActive) {
            throw new Error('User account is inactive');
          }

          // Compare password
          const isPasswordValid = await user.comparePassword(validatedCredentials.password);

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Return user data (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error((error as any).errors[0]?.message || 'Invalid credentials');
          }
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'viewer';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = ((token.role as string) || 'viewer') as
          | 'admin'
          | 'coordinator'
          | 'viewer';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
} satisfies NextAuthConfig;
