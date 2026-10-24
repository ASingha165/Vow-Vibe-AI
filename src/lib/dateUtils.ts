/**
 * Dynamic Date Utilities for Vow & Vibe AI
 * Ensures local timezone-safe, calendar-day date arithmetic without UTC timestamp shift errors.
 */

/**
 * Format a Date object or now into local "YYYY-MM-DD" string.
 * Uses local calendar date components (getFullYear, getMonth, getDate).
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a "YYYY-MM-DD" string into local calendar components.
 * Returns null if the format is invalid or represents an impossible calendar date.
 */
export function parseLocalDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Validate days in month (handling leap years)
  const maxDays = getDaysInMonth(year, month);
  if (day > maxDays) return null;

  return { year, month, day };
}

/**
 * Return number of days in a given month and year (1-based month: 1 = Jan, 12 = Dec).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Timezone-safe calendar day difference: (dateStrA - dateStrB) in calendar days.
 * Both dates are converted to UTC calendar midnights so daylight saving time (DST)
 * or timezone offsets cannot skew the day count.
 */
export function diffCalendarDays(dateStrA: string, dateStrB: string): number {
  const parsedA = parseLocalDate(dateStrA);
  const parsedB = parseLocalDate(dateStrB);

  if (!parsedA || !parsedB) return 0;

  const utcA = Date.UTC(parsedA.year, parsedA.month - 1, parsedA.day);
  const utcB = Date.UTC(parsedB.year, parsedB.month - 1, parsedB.day);

  return Math.round((utcA - utcB) / (1000 * 60 * 60 * 24));
}

/**
 * Timezone-safe addition or subtraction of calendar days to a "YYYY-MM-DD" date string.
 * Uses local noon (12:00:00) to ensure Daylight Saving Time shifts cannot cross midnight.
 */
export function addDaysToLocalDate(dateStr: string, days: number): string {
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return dateStr;

  const date = new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0);
  date.setDate(date.getDate() + days);

  return getLocalDateString(date);
}

/**
 * Format a canonical "YYYY-MM-DD" date string into "DD/MM/YYYY" display format.
 * Pure calendar extraction without UTC timezone shifts.
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr || typeof dateStr !== "string") return "";
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return "";
  const day = String(parsed.day).padStart(2, "0");
  const month = String(parsed.month).padStart(2, "0");
  const year = parsed.year;
  return `${day}/${month}/${year}`;
}

/**
 * Parse a "DD/MM/YYYY" or "DD-MM-YYYY" display string into canonical "YYYY-MM-DD".
 * Returns null if format is invalid or represents an impossible calendar date.
 */
export function parseDateDisplay(displayStr: string): string | null {
  if (!displayStr || typeof displayStr !== "string") return null;
  const match = displayStr.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const maxDays = getDaysInMonth(year, month);
  if (day > maxDays) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Check if a date string is strictly before today's local calendar date.
 */
export function isDateBeforeToday(dateStr: string, todayStr: string = getLocalDateString()): boolean {
  return diffCalendarDays(dateStr, todayStr) < 0;
}

/**
 * Check if a date string is selectable (valid format and today or future).
 */
export function isDateSelectable(dateStr: string, todayStr: string = getLocalDateString()): boolean {
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return false;
  return diffCalendarDays(dateStr, todayStr) >= 0;
}

/**
 * Check whether month navigation can move to the previous month.
 * Disallow navigating entirely before the current calendar month.
 * (1-based month: 1 = Jan, 12 = Dec)
 */
export function canNavigateToPreviousMonth(
  viewYear: number,
  viewMonth: number,
  currentYear: number,
  currentMonth: number
): boolean {
  if (viewYear < currentYear) return false;
  if (viewYear === currentYear && viewMonth <= currentMonth) return false;
  return true;
}

/**
 * Validate an event date according to the wizard rules.
 */
export function validateEventDate(
  dateStr: string | undefined | null,
  isTentative: boolean = false,
  todayStr: string = getLocalDateString()
): { valid: boolean; error?: string } {
  if (isTentative) {
    return { valid: true };
  }

  if (!dateStr || !dateStr.trim()) {
    return {
      valid: false,
      error: "Please select an event date or mark it as tentative.",
    };
  }

  const parsed = parseLocalDate(dateStr);
  if (!parsed) {
    return {
      valid: false,
      error: "Invalid date format. Please select a valid calendar date.",
    };
  }

  if (diffCalendarDays(dateStr, todayStr) < 0) {
    return {
      valid: false,
      error: "Event date cannot be in the past. Please choose today or a future date.",
    };
  }

  return { valid: true };
}

/**
 * Calculate countdown information in calendar days relative to today.
 * Follows exact requirements:
 * - Future event: "X days to go" (or "1 day to go")
 * - Event today: "Today"
 * - Past event: "Event completed"
 * - Never negative countdown numbers.
 */
export function getDaysRemaining(
  targetDateStr: string,
  todayStr: string = getLocalDateString()
): {
  days: number;
  isPast: boolean;
  isToday: boolean;
  text: string;
} {
  if (!targetDateStr) {
    return { days: 0, isPast: false, isToday: false, text: "Date TBD" };
  }

  const parsed = parseLocalDate(targetDateStr);
  if (!parsed) {
    return { days: 0, isPast: false, isToday: false, text: "Date TBD" };
  }

  const diffDays = diffCalendarDays(targetDateStr, todayStr);

  if (diffDays === 0) {
    return { days: 0, isPast: false, isToday: true, text: "Today" };
  }

  if (diffDays < 0) {
    return {
      days: 0, // Never display negative countdown as if upcoming
      isPast: true,
      isToday: false,
      text: "Event completed",
    };
  }

  return {
    days: diffDays,
    isPast: false,
    isToday: false,
    text: `${diffDays} ${diffDays === 1 ? "day" : "days"} to go`,
  };
}

/**
 * Calculate milliseconds until the next local midnight plus a small buffer.
 */
export function getTimeUntilNextMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 100);
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
}

/**
 * Calendar day item for rendering interactive calendar grids.
 */
export interface CalendarGridDay {
  dateStr: string;
  dayNumber: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

/**
 * Generate 35 or 42 calendar grid cells for a given month and year (1-based month).
 */
export function getCalendarGrid(
  viewYear: number,
  viewMonth: number,
  selectedDateStr: string = "",
  todayStr: string = getLocalDateString()
): CalendarGridDay[] {
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);

  const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
  const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const grid: CalendarGridDay[] = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    const isPast = diffCalendarDays(dateStr, todayStr) < 0;
    grid.push({
      dateStr,
      dayNumber,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isPast,
      isSelected: dateStr === selectedDateStr,
      isDisabled: isPast,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isPast = diffCalendarDays(dateStr, todayStr) < 0;
    grid.push({
      dateStr,
      dayNumber: day,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isPast,
      isSelected: dateStr === selectedDateStr,
      isDisabled: isPast,
    });
  }

  // Next month leading days to complete grid rows
  const remainingCells = (7 - (grid.length % 7)) % 7;
  const nextMonth = viewMonth === 12 ? 1 : viewMonth + 1;
  const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;

  for (let day = 1; day <= remainingCells; day++) {
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isPast = diffCalendarDays(dateStr, todayStr) < 0;
    grid.push({
      dateStr,
      dayNumber: day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isPast,
      isSelected: dateStr === selectedDateStr,
      isDisabled: isPast,
    });
  }

  return grid;
}
