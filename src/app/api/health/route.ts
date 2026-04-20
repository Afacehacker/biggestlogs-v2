import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const start = Date.now();
    await dbConnect();
    const duration = Date.now() - start;
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      connectionState: mongoose.connection.readyState,
      latency: `${duration}ms`,
      env: {
        has_uri: !!process.env.MONGODB_URI,
        has_secret: !!process.env.NEXTAUTH_SECRET,
      }
    });
  } catch (error: any) {
    console.error('HEALTH_CHECK_ERROR', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
