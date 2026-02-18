import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if we can access basic system info
    const status = {
      online: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      }
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { online: false, error: 'Status check failed' },
      { status: 500 }
    );
  }
}
