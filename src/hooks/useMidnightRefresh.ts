"use client";

import * as React from "react";
import { getLocalDateString, getTimeUntilNextMidnight } from "@/lib/dateUtils";

/**
 * Hook that keeps date-dependent UI synchronized across midnight.
 * Defers reading local time into useEffect to comply with Next.js SSR prerender requirements.
 * Automatically triggers a state update when the local calendar day transitions,
 * without polling intervals or full page reloads.
 * Cleans up timer when unmounted.
 */
export function useMidnightRefresh(): string {
  const [todayStr, setTodayStr] = React.useState<string>("");

  React.useEffect(() => {
    setTodayStr(getLocalDateString());

    let timeoutId: NodeJS.Timeout | null = null;

    const scheduleRefresh = () => {
      const msToMidnight = getTimeUntilNextMidnight();
      timeoutId = setTimeout(() => {
        const nextDay = getLocalDateString();
        setTodayStr(nextDay);
        // Schedule next midnight
        scheduleRefresh();
      }, msToMidnight);
    };

    scheduleRefresh();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return todayStr;
}
