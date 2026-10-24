import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseLocalDate, getDaysRemaining as getDaysRemainingCore, getLocalDateString } from "./dateUtils";

export {
  getLocalDateString,
  parseLocalDate,
  diffCalendarDays,
  addDaysToLocalDate,
  isDateBeforeToday,
  isDateSelectable,
  canNavigateToPreviousMonth,
  validateEventDate,
  getTimeUntilNextMidnight,
  getCalendarGrid,
  formatDateDisplay,
  parseDateDisplay,
} from "./dateUtils";

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
 * Uses timezone-safe calendar components.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "Tentative Date";
  try {
    const parsed = parseLocalDate(dateStr);
    if (parsed) {
      const localDate = new Date(parsed.year, parsed.month - 1, parsed.day);
      return localDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    const fallback = new Date(dateStr);
    if (isNaN(fallback.getTime())) return dateStr;
    return fallback.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate countdown days from today using local calendar day math.
 */
export function getDaysRemaining(targetDateStr: string, todayStr?: string) {
  return getDaysRemainingCore(targetDateStr, todayStr || getLocalDateString());
}
