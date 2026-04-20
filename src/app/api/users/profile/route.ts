export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    let userId: string | null = null;

    // 1. Try next-auth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    }

    // 2. Try Bearer token (Legacy compatibility)
    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded: any = jwt.verify(
            token, 
            process.env.JWT_SECRET || "biggestlogs_secret_key_2026"
          );
          userId = decoded.id;
        } catch (err) {
          console.error("JWT_VERIFY_ERROR", err);
        }
      }
    }

    // 3. Try x-user-id header (Internal compatibility)
    if (!userId) {
      userId = req.headers.get("x-user-id");
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return in a format compatible with both v1 and v2
    return NextResponse.json({
      ...user,
      _id: user.id,
      isAdmin: user.role === "ADMIN"
    });

  } catch (error) {
    console.error("PROFILE_API_ERROR", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
