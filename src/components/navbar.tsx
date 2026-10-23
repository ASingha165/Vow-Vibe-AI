"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, PlusCircle, Compass, Calendar, RotateCcw, ChevronDown, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { StorageService } from "@/services/storageService";
import { EventPlan } from "@/types/event";
import { DEMO_BENGALI_WEDDING } from "@/data/demoEvent";
import { useToast } from "./ui/toast";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [events, setEvents] = React.useState<EventPlan[]>([]);
  const [activeEvent, setActiveEvent] = React.useState<EventPlan | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    const all = StorageService.getAllEvents();
    setEvents(all);
    const curr = StorageService.getCurrentEvent();
    setActiveEvent(curr);
  }, [pathname]);

  const handleSelectEvent = (id: string) => {
    StorageService.setActiveEventId(id);
    const selected = StorageService.getEventById(id);
    setActiveEvent(selected);
    setDropdownOpen(false);
    toast({
      type: "info",
      title: "Switched Event",
      message: `Now viewing: ${selected?.title}`,
    });
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    } else {
      window.location.reload();
    }
  };

  const handleResetDemo = () => {
    const fresh = StorageService.resetDemoEvent();
    setActiveEvent(fresh);
    setDropdownOpen(false);
    toast({
      type: "success",
      title: "Demo Reset to Pristine State",
      message: "Bengali Wedding (Kolkata, ₹8,00,000) demo restored.",
    });
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/85 backdrop-blur-xl border-b border-primary-container/10 shadow-[0_1px_8px_rgba(51,33,61,0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Active Context */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-secondary-container shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-secondary-container" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-lg sm:text-xl text-primary-container truncate leading-none">
                Vow &amp; Vibe <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">AI</span>
              </span>
              <span className="hidden sm:inline-block font-label-sm text-[10px] text-on-surface-variant/70 tracking-wider">
                Warm Editorial Elegance
              </span>
            </div>
          </Link>

          {/* Event Switcher Dropdown */}
          {activeEvent && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-full text-secondary hover:bg-secondary-container/40 transition-colors cursor-pointer text-left"
              >
                <Calendar className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span className="font-label-sm text-xs tracking-wide truncate max-w-[140px] sm:max-w-[200px] text-primary-container font-medium">
                  {activeEvent.title}
                </span>
                {activeEvent.isDemo && (
                  <span className="font-label-sm text-[9px] px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                    Demo
                  </span>
                )}
                <ChevronDown className="h-3 w-3 text-secondary shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#35213D]/10 bg-surface-container-lowest p-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-surface-container">
                    Your Events ({events.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {events.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleSelectEvent(e.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <div className="truncate mr-2">
                          <p className="font-semibold text-primary-container truncate">{e.title}</p>
                          <p className="text-[10px] text-on-surface-variant">{e.location?.city} • ₹{e.budget?.totalBudget?.toLocaleString("en-IN")}</p>
                        </div>
                        {activeEvent.id === e.id && <Check className="h-4 w-4 text-primary-container shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-surface-container pt-1">
                    <button
                      onClick={handleResetDemo}
                      className="flex w-full items-center space-x-2 rounded-xl px-3 py-2 text-xs text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-error" />
                      <span>Reset Judges Demo Event</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation CTAs & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Demo Event Access */}
          <button
            onClick={() => {
              StorageService.setActiveEventId(DEMO_BENGALI_WEDDING.id);
              toast({
                type: "info",
                title: "Opening Kolkata Demo Event",
                message: "A Bengali Wedding Celebration (₹8,00,000, 300 guests)",
              });
              router.push("/dashboard");
            }}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary-container/40 px-3 py-1 text-xs font-semibold text-on-secondary-container hover:bg-secondary-container transition-all cursor-pointer shadow-xs"
          >
            <Compass className="h-3.5 w-3.5 text-secondary" />
            <span>Judge Demo</span>
          </button>

          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center px-3 py-1.5 rounded-xl font-label-md text-xs text-on-surface-variant hover:text-primary-container hover:bg-surface-container transition-colors"
            >
              Dashboard
            </Link>
          )}

          <Link href="/plan">
            <button className="h-9 px-3.5 rounded-xl bg-primary-container text-surface hover:opacity-95 active:scale-95 transition-all font-label-md text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer">
              <PlusCircle className="h-3.5 w-3.5 text-secondary-fixed" />
              <span>Plan Event</span>
            </button>
          </Link>

          {/* User Profile Pill Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-secondary/40 shrink-0">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoNDZx_LmrBtI8JZ9pNZRlbR-EeNhr-2so44KjaeF4K0Fbsxix8OxzGBXbaHzkIJaUiL7Yk5kELHFmNqX9xhW_VIe0zn8MjgCBlj-4oCpDEPSxULNl9yadfNv73jW8eBZEGuXOYiNKFp1fGHPbRQEc9huolqfNdztrXkvVzeqTFQeBHaPSPeLhHFdnFMj4xGLQJFwNqCkjhf_3SyBIiaF6JCO__g62lTg4ZZuDZOJlI8rBirhtwfG8KA"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
