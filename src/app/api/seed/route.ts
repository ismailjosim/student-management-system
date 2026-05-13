import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

// Protect with a secret key
const SEED_SECRET = process.env.SEED_SECRET || 'change-me-in-production';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const secret = request.headers.get('x-seed-secret');
    if (secret !== SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const users = [
      {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin' as const,
        isActive: true,
      },
      {
        email: 'coordinator@example.com',
        password: 'password123',
        name: 'Coordinator User',
        role: 'coordinator' as const,
        isActive: true,
      },
      {
        email: 'viewer@example.com',
        password: 'password123',
        name: 'Viewer User',
        role: 'viewer' as const,
        isActive: true,
      },
    ];

    let createdCount = 0;
    const results = [];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        results.push({
          email: userData.email,
          status: 'skipped',
          message: 'User already exists',
        });
      } else {
        const user = await User.create(userData);
        createdCount++;
        results.push({
          email: user.email,
          status: 'created',
          role: user.role,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Seed complete! Created ${createdCount} new user(s)`,
        created: createdCount,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Allow anyone to check seed status
export async function GET() {
  return NextResponse.json({
    message: 'Seed API is available',
    note: 'POST with x-seed-secret header to seed users',
  });
}
