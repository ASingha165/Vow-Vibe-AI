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
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { StorageService } from "@/services/storageService";
import { DEMO_BENGALI_WEDDING } from "@/data/demoEvent";

export default function LandingPage() {
  const router = useRouter();

  // Interactive Mini Budget Calculator for Landing Page
  const [miniBudget, setMiniBudget] = React.useState(600000);
  const [miniGuests, setMiniGuests] = React.useState(200);

  const miniVenue = Math.round(miniBudget * 0.22);
  const miniCatering = Math.round(miniBudget * 0.28);
  const miniDecor = Math.round(miniBudget * 0.15);
  const miniPhoto = Math.round(miniBudget * 0.11);
  const miniReserve = Math.round(miniBudget * 0.1);
  const perGuest = Math.round(miniCatering / Math.max(1, miniGuests));

  const handleLaunchDemo = () => {
    StorageService.setActiveEventId(DEMO_BENGALI_WEDDING.id);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 vibe-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 rounded-full border border-[#E5D5B5] bg-[#FAF4E6] px-3.5 py-1 text-xs font-semibold text-[#8C6D23] shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>PromptWars Virtual — Challenge 5 Winner Showcase</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E0724] leading-[1.12]">
                Every Celebration Deserves a <span className="text-[#3B1242] underline decoration-[#D4AF37]/60 underline-offset-8">Perfect Plan</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#5E4B66] max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Turn your dream wedding, anniversary, milestone birthday, or cultural festival into a flawless reality.
                Deterministic budget allocations, intelligent milestone timelines, vendor quote analysis, and Gemini AI recommendations — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/plan" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl bg-[#3B1242]">
                    <span>Plan My Event</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  onClick={handleLaunchDemo}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto gap-2 border-[#E5D5B5]"
                >
                  <Compass className="h-4 w-4 text-[#C5A059]" />
                  <span>Inspect Bengali Wedding Demo</span>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-[#7A6B80]">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Deterministic Math (No LLM Hallucinations)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>INR Indian Numbering &amp; Regional Customs</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Works 100% Offline with Fallback Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card with Live Interactive Simulator */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glow */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#D95B72]/20 to-[#C5A059]/30 blur-lg opacity-70" />

                <Card className="relative bg-white/95 backdrop-blur-md border border-[#E5D5B5] shadow-2xl p-6 rounded-3xl space-y-5">
                  <div className="flex items-center justify-between border-b border-[#FAF0F3] pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B1242] text-[#E5D5B5]">
                        <Calculator className="h-4 w-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-bold text-[#22092C]">Instant Budget Preview</h3>
                        <p className="text-[11px] text-[#7A6B80]">Interactive Deterministic Allocation</p>
                      </div>
                    </div>
                    <Badge variant="gold" className="text-[10px]">
                      Live Formula
                    </Badge>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#5E4B66]">Total Budget</span>
                        <span className="text-[#3B1242] font-bold">{formatINR(miniBudget)}</span>
                      </div>
                      <input
                        type="range"
                        min={100000}
                        max={3000000}
                        step={50000}
                        value={miniBudget}
                        onChange={(e) => setMiniBudget(Number(e.target.value))}
                        className="w-full accent-[#3B1242] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#5E4B66]">Expected Guests</span>
                        <span className="text-[#3B1242] font-bold">{miniGuests} attendees</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={1000}
                        step={25}
                        value={miniGuests}
                        onChange={(e) => setMiniGuests(Number(e.target.value))}
                        className="w-full accent-[#C5A059] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Categorized Breakdown Bars */}
                  <div className="rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#E5D5B5]/60 space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5E4B66] flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#D48B38]" /> Catering &amp; Feast:
                      </span>
                      <span className="font-semibold text-[#22092C]">{formatINR(miniCatering)} (~₹{perGuest}/plate)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5E4B66] flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#8B263E]" /> Venue &amp; Lawns:
                      </span>
                      <span className="font-semibold text-[#22092C]">{formatINR(miniVenue)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5E4B66] flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#C59B27]" /> Floral &amp; Decor:
                      </span>
                      <span className="font-semibold text-[#22092C]">{formatINR(miniDecor)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5E4B66] flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#2E6F74]" /> Photography &amp; Film:
                      </span>
                      <span className="font-semibold text-[#22092C]">{formatINR(miniPhoto)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1.5 border-t border-[#EADBDF]">
                      <span className="text-[#B33951] font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" /> Emergency Reserve (10%):
                      </span>
                      <span className="font-bold text-[#B33951]">{formatINR(miniReserve)}</span>
                    </div>
                  </div>

                  <Link href="/plan" className="block w-full">
                    <Button variant="gold" size="sm" className="w-full gap-1.5">
                      <span>Create Customized Full Plan</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Explanation */}
      <section className="py-16 bg-white border-y border-[#E5D5B5]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-[#22092C]">
              How Vow &amp; Vibe AI Orchestrates Your Event
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5E4B66]">
              A structured, stress-free pathway from initial vision to grand day-of execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5D5B5]/60 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3B1242] text-white font-serif text-xl font-bold mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-[#22092C]">Tell Us Your Vision</h3>
              <p className="mt-2 text-sm text-[#5E4B66] leading-relaxed">
                Specify your event type, date, city, expected guest headcount, budget ceiling, and cultural nuances in our intuitive 5-step wizard.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5D5B5]/60 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C5A059] text-white font-serif text-xl font-bold mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-[#22092C]">Let AI Organize The Details</h3>
              <p className="mt-2 text-sm text-[#5E4B66] leading-relaxed">
                Our hybrid engine generates balanced budget allocations, milestone countdown checklists, vendor criteria, and risk mitigations.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5D5B5]/60 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D95B72] text-white font-serif text-xl font-bold mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-[#22092C]">Refine, Collaborate &amp; Celebrate</h3>
              <p className="mt-2 text-sm text-[#5E4B66] leading-relaxed">
                Run What-If scenarios, compare real quotes, track expenses, chat with the contextual AI assistant, and export clean print dossiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="plum" className="mb-3">
              Full Spectrum Intelligence
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#22092C]">
              Built for Real Event Logistics, Not Just Mockups
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5E4B66]">
              Every metric, calculation, and timeline is grounded in deterministic algorithms and verified event planning logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:border-[#C5A059] transition-all">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF0F3] text-[#3B1242] mb-2">
                  <PieChart className="h-5 w-5 text-[#D95B72]" />
                </div>
                <CardTitle>Deterministic Smart Budget</CardTitle>
                <CardDescription>
                  Exact penny/rupee reconciliation across categories with configurable emergency contingency reserves and over-budget alerts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[#C5A059] transition-all">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF4E6] text-[#8C6D23] mb-2">
                  <Sliders className="h-5 w-5 text-[#C5A059]" />
                </div>
                <CardTitle>"What If?" Simulation Lab</CardTitle>
                <CardDescription>
                  Experiment with guest swings, catering upgrades, and venue tier shifts with live per-attendee delta recalculations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[#C5A059] transition-all">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF0F3] text-[#3B1242] mb-2">
                  <Calendar className="h-5 w-5 text-[#3B1242]" />
                </div>
                <CardTitle>Milestone Task Timeline</CardTitle>
                <CardDescription>
                  Intelligent due date sequencing tied to your event lagna. Overdue alerts, status filters, and completion rings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[#C5A059] transition-all">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF4E6] text-[#8C6D23] mb-2">
                  <DollarSign className="h-5 w-5 text-[#C5A059]" />
                </div>
                <CardTitle>Vendor Quote Intelligence</CardTitle>
                <CardDescription>
                  Compare side-by-side vendor quotes, evaluate budget compatibility, review negotiation tips, and essential checklists.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[#C5A059] transition-all">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF0F3] text-[#3B1242] mb-2">
                  <Heart className="h-5 w-5 text-[#D95B72]" />
                </div>
                <CardTitle>Cultural Customization</CardTitle>
                <CardDescription>
                  Dedicated support for Bengali, South Indian, Punjabi, and multicultural traditions with regional cuisine and ceremonial tips.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-[#C5A059] transition-all">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF4E6] text-[#8C6D23] mb-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle>Risk &amp; Contingency Guard</CardTitle>
                <CardDescription>
                  Proactive scenarios for rain showers, traffic bottlenecks, and caterer buffers with explicit contingency budget allocations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Showcase Callout: Kolkata Bengali Wedding */}
      <section className="py-16 bg-gradient-to-br from-[#240B27] via-[#38123C] to-[#1E0724] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <Badge variant="gold" className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40">
                Live Interactive Showcase for Judges
              </Badge>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                A Bengali Wedding Celebration in Kolkata
              </h3>
              <p className="text-sm sm:text-base text-[#D9C3CE] max-w-2xl leading-relaxed">
                Experience the application with full real-world demonstration data: ₹8,00,000 budget, 300 guests, authentic ceremonies (Gaye Holud, Shubho Drishti, Saat Paake Ghaura), sample Kolkata vendors, 11 preparation tasks, and risk scenarios.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Button
                onClick={handleLaunchDemo}
                variant="gold"
                size="lg"
                className="gap-2 shadow-xl"
              >
                <Compass className="h-5 w-5" />
                <span>Launch Interactive Demo</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
