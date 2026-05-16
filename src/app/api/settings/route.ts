import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Settings } from '@/models/Settings';

export async function GET() {
  try {
    await connectDB();

    let settings = await Settings.findOne({});

    // If no settings exist, create default one
    if (!settings) {
      settings = await Settings.create({
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
    const body = await request.json();

    const { currentAssignment } = body;

    if (!currentAssignment) {
      return NextResponse.json(
        { success: false, error: 'currentAssignment is required' },
        { status: 400 }
      );
    }

    let settings = await Settings.findOne({});

    if (!settings) {
      settings = await Settings.create({
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
