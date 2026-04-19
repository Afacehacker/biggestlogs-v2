import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return "₦" + Number(price).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function calculateMarkup(basePrice: number, markupPercentage: number = 500) {
  return basePrice * (markupPercentage / 100);
}
