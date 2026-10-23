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
    <header className="sticky top-0 z-40 w-full vibe-glass transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B1242] to-[#592461] text-[#E5D5B5] shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-[#22092C]">
                Vow &amp; Vibe <span className="text-[#C5A059] font-sans text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#FAF4E6] ml-1">AI</span>
              </span>
              <p className="hidden md:block text-[10px] text-[#5E4B66] tracking-wider uppercase">
                Your Vision. Your Budget. Your Perfect Event.
              </p>
            </div>
          </Link>

          {/* Event Switcher Dropdown (when on dashboard or user has events) */}
          {activeEvent && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 rounded-xl border border-[#E5D5B5] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#22092C] hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-xs"
              >
                <Calendar className="h-3.5 w-3.5 text-[#C5A059]" />
                <span className="max-w-[170px] truncate">{activeEvent.title}</span>
                {activeEvent.isDemo && (
                  <Badge variant="rose" className="text-[9px] py-0 px-1.5">
                    Demo
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 text-[#7A6B80]" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#E5D5B5] bg-white p-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#7A6B80] border-b border-[#FAF0F3]">
                    Your Events ({events.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {events.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleSelectEvent(e.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-[#FAF0F3] transition-colors cursor-pointer"
                      >
                        <div className="truncate mr-2">
                          <p className="font-semibold text-[#22092C] truncate">{e.title}</p>
                          <p className="text-[10px] text-[#7A6B80]">{e.location?.city} • ₹{e.budget?.totalBudget?.toLocaleString("en-IN")}</p>
                        </div>
                        {activeEvent.id === e.id && <Check className="h-4 w-4 text-[#3B1242] shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#FAF0F3] pt-1">
                    <button
                      onClick={handleResetDemo}
                      className="flex w-full items-center space-x-2 rounded-xl px-3 py-2 text-xs text-[#B33951] hover:bg-[#FCEEF1] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Judges Demo Event</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
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
            className="hidden sm:inline-flex items-center space-x-1.5 rounded-xl border border-[#E5D5B5] bg-[#FAF4E6] px-3 py-1.5 text-xs font-semibold text-[#8C6D23] hover:bg-[#F3E7CD] transition-all cursor-pointer shadow-xs"
          >
            <Compass className="h-3.5 w-3.5 text-[#C5A059]" />
            <span>Judge Demo</span>
          </button>

          {pathname !== "/dashboard" && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          )}

          <Link href="/plan">
            <Button variant="primary" size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>Plan My Event</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
