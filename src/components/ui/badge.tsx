import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "plum" | "gold" | "rose" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#F5EFE6] text-[#3B1242] border-[#E5D5B5]",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    plum: "bg-[#3B1242] text-white border-transparent",
    gold: "bg-[#FAF4E6] text-[#8C6D23] border-[#E5D5B5]",
    rose: "bg-[#FCEEF1] text-[#B33951] border-[#F2C4CE]",
    outline: "bg-transparent text-[#5E4B66] border-[#D9C3CE]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
