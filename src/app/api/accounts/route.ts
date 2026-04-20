export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { getServices } from "@/lib/api-client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await getServices();
    
    const markupSetting = await prisma.setting.findUnique({
      where: { key: "MARKUP_PERCENTAGE" },
    });
    const markupMultiplier = markupSetting ? parseFloat(markupSetting.value) / 100 : 5;
    
    // Convert to legacy v1 format
    const formatted = services.map((s: any) => ({
      id: s.id,
      platform: s.category || "Other", 
      type: "Account",
      title: s.name,
      description: s.description || "",
      price: Math.ceil(s.price * markupMultiplier),
      stock: s.stock,
      image: "https://tlogsmarketplace.com/assets/images/product-placeholder.png",
      badges: [s.category?.toLowerCase() || "other"],
      quality: 100
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("ACCOUNTS_API_ERROR", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
