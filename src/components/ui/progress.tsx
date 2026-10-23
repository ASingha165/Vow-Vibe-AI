import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  variant?: "plum" | "gold" | "rose" | "emerald";
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  variant = "plum",
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    plum: "bg-[#3B1242]",
    gold: "bg-gradient-to-r from-[#C5A059] to-[#D4AF37]",
    rose: "bg-[#D95B72]",
    emerald: "bg-emerald-600",
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-[#5E4B66]">
          <span>Progress</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#FAF0F3] border border-[#EADBDF]/50">
        <div
          className={cn("h-full transition-all duration-500 ease-out rounded-full", variants[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
