import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "alive", 
    time: new Date().toISOString(),
    version: "2.0.0-compat"
  });
}
