"use client";

import * as React from "react";
import { Sliders, RefreshCw, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Info } from "lucide-react";
import { EventPlan, WhatIfSimulationInput, WhatIfSimulationResult } from "@/types/event";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { runWhatIfSimulation } from "@/services/budgetEngine";
import { useToast } from "@/components/ui/toast";
import { StorageService } from "@/services/storageService";

interface WhatIfSimulatorProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export function WhatIfSimulator({ event, onUpdateEvent }: WhatIfSimulatorProps) {
  const { toast } = useToast();

  const [input, setInput] = React.useState<WhatIfSimulationInput>({
    guestCount: event.guests.expectedCount,
    totalBudget: event.budget.totalBudget,
    venueTier: "standard",
    cateringTier: "standard_buffet",
    decorationTier: "ambient_elegant",
  });

  // Run simulation reactively
  const simulationResult: WhatIfSimulationResult = React.useMemo(() => {
    return runWhatIfSimulation(event.budget.totalBudget, event.guests.expectedCount, input);
  }, [event.budget.totalBudget, event.guests.expectedCount, input]);

  const handleReset = () => {
    setInput({
      guestCount: event.guests.expectedCount,
      totalBudget: event.budget.totalBudget,
      venueTier: "standard",
      cateringTier: "standard_buffet",
      decorationTier: "ambient_elegant",
    });
    toast({ type: "info", title: "Simulator Reset", message: "Restored to baseline plan parameters." });
  };

  const handleApplyToPlan = () => {
    const updated: EventPlan = {
      ...event,
      guests: {
        ...event.guests,
        expectedCount: input.guestCount,
      },
      budget: {
        ...event.budget,
        totalBudget: input.totalBudget,
      },
    };
    onUpdateEvent(updated);
    StorageService.saveEvent(updated);
    toast({
      type: "success",
      title: "Simulation Applied",
      message: `Updated event with ${input.guestCount} guests and ${formatINR(input.totalBudget)} budget ceiling.`,
    });
  };

  const isOverBudget = simulationResult.costDelta > 0;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <Card className="border border-[#E5D5B5] shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF0F3] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-[#C5A059]" />
              <CardTitle>&ldquo;What If?&rdquo; Financial Simulator</CardTitle>
            </div>
            <CardDescription>
              Test different guest counts, catering tiers, and venue specifications before committing funds.
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleApplyToPlan} className="gap-1.5 text-xs">
              <span>Apply to Event Plan</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Simulation Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5D5B5]/60">
            {/* Guest Count Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#5E4B66]">Simulated Guest Count:</span>
                <span className="font-bold text-sm text-[#22092C]">{input.guestCount} attendees</span>
              </div>
              <input
                type="range"
                min={20}
                max={1000}
                step={10}
                value={input.guestCount}
                onChange={(e) => setInput({ ...input, guestCount: Number(e.target.value) })}
                className="w-full accent-[#3B1242] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A6B80]">
                <span>20 (Intimate)</span>
                <span>Baseline: {event.guests.expectedCount}</span>
                <span>1,000 (Mega Celebration)</span>
              </div>
            </div>

            {/* Target Budget Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#5E4B66]">Simulated Budget Ceiling:</span>
                <span className="font-bold text-sm text-[#3B1242]">{formatINR(input.totalBudget)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={4000000}
                step={25000}
                value={input.totalBudget}
                onChange={(e) => setInput({ ...input, totalBudget: Number(e.target.value) })}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A6B80]">
                <span>₹1,00,000</span>
                <span>Baseline: {formatINR(event.budget.totalBudget)}</span>
                <span>₹40,00,000</span>
              </div>
            </div>

            {/* Venue Tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5E4B66]">Venue Category Tier</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: "budget", label: "Community / Lawn" },
                    { id: "standard", label: "Standard Banquet" },
                    { id: "premium", label: "4-Star Hotel" },
                    { id: "heritage_luxury", label: "Heritage / Palace" },
                  ] as const
                ).map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setInput({ ...input, venueTier: tier.id })}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                      input.venueTier === tier.id
                        ? "bg-[#3B1242] text-white border-[#3B1242]"
                        : "bg-white text-[#5E4B66] border-[#E5D5B5] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catering Tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5E4B66]">Catering Experience Tier</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: "economy", label: "Economy Spread" },
                    { id: "standard_buffet", label: "Standard Buffet" },
                    { id: "royal_deluxe", label: "Royal Multi-Course" },
                    { id: "bespoke_live", label: "Bespoke Live Stalls" },
                  ] as const
                ).map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setInput({ ...input, cateringTier: tier.id })}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                      input.cateringTier === tier.id
                        ? "bg-[#C5A059] text-white border-[#C5A059]"
                        : "bg-white text-[#5E4B66] border-[#E5D5B5] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-[#E5D5B5] bg-white space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">Projected Total Cost</p>
              <p className="text-2xl font-bold text-[#22092C]">{formatINR(simulationResult.projectedCost)}</p>
              <p className="text-[11px] text-[#7A6B80]">Includes 10% contingency reserve</p>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-1 ${
                isOverBudget ? "border-rose-300 bg-rose-50" : "border-emerald-300 bg-emerald-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">Financial Variance</p>
              <div className="flex items-center space-x-1.5">
                {isOverBudget ? (
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-emerald-600" />
                )}
                <p className={`text-2xl font-bold ${isOverBudget ? "text-rose-700" : "text-emerald-800"}`}>
                  {formatINR(Math.abs(simulationResult.costDelta))}
                </p>
              </div>
              <p className="text-[11px] text-[#5E4B66]">
                {isOverBudget ? "Over target budget ceiling" : "Budget surplus / buffer remaining"}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#E5D5B5] bg-white space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">Per-Guest Spend</p>
              <p className="text-2xl font-bold text-[#3B1242]">{formatINR(simulationResult.perGuestCost)}</p>
              <p className="text-[11px] text-[#7A6B80]">Total cost divided by {input.guestCount} attendees</p>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="rounded-2xl border border-[#E5D5B5]/60 bg-[#FAF8F5] p-4 space-y-2">
            <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-[#8C6D23] flex items-center gap-1.5">
              <Info className="h-4 w-4" /> Simulator Advisory
            </h5>
            <ul className="space-y-1.5 text-xs text-[#22092C]">
              {simulationResult.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Category-by-Category Impact Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#EADBDF] text-[#5E4B66] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2">Original Baseline</th>
                  <th className="py-2.5 px-2">Simulated Estimate</th>
                  <th className="py-2.5 px-2">Net Shift</th>
                  <th className="py-2.5 px-2">Analysis Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF0F3]">
                {simulationResult.categoryImpacts.map((impact, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/80">
                    <td className="py-2.5 px-2 font-semibold text-[#22092C]">{impact.categoryName}</td>
                    <td className="py-2.5 px-2 text-[#5E4B66]">{formatINR(impact.originalAllocated)}</td>
                    <td className="py-2.5 px-2 font-medium text-[#22092C]">{formatINR(impact.simulatedEstimate)}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`font-semibold ${
                          impact.delta > 0
                            ? "text-rose-600"
                            : impact.delta < 0
                            ? "text-emerald-700"
                            : "text-[#7A6B80]"
                        }`}
                      >
                        {impact.delta > 0 ? `+${formatINR(impact.delta)}` : impact.delta < 0 ? formatINR(impact.delta) : "No change"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[11px] text-[#5E4B66]">{impact.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
