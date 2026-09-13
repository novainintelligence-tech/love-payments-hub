import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

export function stockLabel(stock: number | null, unlimited: boolean) {
  if (unlimited) return "Unlimited";
  const count = Number(stock ?? 0);
  if (count <= 0) return "Out of stock";
  if (count === 1) return "1 in stock";
  return `${count} in stock`;
}
