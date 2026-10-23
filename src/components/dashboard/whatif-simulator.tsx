"use client";

import * as React from "react";
import { Sliders, RefreshCw, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Sparkles, Building2, Utensils, Palette } from "lucide-react";
import { EventPlan, WhatIfSimulationInput, WhatIfSimulationResult } from "@/types/event";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // Run simulation reactively with 100% deterministic arithmetic
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
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface-container-lowest p-6 border border-primary-container/10 shadow-sm space-y-6">
        {/* Stitch Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container/70 flex items-center justify-center text-[#745A2A]">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-primary leading-tight">Tactile &ldquo;What-If?&rdquo; Playground</h3>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-bold uppercase tracking-wider">
                  Live AI
                </span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant">
                Interactive budget elasticity simulator &amp; resource stress-tester
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-full bg-surface-container text-primary font-sans text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleApplyToPlan}
              className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-sans text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">check</span>
              <span>Apply to Event Plan</span>
            </button>
          </div>
        </div>

        {/* Simulation Controls in Stitch Surface Low */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-xl bg-surface-container-low border border-primary-container/5">
          {/* Guest Count Stepper & Slider */}
          <div className="space-y-2 bg-surface-container-lowest p-4 rounded-xl border border-primary-container/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-primary">Guest Count</span>
                <p className="font-sans text-[11px] text-on-surface-variant">Baseline: {event.guests.expectedCount} attendees</p>
              </div>
              <div className="flex items-center gap-2.5 bg-surface-container px-2 py-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setInput((prev) => ({ ...prev, guestCount: Math.max(10, prev.guestCount - 10) }))}
                  className="w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-white active:scale-90 transition-transform font-bold"
                  aria-label="Decrease guests"
                >
                  -
                </button>
                <span className="font-serif font-bold text-sm text-primary min-w-[36px] text-center">
                  {input.guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setInput((prev) => ({ ...prev, guestCount: Math.min(1000, prev.guestCount + 10) }))}
                  className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:opacity-90 active:scale-90 transition-transform font-bold"
                  aria-label="Increase guests"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min={20}
              max={1000}
              step={10}
              value={input.guestCount}
              onChange={(e) => setInput({ ...input, guestCount: Number(e.target.value) })}
              className="w-full accent-[#35213D] cursor-pointer h-1.5 bg-surface-container rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/70">
              <span>20 (Intimate)</span>
              <span>500 (Grand)</span>
              <span>1,000 (Mega)</span>
            </div>
          </div>

          {/* Budget Ceiling Slider */}
          <div className="space-y-2 bg-surface-container-lowest p-4 rounded-xl border border-primary-container/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-primary">Simulated Budget Ceiling</span>
                <p className="font-sans text-[11px] text-on-surface-variant">Baseline: {formatINR(event.budget.totalBudget)}</p>
              </div>
              <span className="font-serif font-bold text-base text-primary">
                {formatINR(input.totalBudget)}
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={4000000}
              step={25000}
              value={input.totalBudget}
              onChange={(e) => setInput({ ...input, totalBudget: Number(e.target.value) })}
              className="w-full accent-[#745A2A] cursor-pointer h-1.5 bg-surface-container rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/70">
              <span>₹1,00,000</span>
              <span>₹20,00,000</span>
              <span>₹40,00,000</span>
            </div>
          </div>

          {/* Venue Category Tier */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-secondary" />
              <label className="text-xs font-bold uppercase tracking-wider text-primary">Venue Ambience Tier</label>
            </div>
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
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer text-center border ${
                    input.venueTier === tier.id
                      ? "bg-primary-container text-on-primary border-primary-container shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant border-primary-container/10 hover:bg-surface-container"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catering Experience Tier */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-secondary" />
              <label className="text-xs font-bold uppercase tracking-wider text-primary">Catering Spread Tier</label>
            </div>
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
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer text-center border ${
                    input.cateringTier === tier.id
                      ? "bg-secondary text-white border-secondary shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant border-primary-container/10 hover:bg-surface-container"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Dynamic Impact Card (Stitch simulation insight box) */}
        <div className="p-4 rounded-xl bg-surface-container transition-all flex gap-3.5 items-start">
          <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container shrink-0 flex items-center justify-center mt-0.5">
            <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif font-bold text-sm text-primary">Dynamic Optimization Insight</span>
            <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
              {isOverBudget
                ? `Simulating ${input.guestCount} guests at current tiers requires ${formatINR(simulationResult.projectedCost)}, exceeding your ${formatINR(input.totalBudget)} ceiling by ${formatINR(simulationResult.costDelta)}. Consider adjusting catering or venue tiers to reconcile variance.`
                : `Your simulation of ${input.guestCount} guests yields an estimated spend of ${formatINR(simulationResult.projectedCost)}, preserving a comfortable reserve of ${formatINR(Math.abs(simulationResult.costDelta))} under your budget ceiling.`}
            </p>
          </div>
        </div>

        {/* Simulation Output Metrics Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-primary-container/10 bg-surface-container-lowest space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Projected Total Cost</p>
            <p className="font-serif text-2xl font-bold text-primary">{formatINR(simulationResult.projectedCost)}</p>
            <p className="text-[11px] text-on-surface-variant/80">Includes 10% contingency reserve</p>
          </div>

          <div
            className={`p-4 rounded-xl border space-y-1 ${
              isOverBudget ? "border-error/30 bg-error/5" : "border-emerald-500/30 bg-emerald-500/5"
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Financial Variance</p>
            <div className="flex items-center gap-2">
              {isOverBudget ? (
                <TrendingUp className="h-5 w-5 text-error shrink-0" />
              ) : (
                <TrendingDown className="h-5 w-5 text-emerald-700 shrink-0" />
              )}
              <p className={`font-serif text-2xl font-bold ${isOverBudget ? "text-error" : "text-emerald-800"}`}>
                {formatINR(Math.abs(simulationResult.costDelta))}
              </p>
            </div>
            <p className="text-[11px] text-on-surface-variant/80">
              {isOverBudget ? "Over target budget ceiling" : "Budget surplus / buffer remaining"}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-primary-container/10 bg-surface-container-lowest space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Per-Guest Spend</p>
            <p className="font-serif text-2xl font-bold text-secondary">{formatINR(simulationResult.perGuestCost)}</p>
            <p className="text-[11px] text-on-surface-variant/80">Total cost divided by {input.guestCount} attendees</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-primary-container/10 bg-surface-container-low p-4 space-y-2.5">
          <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Simulator Advisory</span>
          </h5>
          <ul className="space-y-1.5 text-xs text-primary">
            {simulationResult.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Category-by-Category Shift Table */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-sm text-primary">Category Allocation Variance</h4>
          <div className="overflow-x-auto rounded-xl border border-primary-container/10">
            <table className="w-full text-left text-xs bg-surface-container-lowest">
              <thead className="border-b border-surface-container bg-surface-container-low text-on-surface-variant uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Original Baseline</th>
                  <th className="py-3 px-3">Simulated Estimate</th>
                  <th className="py-3 px-3">Net Shift</th>
                  <th className="py-3 px-3">Analysis Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {simulationResult.categoryImpacts.map((impact, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary">{impact.categoryName}</td>
                    <td className="py-3 px-3 text-on-surface-variant">{formatINR(impact.originalAllocated)}</td>
                    <td className="py-3 px-3 font-medium text-primary">{formatINR(impact.simulatedEstimate)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          impact.delta > 0
                            ? "text-error"
                            : impact.delta < 0
                            ? "text-emerald-700"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {impact.delta > 0 ? `+${formatINR(impact.delta)}` : impact.delta < 0 ? formatINR(impact.delta) : "No change"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-on-surface-variant">{impact.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

