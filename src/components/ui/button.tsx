import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "rose" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";

    const variants = {
      primary:
        "bg-[#3B1242] text-white hover:bg-[#2C0A33] shadow-md hover:shadow-lg focus:ring-[#3B1242]",
      secondary:
        "bg-[#FAF0F3] text-[#3B1242] hover:bg-[#F5E1E8] border border-[#EADBDF] focus:ring-[#D95B72]",
      outline:
        "border border-[#E5D5B5] bg-white text-[#22092C] hover:bg-[#FAF8F5] hover:border-[#C5A059] focus:ring-[#C5A059]",
      ghost:
        "text-[#3B1242] hover:bg-[#F5E1E8]/50 focus:ring-[#3B1242]",
      gold:
        "bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B88E3E] text-white hover:brightness-105 shadow-md focus:ring-[#C5A059]",
      rose:
        "bg-[#D95B72] text-white hover:bg-[#C8465F] shadow-md focus:ring-[#D95B72]",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
