"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Calculator,
  Calendar,
  Users,
  ShieldCheck,
  Compass,
  CheckCircle2,
  PieChart,
  Sliders,
  DollarSign,
  Heart,
  ChevronRight,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { StorageService } from "@/services/storageService";
import { DEMO_BENGALI_WEDDING } from "@/data/demoEvent";

export default function LandingPage() {
  const router = useRouter();

  // Interactive Mini Budget Calculator for Landing Page
  const [miniBudget, setMiniBudget] = React.useState(800000);
  const [miniGuests, setMiniGuests] = React.useState(300);
  const [simulated, setSimulated] = React.useState(false);

  const miniVenue = Math.round(miniBudget * 0.23);
  const miniCatering = Math.round(miniBudget * 0.30);
  const miniDecor = Math.round(miniBudget * 0.13);
  const miniPhoto = Math.round(miniBudget * 0.12);
  const miniReserve = Math.round(miniBudget * 0.10);
  const perGuest = Math.round(miniCatering / Math.max(1, miniGuests));

  const handleLaunchDemo = () => {
    StorageService.setActiveEventId(DEMO_BENGALI_WEDDING.id);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface">
      <Navbar />

      <main className="flex-1 flex flex-col relative w-full bg-surface">
        {/* Stitch Editorial Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex flex-col gap-6">
          <div className="flex items-center gap-2 self-start px-3.5 py-1.5 bg-surface-container-high rounded-full shadow-xs">
            <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Your Vision. Your Budget. Your Perfect Event.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h1 className="font-headline-lg-mobile sm:font-display-lg text-primary tracking-tight leading-[1.12]">
                Every Celebration Deserves a <span className="italic font-normal text-secondary font-serif">Perfect Plan.</span>
              </h1>
              <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                From your first idea to the final celebration, let AI simplify your event planning, organize your budget,
                and bring your vision to life with deterministic precision and cultural reverence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/plan" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-primary-container text-on-primary rounded-xl font-label-lg text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-secondary-container text-base">auto_awesome</span>
                    <span>Plan My Event</span>
                  </button>
                </Link>

                <button
                  onClick={handleLaunchDemo}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-surface-container-high text-primary rounded-xl font-label-lg text-sm hover:bg-secondary-container/40 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Compass className="h-4 w-4 text-secondary" />
                  <span>Explore Bengali Wedding Demo</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>

              {/* Trust & Principle Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>Deterministic Math (No LLM Hallucinations)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>INR Indian Numbering &amp; Cultural Customization</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>Works 100% Offline with Fallback Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Visual Banner Card */}
            <div className="lg:col-span-5">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-surface-container border border-primary-container/10">
                <div
                  className="bg-cover bg-center w-full h-80 sm:h-96 flex flex-col justify-between p-4 sm:p-6 relative"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAnKRpk_QmtVWk9Pwwwo2GFvULmIu4zwciDcpZ68nFb0hGb6bg-FHwkEcLL7ySnal4AqOFVAclDFeAtqJGuuUvcxICuk6MgYWjHLlkpZ6OAa7rg7REKE0B2cMN84SHCR2tbUlQSbyZMsspQdaa-khtEToY_UbqndQ3sa4TvcxVChCEWSzkABFsOaIK6i3mh9zvS6P51ADBlJn5-dXbxAc20b5mgLLU7e3NCcIW2OKJzbadtgEzW9Eoow')`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent pointer-events-none" />

                  {/* Live AI Badge chip */}
                  <div className="relative z-10 self-end flex items-center gap-2 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md">
                    <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="font-label-sm text-xs text-primary font-semibold">Live AI Optimization</span>
                  </div>

                  {/* Floating Budget Savings Metric Card */}
                  <div className="relative z-10 bg-surface-container-lowest/95 backdrop-blur-md p-3.5 sm:p-4 rounded-xl shadow-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                        <span className="material-symbols-outlined text-xl">savings</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                          Smart Spend AI
                        </span>
                        <span className="font-title-md text-sm sm:text-base text-primary font-bold">
                          Estimated budget saved: ₹42,500
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stitch Curated Occasions Carousel */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              Curated Occasions
            </span>
            <span className="font-label-sm text-xs text-secondary font-medium">Any scale &amp; vibe</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar snap-x">
            <div className="snap-start shrink-0 px-4 py-2 bg-primary text-on-primary rounded-full flex items-center gap-2 shadow-sm font-label-md text-xs">
              <span className="material-symbols-outlined text-sm text-secondary-container">favorite</span>
              <span>Wedding</span>
            </div>
            <div className="snap-start shrink-0 px-4 py-2 bg-surface-container-high text-on-surface rounded-full flex items-center gap-2 font-label-md text-xs">
              <span className="material-symbols-outlined text-sm text-secondary">cake</span>
              <span>Birthday</span>
            </div>
            <div className="snap-start shrink-0 px-4 py-2 bg-surface-container-high text-on-surface rounded-full flex items-center gap-2 font-label-md text-xs">
              <span className="material-symbols-outlined text-sm text-secondary">celebration</span>
              <span>Anniversary</span>
            </div>
            <div className="snap-start shrink-0 px-4 py-2 bg-surface-container-high text-on-surface rounded-full flex items-center gap-2 font-label-md text-xs">
              <span className="material-symbols-outlined text-sm text-secondary">groups</span>
              <span>Community Event</span>
            </div>
            <div className="snap-start shrink-0 px-4 py-2 bg-surface-container-high text-on-surface rounded-full flex items-center gap-2 font-label-md text-xs">
              <span className="material-symbols-outlined text-sm text-secondary">school</span>
              <span>College Festival</span>
            </div>
            <div className="snap-start shrink-0 px-4 py-2 bg-surface-container-high text-on-surface rounded-full flex items-center gap-2 font-label-md text-xs">
              <span className="material-symbols-outlined text-sm text-secondary">local_bar</span>
              <span>Gala</span>
            </div>
          </div>
        </section>

        {/* Stitch 3-Step Process (Effortless Method) */}
        <section className="w-full py-12 bg-surface-container-low my-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="flex flex-col gap-1 max-w-2xl">
              <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                Effortless Method
              </span>
              <h2 className="font-headline-md text-2xl sm:text-3xl text-primary font-semibold">
                How Vow &amp; Vibe Orchestrates Magic
              </h2>
              <p className="font-body-md text-sm sm:text-base text-on-surface-variant">
                Three intelligent movements to replace spreadsheets, stress, and guesswork.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-3.5 border border-primary-container/8">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-title-md font-bold text-sm">
                    01
                  </div>
                  <span className="material-symbols-outlined text-secondary">edit_note</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-title-md text-base text-primary font-semibold">Describe Your Vision</h3>
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                    Share your dream aesthetic, target guest count, celebration traditions, and total comfort budget.
                  </p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl flex items-center gap-2 mt-auto">
                  <span className="material-symbols-outlined text-secondary text-sm">chat_bubble</span>
                  <span className="font-body-sm text-xs text-on-surface italic">
                    "Sundowner sangeet with warm fairy lights for 250 guests"
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-3.5 border border-primary-container/8">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-title-md font-bold text-sm">
                    02
                  </div>
                  <span className="material-symbols-outlined text-secondary">model_training</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-title-md text-base text-primary font-semibold">Generate Your Personalized Plan</h3>
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                    AI allocates budget fractions across tiers, maps a day-of schedule, and embeds contingency safeguards.
                  </p>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-low rounded-xl mt-auto">
                  <span className="font-label-sm text-xs text-on-surface-variant">Contingency Buffer</span>
                  <span className="font-label-sm text-xs font-semibold text-secondary">Auto-allocated (10%)</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-3.5 border border-primary-container/8">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-title-md font-bold text-sm">
                    03
                  </div>
                  <span className="material-symbols-outlined text-secondary">task_alt</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-title-md text-base text-primary font-semibold">Organize Every Detail</h3>
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                    Compare verified vendor quotes, manage real-time tasks, and coordinate contracts in a unified flow.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-xs mt-auto">
                  <span className="material-symbols-outlined text-base text-secondary">sync</span>
                  <span>Live sync with planners, family, and vendors</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stitch Interactive Budget Preview & Simulation Widget */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                Real-time Simulation
              </span>
              <h2 className="font-headline-sm text-2xl text-primary font-semibold">Sample Celebration Plan</h2>
            </div>
            <div className="self-start sm:self-auto bg-surface-container-high px-3 py-1 rounded-full text-primary font-label-sm text-xs">
              Interactive Live Demo
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-md border border-primary-container/8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Interactive Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-3 bg-surface-container-low p-3.5 rounded-xl">
                <div>
                  <span className="font-label-sm text-xs text-on-surface-variant">Planned Budget</span>
                  <p className="font-headline-sm text-xl text-primary font-bold">{formatINR(miniBudget)}</p>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-xs text-on-surface-variant">AI Optimized Spend</span>
                  <p className="font-title-lg text-lg text-secondary font-bold">
                    {formatINR(Math.round(miniBudget * 0.947))}
                  </p>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-on-surface-variant">Adjust Budget</span>
                    <span className="text-primary font-bold">{formatINR(miniBudget)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={3000000}
                    step={50000}
                    value={miniBudget}
                    onChange={(e) => setMiniBudget(Number(e.target.value))}
                    className="w-full accent-primary-container cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-on-surface-variant">Expected Guests</span>
                    <span className="text-primary font-bold">{miniGuests} attendees</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={25}
                    value={miniGuests}
                    onChange={(e) => setMiniGuests(Number(e.target.value))}
                    className="w-full accent-secondary cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Simulation Bar */}
              <div
                className={`p-3.5 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  simulated ? "bg-secondary-container" : "bg-surface-container"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">psychology</span>
                  <span className="font-body-sm text-xs text-on-surface font-medium">
                    {simulated
                      ? "Adjusted: +₹18,500 absorbed via catering margin"
                      : "Rebalance for 30 unexpected guests?"}
                  </span>
                </div>
                <button
                  onClick={() => setSimulated(!simulated)}
                  className={`px-3 py-1.5 rounded-lg font-label-sm text-xs transition-all cursor-pointer ${
                    simulated
                      ? "bg-primary text-on-primary font-semibold"
                      : "bg-primary-container text-on-primary hover:opacity-90 active:scale-95"
                  }`}
                >
                  {simulated ? "Reset" : "Simulate"}
                </button>
              </div>
            </div>

            {/* Right: Allocation Bars */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              <span className="font-title-md text-sm font-semibold text-primary">
                Category Allocations (Penny-Reconciled)
              </span>

              <div className="flex flex-col gap-3">
                {/* Venue & Catering */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-md text-xs">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container inline-block" />
                      Catering &amp; Feast (30%)
                    </span>
                    <span className="font-semibold text-primary">{formatINR(miniCatering)} (~₹{perGuest}/plate)</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary-container h-full rounded-full" style={{ width: "30%" }} />
                  </div>
                </div>

                {/* Venue */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-md text-xs">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" />
                      Venue &amp; Banquets (23%)
                    </span>
                    <span className="font-semibold text-primary">{formatINR(miniVenue)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: "23%" }} />
                  </div>
                </div>

                {/* Decor */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-md text-xs">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container inline-block" />
                      Floral Styling &amp; Decor (13%)
                    </span>
                    <span className="font-semibold text-primary">{formatINR(miniDecor)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className="bg-tertiary-container h-full rounded-full" style={{ width: "13%" }} />
                  </div>
                </div>

                {/* Photo */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-md text-xs">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container inline-block" />
                      Photo &amp; Cinematography (12%)
                    </span>
                    <span className="font-semibold text-primary">{formatINR(miniPhoto)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className="bg-on-tertiary-container h-full rounded-full" style={{ width: "12%" }} />
                  </div>
                </div>

                {/* Reserve */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-md text-xs">
                    <span className="text-on-surface flex items-center gap-1.5 font-semibold text-secondary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Emergency Reserve Buffer (10%)
                    </span>
                    <span className="font-semibold text-secondary">{formatINR(miniReserve)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className="bg-secondary-fixed-dim h-full rounded-full" style={{ width: "10%" }} />
                  </div>
                </div>
              </div>

              <Link href="/plan" className="pt-2">
                <button className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <span>Create Custom Full Plan with This Allocation</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stitch Bento-like Feature Grid */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
              Capabilities
            </span>
            <h2 className="font-headline-sm text-2xl sm:text-3xl text-primary font-semibold">
              Precision Engineering for Special Moments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col gap-3 border border-primary-container/8">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-title-md text-sm text-primary font-semibold">Smart Budget Allocation</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Dynamic distribution model that absorbs price shocks and maintains zero unexpected surprises throughout execution.
                </p>
              </div>
              <div className="flex items-center gap-1 text-secondary font-label-sm text-xs font-semibold mt-auto pt-2">
                <span>Continuous margin safety</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col gap-3 border border-primary-container/8">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-secondary">timeline</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-title-md text-sm text-primary font-semibold">Intelligent Milestones &amp; Timeline</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Phase-by-phase countdown with contextual alerts so decor bookings, tastings, and outfit fittings stay in lockstep.
                </p>
              </div>
              <div className="flex items-center gap-1 text-secondary font-label-sm text-xs font-semibold mt-auto pt-2">
                <span>Interactive timeline track</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col gap-3 border border-primary-container/8">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-secondary">verified</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-title-md text-sm text-primary font-semibold">Verified Vendor Intelligence</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Directly benchmark vendor bids against local price indices and parse contractual fine prints automatically.
                </p>
              </div>
              <div className="flex items-center gap-1 text-secondary font-label-sm text-xs font-semibold mt-auto pt-2">
                <span>Contract transparency score</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col gap-3 border border-primary-container/8">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-secondary">assistant</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-title-md text-sm text-primary font-semibold">AI Co-Planner on Demand</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Instant scenario simulations: change weather contingencies, banquet headcounts, or stage lighting within seconds.
                </p>
              </div>
              <div className="flex items-center gap-1 text-secondary font-label-sm text-xs font-semibold mt-auto pt-2">
                <span>24/7 Contextual companion</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stitch Editorial Visual Vignette */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-surface-container-high rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border border-primary-container/10">
            <div
              className="bg-cover bg-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-sm shrink-0"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDk-HvUIdXbHb9UK6XTfB_on6fdwwuxT1Hj1hXXRLHCjEr_0YyhzoQRp_DsIJAk7c2iw-zi_V7VQstLZM13zdoh23-e1vIPf7vKQyPHZpc2JWz0Fsmh_jBVy-WrI1umseg_0aoAvjcb4_liLVUPreXYusUZYvddWs3B-8Cwxs6NU_1Oa-x6g1_n2nfO1OjQNcY7NO6RwCS8s3siqV9Fkq_Y5aYZbUmqaqUKG_DP_QsXEmjR8ReW-HrMfA')`,
              }}
            />
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <span className="font-headline-sm text-xl text-primary font-semibold">Crafted for Serenity</span>
              <span className="font-body-md text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Built for host peace of mind, not complex logistical spreadsheets. Every detail, ritual timing, and rupee accounted for with dignity and warmth.
              </span>
            </div>
          </div>
        </section>

        {/* Stitch Final Call to Action Card */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <div className="w-full bg-primary-container text-on-primary rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col gap-6 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-tertiary-container/30 blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-2 relative z-10 max-w-2xl mx-auto">
              <span className="material-symbols-outlined text-secondary-container text-4xl mx-auto">flare</span>
              <h2 className="font-headline-md sm:font-headline-lg text-2xl sm:text-4xl text-on-primary font-semibold tracking-tight">
                Begin Designing Your Milestone Today
              </h2>
              <p className="font-body-lg text-sm sm:text-base text-on-primary-container/90 leading-relaxed">
                Get complete financial peace of mind, vendor parity, and a dream celebration blueprint in under four minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 pt-2">
              <Link href="/plan" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto py-3.5 px-8 bg-secondary-container text-on-secondary-container rounded-xl font-label-lg text-sm font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>Start Planning Free</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </Link>
              <button
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-surface-container-high/20 text-on-primary hover:bg-surface-container-high/30 font-label-lg text-sm font-semibold transition-all cursor-pointer"
              >
                Inspect Bengali Wedding Demo
              </button>
            </div>

            <span className="font-label-sm text-xs text-on-primary-container/70 relative z-10">
              No credit card required • Tailored in seconds • 100% Deterministic Financial Arithmetic
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
