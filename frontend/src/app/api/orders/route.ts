import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServices, placeOrder } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceId } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ message: "Service ID is required" }, { status: 400 });
    }

    // 1. Get the service details from external API to get current base price
    const services = await getServices();
    const service = services.find((s: any) => s.id === serviceId);

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    // 2. Calculate final price
    const markupSetting = await prisma.setting.findUnique({
      where: { key: "MARKUP_PERCENTAGE" },
    });
    const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;
    const finalPrice = service.price * markupMultiplier;

    // 3. Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    // 5. Place order via external API (Out of transaction because it's external)
    try {
      const extOrder = await placeOrder(service.id);
      
      // Update order with external ID
      await prisma.order.update({
        where: { id: result.newOrder.id },
        data: { 
          externalOrderId: extOrder.id,
          status: "COMPLETED" // Or map based on extOrder response
        },
      });
    } catch (apiError) {
      console.error("EXTERNAL_API_ORDER_ERROR", apiError);
      // Depending on policy, we might want to refund user here if API fails
      // For now, mark as FAILED
      await prisma.order.update({
        where: { id: result.newOrder.id },
        data: { status: "FAILED" },
      });
      // OPTIONAL: Refund
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: finalPrice } },
      });
      
      return NextResponse.json({ message: "Failed to place order with provider. Refunded." }, { status: 500 });
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
