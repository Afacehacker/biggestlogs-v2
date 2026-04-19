import { NextResponse } from "next/server";
import { getServices } from "@/lib/api-client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Fetch services from external API
    const services = await getServices();

    // 2. Fetch markup percentage from DB (default 500)
    const markupSetting = await prisma.setting.findUnique({
      where: { key: "MARKUP_PERCENTAGE" },
    });
    const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;

    // 3. Apply markup to each service
    const servicesWithMarkup = services.map((service: any) => ({
      ...service,
      basePrice: service.price,
      finalPrice: service.price * markupMultiplier,
    }));

    return NextResponse.json(servicesWithMarkup);
  } catch (error) {
    console.error("SERVICES_API_ERROR", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
