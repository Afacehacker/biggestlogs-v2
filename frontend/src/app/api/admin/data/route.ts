import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [users, orders, settings] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.order.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.setting.findMany(),
    ]);

    // Aggregate stats
    const stats = {
      totalUsers: await prisma.user.count(),
      totalOrders: await prisma.order.count(),
      totalRevenue: orders.reduce((acc, order) => acc + (order.status === "COMPLETED" ? order.amount : 0), 0),
    };

    // Format settings
    const formattedSettings = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json({
      users,
      orders,
      settings: formattedSettings,
      stats,
    });
  } catch (error) {
    console.error("ADMIN_DATA_ERROR", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
