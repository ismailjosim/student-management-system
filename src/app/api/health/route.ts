import { connectDB } from '@/lib/mongodb';
import { createResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const response = createResponse(200, 'Health check passed', {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    const response = createResponse(503, 'Health check failed', undefined, [
      { message: errorMessage },
    ]);

    return NextResponse.json(response, { status: 503 });
  }
}
