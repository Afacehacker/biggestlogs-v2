import axios from "axios";

const API_KEY = process.env.TLOGS_API_KEY;
const BASE_URL = process.env.TLOGS_BASE_URL || "https://api.tlogsmarketplace.com/v1";

const tlogsApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const getServices = async () => {
  try {
    // This is a placeholder for the actual API call
    // Most marketplaces have a 'services' or 'products' endpoint
    const response = await tlogsApi.get("/services");
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    // Mock data for development if API fails
    return [
      { id: "1", name: "Premium Log A", category: "Logs", price: 10, stock: 50 },
      { id: "2", name: "Enterprise Log B", category: "Logs", price: 25, stock: 12 },
      { id: "3", name: "Stealer Log C", category: "Stealers", price: 5, stock: 100 },
      { id: "4", name: "Combo List D", category: "Combos", price: 15, stock: 30 },
    ];
  }
};

export const placeOrder = async (serviceId: string, quantity: number = 1) => {
  try {
    const response = await tlogsApi.post("/orders", {
      service_id: serviceId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

export const getOrderStatus = async (orderId: string) => {
  try {
    const response = await tlogsApi.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order status:", error);
    throw error;
  }
};
