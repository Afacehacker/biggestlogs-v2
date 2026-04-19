export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getApiHeaders = (userId?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (userId) {
    headers["x-user-id"] = userId;
  }
  
  return headers;
};
