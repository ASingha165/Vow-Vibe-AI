"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PieChart,
  Sliders,
  CalendarCheck,
  Store,
  Sparkles,
  ShieldAlert,
  Share2,
  MapPin,
  Clock,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventPlan } from "@/types/event";
import { StorageService } from "@/services/storageService";
import { formatDate, getDaysRemaining, formatINR } from "@/lib/utils";
import { DEMO_BENGALI_WEDDING } from "@/data/demoEvent";

// Dashboard Tab Subcomponents
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { BudgetTab } from "@/components/dashboard/budget-tab";
import { WhatIfSimulator } from "@/components/dashboard/whatif-simulator";
import { TasksTab } from "@/components/dashboard/tasks-tab";
import { VendorsTab } from "@/components/dashboard/vendors-tab";
import { AiAssistantTab } from "@/components/dashboard/ai-assistant-tab";
import { RiskTab } from "@/components/dashboard/risk-tab";
import { ExportTab } from "@/components/dashboard/export-modal";

type TabId = "overview" | "budget" | "whatif" | "tasks" | "vendors" | "assistant" | "risks" | "export";

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [event, setEvent] = React.useState<EventPlan | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabId>("overview");
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const curr = StorageService.getCurrentEvent();
    setEvent(curr);
  }, []);

  const handleUpdateEvent = (updated: EventPlan) => {
    setEvent(updated);
    StorageService.saveEvent(updated);
  };

  if (!isClient || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#3B1242] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#5E4B66]">Loading Event Dashboard...</p>
        </div>
      </div>
    );
  }

  const countdown = getDaysRemaining(event.eventDate);

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "budget", label: "Budget & Expenses", icon: PieChart },
    { id: "whatif", label: '"What If?" Lab', icon: Sliders },
    { id: "tasks", label: "Timeline & Tasks", icon: CalendarCheck },
    { id: "vendors", label: "Vendor Directory", icon: Store },
    { id: "assistant", label: "AI Assistant", icon: Sparkles },
    { id: "risks", label: "Risk Guard", icon: ShieldAlert },
    { id: "export", label: "Export & Dossier", icon: Share2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb & Sub-Nav Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5D5B5]/60 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B80]">Event Dashboard</span>
              <span className="text-[#C5A059]">•</span>
              <Badge variant="plum" className="capitalize text-[10px]">
                {event.category.replace("_", " ")}
              </Badge>
              {event.isDemo && (
                <Badge variant="rose" className="text-[10px]">
                  Judges Demo Data
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#22092C] tracking-tight">
              {event.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="gold" className="text-xs py-1 px-3 hidden sm:inline-flex">
              {countdown.text} ({formatDate(event.eventDate)})
            </Badge>

            <Button
              onClick={() => router.push("/plan")}
              variant="outline"
              size="sm"
              className="text-xs border-[#E5D5B5]"
            >
              <span>+ New Event</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none no-print">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#3B1242] text-white shadow-sm"
                    : "bg-white text-[#5E4B66] border border-[#E5D5B5]/60 hover:bg-[#FAF8F5] hover:text-[#22092C]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#D4AF37]" : "text-[#7A6B80]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents View */}
        <div className="no-print">
          {activeTab === "overview" && (
            <OverviewTab event={event} onNavigateTab={(tab) => setActiveTab(tab as TabId)} />
          )}
          {activeTab === "budget" && <BudgetTab event={event} onUpdateEvent={handleUpdateEvent} />}
          {activeTab === "whatif" && <WhatIfSimulator event={event} onUpdateEvent={handleUpdateEvent} />}
          {activeTab === "tasks" && <TasksTab event={event} onUpdateEvent={handleUpdateEvent} />}
          {activeTab === "vendors" && <VendorsTab event={event} onUpdateEvent={handleUpdateEvent} />}
          {activeTab === "assistant" && <AiAssistantTab event={event} onUpdateEvent={handleUpdateEvent} />}
          {activeTab === "risks" && <RiskTab event={event} onUpdateEvent={handleUpdateEvent} />}
          {activeTab === "export" && <ExportTab event={event} onUpdateEvent={handleUpdateEvent} />}
        </div>

        {/* Print-Only Dossier Layout for clean PDF Generation */}
        <div className="hidden print-only p-8 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-sm text-gray-600">
              {event.location.city} • {formatDate(event.eventDate)} • {event.guests.expectedCount} Guests
            </p>
            <p className="text-sm text-gray-800 font-semibold mt-1">
              Total Budget: {formatINR(event.budget.totalBudget)} (Reserve: {formatINR(event.budget.emergencyReserveAmount)})
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold border-b pb-1">Executive Summary</h3>
            <p className="text-sm mt-2">{event.aiOverview.executiveSummary}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold border-b pb-1">Budget Allocation Breakdown</h3>
            <table className="w-full text-left text-xs mt-2">
              <thead>
                <tr className="border-b">
                  <th className="py-1">Category</th>
                  <th className="py-1">Share</th>
                  <th className="py-1">Allocated</th>
                  <th className="py-1">Estimated</th>
                </tr>
              </thead>
              <tbody>
                {event.budget.categories.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-1">{c.name}</td>
                    <td className="py-1">{c.percentage}%</td>
                    <td className="py-1">{formatINR(c.allocatedAmount)}</td>
                    <td className="py-1">{formatINR(c.estimatedTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-lg font-bold border-b pb-1">Milestone Preparation Tasks</h3>
            <ul className="text-xs space-y-1 mt-2">
              {event.timeline.tasks.map((t) => (
                <li key={t.id} className="flex justify-between border-b py-1">
                  <span>[{t.status === "completed" ? "✓" : " "}] {t.title}</span>
                  <span>Due: {formatDate(t.dueDate)} ({t.priority})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
