import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Settings } from '@/models/Settings';
import { requireCurrentUserId } from '@/lib/auth-utils';

export async function GET() {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    let settings = await Settings.findOne({ ownerId: userId });

    // If no settings exist, create default one
    if (!settings) {
      settings = await Settings.create({
        ownerId: userId,
        currentAssignment: 'A-01',
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;
    const body = await request.json();

    const { currentAssignment } = body;

    if (!currentAssignment) {
      return NextResponse.json(
        { success: false, error: 'currentAssignment is required' },
        { status: 400 }
      );
    }

    let settings = await Settings.findOne({ ownerId: userId });

    if (!settings) {
      settings = await Settings.create({
        ownerId: userId,
        currentAssignment,
      });
    } else {
      settings.currentAssignment = currentAssignment;
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    console.error('Settings POST error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
