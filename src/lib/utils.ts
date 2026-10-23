import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an amount in INR with Indian comma separators (e.g., 8,00,000)
 */
export function formatINR(amount: number, showSymbol = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? "₹0" : "0";
  }

  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absVal = Math.abs(rounded);

  // Indian number formatting: last 3 digits, then groups of 2 digits
  const str = absVal.toString();
  let result = "";
  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const remaining = str.substring(0, str.length - 3);
    const withCommas = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    result = withCommas + "," + lastThree;
  }

  const prefix = isNegative ? "- " : "";
  return showSymbol ? `${prefix}₹${result}` : `${prefix}${result}`;
}

/**
 * Format large numbers in Indian Lakhs (L) or Crores (Cr)
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount)) return "₹0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  } else if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${abs}`;
}

/**
 * Format standard date to readable string (e.g. 15 Nov 2026)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "Tentative Date";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate countdown days from today
 */
export function getDaysRemaining(targetDateStr: string): {
  days: number;
  isPast: boolean;
  text: string;
} {
  if (!targetDateStr) return { days: 0, isPast: false, text: "Date TBD" };
  try {
    const target = new Date(targetDateStr);
    const today = new Date();
    // Normalize to midnight
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { days: 0, isPast: false, text: "Today!" };
    if (diffDays < 0) return { days: Math.abs(diffDays), isPast: true, text: `${Math.abs(diffDays)} days ago` };
    return { days: diffDays, isPast: false, text: `${diffDays} days to go` };
  } catch {
    return { days: 0, isPast: false, text: "Date TBD" };
  }
}
