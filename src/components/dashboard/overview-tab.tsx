"use client";

import * as React from "react";
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { EventPlan } from "@/types/event";
import { formatINR, formatDate, getDaysRemaining } from "@/lib/utils";
import { recalculateBudgetSummary } from "@/services/budgetEngine";
import { calculateTaskMetrics } from "@/services/timelineEngine";
import { useMidnightRefresh } from "@/hooks/useMidnightRefresh";

interface OverviewTabProps {
  event: EventPlan;
  onNavigateTab: (tab: string) => void;
}

export function OverviewTab({ event, onNavigateTab }: OverviewTabProps) {
  const budgetSummary = recalculateBudgetSummary(
    event.budget.totalBudget,
    event.budget.emergencyReserveAmount,
    event.budget.categories,
    event.budget.expenses
  );

  const todayStr = useMidnightRefresh();
  const taskMetrics = calculateTaskMetrics(event.timeline.tasks);
  const countdown = getDaysRemaining(event.eventDate, todayStr);

  const upcomingTasks = event.timeline.tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 4);

  // Safe buffer calculation
  const safeBuffer = Math.max(0, event.budget.totalBudget - budgetSummary.totalEstimated);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Stitch Warm Emotional Greeting Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container via-tertiary-container to-primary text-on-primary p-5 sm:p-7 shadow-md">
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-tertiary-fixed-dim/15 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span
              id="overview-countdown-status"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-secondary-fixed text-xs font-semibold uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-xs text-secondary-fixed">stars</span>
              <span>
                Active Execution •{" "}
                {countdown.isPast
                  ? "Event completed"
                  : countdown.isToday
                  ? "Today"
                  : `${countdown.days} ${countdown.days === 1 ? "day" : "days"} to go`}
              </span>
            </span>
            <span className="text-xs text-surface-container-high/80 font-medium">
              {formatDate(event.eventDate)}
            </span>
          </div>

          <div>
            <h1 className="font-headline-sm sm:font-headline-md text-xl sm:text-2xl text-surface tracking-tight leading-snug">
              Let’s make your celebration unforgettable.
            </h1>
            <p className="font-body-sm text-xs sm:text-sm text-surface-variant/90 mt-1">
              {event.title} • {event.location.city}
            </p>
          </div>

          {/* Quick Micro-tracker strip */}
          <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-surface-container-lowest/10 mt-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-secondary-fixed text-base">verified</span>
              <span className="font-label-sm text-xs text-surface-container-lowest truncate">
                {taskMetrics.completed} of {taskMetrics.total} tasks finalized
              </span>
            </div>
            <span className="font-label-sm text-xs text-secondary-fixed font-semibold">
              {taskMetrics.completionRate}% Ready
            </span>
          </div>
        </div>
      </section>

      {/* 4 Primary Metric Cards: 2x2 Bento Grid */}
      <section aria-label="Key Event Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Budget */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wide">Total Budget</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-sm text-xl text-primary font-bold tracking-tight">
              {formatINR(event.budget.totalBudget)}
            </span>
            <p className="font-label-sm text-[11px] text-on-surface-variant/80 mt-0.5">Target Allocation Cap</p>
          </div>
        </div>

        {/* Card 2: Estimated Expenses */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wide">Committed + Est</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-sm text-xl text-on-surface font-bold tracking-tight">
              {formatINR(budgetSummary.totalEstimated)}
            </span>
            <p className="font-label-sm text-[11px] text-on-surface-variant/80 mt-0.5">
              {budgetSummary.budgetUtilizationPct}% Total Utilization
            </p>
          </div>
        </div>

        {/* Card 3: Safe Buffer */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wide">Safe Buffer</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-base">savings</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-sm text-xl text-secondary font-bold tracking-tight">
              {formatINR(safeBuffer)}
            </span>
            <p className="font-label-sm text-[11px] text-on-surface-variant/80 mt-0.5">
              Reserve: {formatINR(event.budget.emergencyReserveAmount)}
            </p>
          </div>
        </div>

        {/* Card 4: Roadmap Progress */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wide">Roadmap</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-base">task_alt</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-xl text-primary font-bold">{taskMetrics.completionRate}%</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">complete</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-primary-container h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${taskMetrics.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Middle Grid: Budget Donut Card & Immediate Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Budget Distribution Donut Card (7 cols) */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-headline-sm text-lg text-primary-container font-semibold">Budget Distribution</h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Calculated against allocated {formatINR(event.budget.totalBudget)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-full text-secondary font-label-sm text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>{formatINR(safeBuffer)} Surplus</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Donut Visual SVG Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg aria-label="Budget breakdown" className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="#35213d" strokeDasharray="83.5 155.5" strokeDashoffset="0" strokeWidth="14" />
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="#745a2a" strokeDasharray="71.6 167.4" strokeDashoffset="-83.5" strokeWidth="14" />
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="#dabde1" strokeDasharray="28.6 210.4" strokeDashoffset="-155.1" strokeWidth="14" />
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="#ffdb9f" strokeDasharray="23.8 215.2" strokeDashoffset="-183.7" strokeWidth="14" />
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="#481926" strokeDasharray="14.3 224.7" strokeDashoffset="-207.5" strokeWidth="14" />
                <circle cx="50" cy="50" fill="transparent" r="38" stroke="#cdc4cc" strokeDasharray="16.7 222.3" strokeDashoffset="-221.8" strokeWidth="14" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline-sm text-base text-primary font-bold leading-tight">
                  ₹{(event.budget.totalBudget / 100000).toFixed(1)}L
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Segment Breakdown List */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full">
              {event.budget.categories.slice(0, 6).map((cat, idx) => {
                const colors = [
                  "bg-primary-container",
                  "bg-secondary",
                  "bg-primary-fixed-dim",
                  "bg-secondary-container",
                  "bg-tertiary-container",
                  "bg-outline-variant",
                ];
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]} shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs font-label-md">
                        <span className="text-on-surface truncate">{cat.name}</span>
                        <span className="text-on-surface-variant ml-1 font-semibold">{cat.percentage}%</span>
                      </div>
                      <p className="font-body-sm text-[11px] text-on-surface-variant leading-none mt-0.5">
                        {formatINR(cat.allocatedAmount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-primary-container/8 mt-4 flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant">
              Emergency Reserve: <strong className="text-secondary">{formatINR(event.budget.emergencyReserveAmount)}</strong>
            </span>
            <button
              onClick={() => onNavigateTab("budget")}
              className="font-label-sm text-xs text-secondary hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Expenses</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Right Column: Immediate Priority Tasks (5 cols) */}
        <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-headline-sm text-lg text-primary font-semibold">Immediate Tasks</h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {upcomingTasks.length} items requiring decisions
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("tasks")}
                className="font-label-sm text-xs text-secondary hover:text-primary font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All ({taskMetrics.total})</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-on-surface-variant">
                  <CheckCircle2 className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <p>All upcoming milestones are completed!</p>
                </div>
              ) : (
                upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-primary-container/5 transition-all"
                  >
                    <div className="w-4 h-4 rounded mt-0.5 border border-primary-container/30 flex items-center justify-center shrink-0">
                      {t.status === "completed" && <span className="w-2 h-2 rounded-xs bg-primary-container" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-title-md text-xs text-on-surface font-semibold leading-tight truncate">
                          {t.title}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                            t.priority === "critical"
                              ? "bg-error-container text-on-error-container"
                              : t.priority === "high"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-secondary" /> Due: {formatDate(t.dueDate)}
                        </span>
                        <span>•</span>
                        <span className="text-secondary font-medium truncate">{t.relatedCategory || "Milestone"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("assistant")}
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-label-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-secondary text-base">auto_awesome</span>
            <span>Ask AI Co-Planner for Guidance</span>
          </button>
        </section>
      </div>

      {/* Cultural Highlights & Atmosphere Concept */}
      <section className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-primary-container/8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary-container/8 pb-3">
          <div>
            <h2 className="font-headline-sm text-lg text-primary font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">palette</span>
              <span>Atmosphere, Theme &amp; Culture</span>
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Curated visual styling, color palette, and ceremonial nuances.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-semibold">
            {event.preferences.culturalRegion}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-1.5 md:col-span-2">
            <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
              Styling Concept
            </span>
            <p className="font-body-md text-xs sm:text-sm text-on-surface leading-relaxed">
              {event.aiOverview.themeConcept}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
              Palette Accents
            </span>
            <div className="flex flex-wrap gap-1.5">
              {event.preferences.preferredColors.map((color) => (
                <span
                  key={color}
                  className="font-label-sm text-xs px-2.5 py-1 rounded-full bg-surface-container text-primary font-medium"
                >
                  {color}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
                Guest Headcount
              </span>
              <p className="font-headline-sm text-base text-primary font-bold">
                {event.guests.expectedCount} attendees (~{formatINR(Math.round(event.budget.totalBudget / Math.max(1, event.guests.expectedCount)))} / guest)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
