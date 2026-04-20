import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXT_PUBLIC_API_URL: !!process.env.NEXT_PUBLIC_API_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
