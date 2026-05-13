import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    await connectDB();

    // check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isActive: true,
      role: 'viewer',
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Signup failed', error }, { status: 500 });
  }
}
