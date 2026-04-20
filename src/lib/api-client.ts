import axios from "axios";

const API_KEY = process.env.TLOGS_API_KEY;
const BASE_URL = process.env.TLOGS_BASE_URL || "https://tlogsmarketplace.com/api";

const tlogsApi = axios.create({
  baseURL: BASE_URL,
});

// ---------------------------------------------------------------------------
// getServices — mirrors the logic in server/index.ts getServices()
// ---------------------------------------------------------------------------
export const getServices = async (): Promise<any[]> => {
  try {
    const response = await tlogsApi.get(`/products.php?api_key=${API_KEY}`);
    const data = response.data;
    let products: any[] = [];

    // TLogs API structure: { categories: [ { name: "...", products: [...] } ] }
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach((cat: any) => {
        if (cat.products && Array.isArray(cat.products)) {
          cat.products.forEach((p: any) => {
            products.push({ ...p, category_name: cat.name });
          });
        }
      });
    } else if (Array.isArray(data)) {
      products = data;
    }

    // Normalize and categorize — identical to server/index.ts
    const normalized = products.map((p: any) => {
      const name = (p.name || p.product_name || p.Name || "Unnamed Product").toUpperCase();
      let category = (p.category_name || p.Category || "Other").toUpperCase();

      if (name.includes("FACEBOOK") || category.includes("FACEBOOK") || name.startsWith("FB ")) category = "Facebook";
      else if (name.includes("INSTAGRAM") || category.includes("INSTAGRAM") || name.startsWith("IG ")) category = "Instagram";
      else if (name.includes("TIKTOK") || category.includes("TIKTOK")) category = "TikTok";
      else if (name.includes("GOOGLE") || name.includes("GMAIL") || category.includes("GOOGLE")) category = "Google";
      else if (name.includes("TWITTER") || name.includes("X.COM") || category.includes("TWITTER")) category = "Twitter (X)";
      else if (name.includes("NETFLIX") || name.includes("DISNEY") || name.includes("PREMIUM")) category = "Premium Accounts";
      else {
        category = category.charAt(0) + category.slice(1).toLowerCase();
      }

      return {
        id: String(p.id || p.product_id || p.ID || Math.random()),
        name: p.name || p.product_name || p.Name,
        category,
        price: parseFloat(p.price || p.Price || p.cost || 0),
        stock: parseInt(p.stock || p.amount || p.Quantity || p.Stock || p.count || 0),
        description: p.description || p.Description || "",
      };
    });

    return normalized.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error("Error fetching services from TLogs:", error);
    return [];
  }
};

// ---------------------------------------------------------------------------
// placeOrder — mirrors the Express server's /buy_product call
// ---------------------------------------------------------------------------
export const placeOrder = async (serviceId: string, quantity: number = 1) => {
  const formData = new URLSearchParams();
  formData.append("action", "buyProduct");
  formData.append("id", serviceId);
  formData.append("amount", String(quantity));
  formData.append("api_key", API_KEY as string);

  const response = await tlogsApi.post("/buy_product", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (response.data?.status !== "success") {
    throw new Error(response.data?.msg || "External API returned a non-success status");
  }

  return response.data;
};

// ---------------------------------------------------------------------------
// getOrderStatus
// ---------------------------------------------------------------------------
export const getOrderStatus = async (transId: string) => {
  const response = await tlogsApi.get(`/order_status.php?api_key=${API_KEY}&trans_id=${transId}`);
  return response.data;
};
