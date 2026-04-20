export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServices } from "@/lib/api-client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Fetch and normalize services from TLogs
    const services = await getServices();

    // 2. Fetch pricing config from DB
    const markupSetting = await prisma.setting.findUnique({
      where: { key: "MARKUP_PERCENTAGE" },
    });
    const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;
    // TLogs prices are in VND — convert to NGN before markup
    const conversionRate = parseFloat(process.env.VND_TO_NGN_RATE || "0.06");

    // 3. Apply conversion + markup
    const servicesWithMarkup = services.map((service: any) => ({
      ...service,
      basePrice: Math.round(service.price * conversionRate * 100) / 100,
      finalPrice: Math.ceil(service.price * conversionRate * markupMultiplier),
    }));

    return NextResponse.json(servicesWithMarkup);
  } catch (error) {
    console.error("SERVICES_API_ERROR", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
