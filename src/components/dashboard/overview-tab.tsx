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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { formatINR, formatDate, getDaysRemaining } from "@/lib/utils";
import { recalculateBudgetSummary } from "@/services/budgetEngine";
import { calculateTaskMetrics } from "@/services/timelineEngine";

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

  const taskMetrics = calculateTaskMetrics(event.timeline.tasks);
  const countdown = getDaysRemaining(event.eventDate);

  const upcomingTasks = event.timeline.tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Hero Event Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#240B27] via-[#38123C] to-[#1E0724] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold" className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 capitalize">
                {event.category.replace("_", " ")}
              </Badge>
              {event.isDemo && (
                <Badge variant="rose" className="bg-[#D95B72]/20 text-[#F2C4CE] border-[#D95B72]/40">
                  Judges Demo Showcase
                </Badge>
              )}
              <span className="text-xs text-[#D9C3CE] flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#C5A059]" /> {event.location.city}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {event.title}
            </h1>
            <p className="text-sm text-[#D9C3CE] max-w-2xl leading-relaxed">
              {event.aiOverview.executiveSummary}
            </p>
          </div>

          {/* Countdown Clock Widget */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-6 py-4 text-center shrink-0 min-w-[170px]">
            <Clock className="h-5 w-5 text-[#D4AF37] mb-1" />
            <span className="font-serif text-3xl font-extrabold text-white">
              {countdown.isPast ? "Event Passed" : countdown.days}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#D9C3CE] font-semibold">
              {countdown.isPast ? "Celebrated" : "Days to Celebration"}
            </span>
            <span className="text-[10px] text-[#C5A059] mt-0.5">{formatDate(event.eventDate)}</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Budget */}
        <Card className="hover:border-[#C5A059] transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">
              <span>Total Budget</span>
              <DollarSign className="h-4 w-4 text-[#C5A059]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#3B1242]">
              {formatINR(event.budget.totalBudget)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-[#7A6B80] flex justify-between">
              <span>Emergency Reserve:</span>
              <span className="font-semibold text-[#B33951]">{formatINR(event.budget.emergencyReserveAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Estimated / Committed Spending */}
        <Card className="hover:border-[#C5A059] transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">
              <span>Projected Spend</span>
              <TrendingUp className="h-4 w-4 text-[#D95B72]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#22092C]">
              {formatINR(budgetSummary.totalEstimated)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#5E4B66]">Utilization:</span>
              <span className={`font-semibold ${budgetSummary.isOverBudget ? "text-rose-600" : "text-emerald-700"}`}>
                {budgetSummary.budgetUtilizationPct}%
              </span>
            </div>
            <ProgressBar
              value={budgetSummary.budgetUtilizationPct}
              variant={budgetSummary.isOverBudget ? "rose" : "plum"}
            />
          </CardContent>
        </Card>

        {/* Task Completion Progress */}
        <Card className="hover:border-[#C5A059] transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">
              <span>Milestone Progress</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#22092C]">
              {taskMetrics.completed} / {taskMetrics.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#5E4B66]">Completed:</span>
              <span className="font-semibold text-emerald-700">{taskMetrics.completionRate}%</span>
            </div>
            <ProgressBar value={taskMetrics.completionRate} variant="emerald" />
          </CardContent>
        </Card>

        {/* Guest Count & Per-Guest Rate */}
        <Card className="hover:border-[#C5A059] transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">
              <span>Guest Headcount</span>
              <Users className="h-4 w-4 text-[#543C78]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#22092C]">
              {event.guests.expectedCount} <span className="text-sm font-normal text-[#5E4B66]">attendees</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-[#7A6B80] flex justify-between">
              <span>Per Guest Allocation:</span>
              <span className="font-semibold text-[#22092C]">
                {formatINR(Math.round(event.budget.totalBudget / Math.max(1, event.guests.expectedCount)))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Grid: Cultural Highlights & Actionable Task Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Theme & Cultural Blueprint (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#C5A059]" />
                  <span>Atmosphere, Theme &amp; Culture</span>
                </CardTitle>
                <Badge variant="plum">{event.preferences.culturalRegion}</Badge>
              </div>
              <CardDescription>
                Curated visual styling, color palette, and ritual recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#E5D5B5]/60 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8C6D23]">Styling Concept</p>
                <p className="text-sm text-[#22092C] leading-relaxed">{event.aiOverview.themeConcept}</p>
              </div>

              {/* Color Palette Chips */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-2">Palette Accents</p>
                <div className="flex flex-wrap gap-2">
                  {event.preferences.preferredColors.map((color) => (
                    <Badge key={color} variant="rose" className="text-xs py-1 px-3">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cultural Highlights List */}
              {event.aiOverview.culturalHighlights && event.aiOverview.culturalHighlights.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-2">
                    Key Ceremonial Traditions
                  </p>
                  <ul className="space-y-1.5">
                    {event.aiOverview.culturalHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start text-xs text-[#22092C] space-x-2">
                        <Check className="h-3.5 w-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upcoming Priorities & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks requiring immediate attention</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigateTab("tasks")} className="text-xs">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#7A6B80]">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p>All upcoming milestones are completed!</p>
                </div>
              ) : (
                upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between rounded-xl border border-[#FAF0F3] bg-[#FAF8F5] p-3 hover:border-[#E5D5B5] transition-colors"
                  >
                    <div className="space-y-1 pr-2">
                      <p className="text-xs font-semibold text-[#22092C] leading-snug">{t.title}</p>
                      <p className="text-[11px] text-[#7A6B80]">Due: {formatDate(t.dueDate)}</p>
                    </div>
                    <Badge
                      variant={
                        t.priority === "critical" ? "danger" : t.priority === "high" ? "warning" : "default"
                      }
                      className="text-[9px] uppercase shrink-0"
                    >
                      {t.priority}
                    </Badge>
                  </div>
                ))
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab("assistant")}
                className="w-full gap-2 mt-2 text-xs border-[#E5D5B5]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Ask AI Assistant for Planning Guidance</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
