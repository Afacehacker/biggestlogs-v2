export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServices, placeOrder } from "@/lib/api-client";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // Legacy auth support
    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "biggestlogs_secret_key_2026");
          userId = decoded.id;
        } catch (err) {}
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET_ORDERS_ERROR", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // Legacy auth support
    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "biggestlogs_secret_key_2026");
          userId = decoded.id;
        } catch (err) {}
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, accountId } = await req.json();
    const idToUse = serviceId || accountId;

    if (!idToUse) {
      return NextResponse.json({ message: "Service ID is required" }, { status: 400 });
    }

    // 1. Get the service details from external API to get current base price
    const services = await getServices();
    const service = services.find((s: any) => s.id === idToUse);

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    // 2. Calculate final price (TLogs prices are in VND — convert to NGN first)
    const markupSetting = await prisma.setting.findUnique({
      where: { key: "MARKUP_PERCENTAGE" },
    });
    const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;
    const conversionRate = parseFloat(process.env.VND_TO_NGN_RATE || "0.06");
    const finalPrice = Math.ceil(service.price * conversionRate * markupMultiplier);

    // 3. Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.balance < finalPrice) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
    }

    // 4. Atomic transaction: Deduct balance, Create Order, Create Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: finalPrice } },
      });

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          serviceName: service.name,
          basePrice: service.price,
          markupPrice: finalPrice,
          amount: finalPrice,
          status: "PENDING",
        },
      });

      // Create Transaction RECORD
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: finalPrice,
          type: "DEDUCTION",
          status: "COMPLETED",
          reference: `ORDER-${newOrder.id}`,
        },
      });

      return { updatedUser, newOrder };
    });

    // 5. Place order via external TLogs API (outside transaction — external call)
    try {
      const extOrder = await placeOrder(service.id);

      // extOrder has: { status: "success", trans_id: "...", data: "..." }
      await prisma.order.update({
        where: { id: result.newOrder.id },
        data: {
          externalOrderId: String(extOrder.trans_id || ""),
          details: extOrder.data ?? null,
          status: "COMPLETED",
        },
      });
    } catch (apiError) {
      console.error("EXTERNAL_API_ORDER_ERROR", apiError);
      // Mark as FAILED and refund balance
      await prisma.order.update({
        where: { id: result.newOrder.id },
        data: { status: "FAILED" },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: finalPrice } },
      });

      return NextResponse.json({ message: "Failed to place order with provider. Balance refunded." }, { status: 502 });
    }

    return NextResponse.json({ 
      message: "Order placed successfully", 
      orderId: result.newOrder.id,
      newBalance: result.updatedUser.balance 
    });
  } catch (error) {
    console.error("ORDERS_API_ERROR", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
