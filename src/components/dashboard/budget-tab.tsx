"use client";

import * as React from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Edit2,
  CheckCircle2,
  Lightbulb,
  Filter,
} from "lucide-react";
import { EventPlan, ExpenseItem, ExpenseStatus } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatINR, formatCompactINR } from "@/lib/utils";
import { recalculateBudgetSummary, generateCostSavingSuggestions } from "@/services/budgetEngine";
import { StorageService } from "@/services/storageService";

interface BudgetTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export function BudgetTab({ event, onUpdateEvent }: BudgetTabProps) {
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseItem | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>("all");

  // Form State for Adding / Editing Expense
  const [expenseForm, setExpenseForm] = React.useState<{
    name: string;
    categoryId: string;
    estimatedCost: number;
    committedCost: number;
    actualCost: number;
    status: ExpenseStatus;
    isEssential: boolean;
    notes: string;
  }>({
    name: "",
    categoryId: event.budget.categories[0]?.id || "venue",
    estimatedCost: 10000,
    committedCost: 0,
    actualCost: 0,
    status: "planned",
    isEssential: true,
    notes: "",
  });

  const budgetSummary = recalculateBudgetSummary(
    event.budget.totalBudget,
    event.budget.emergencyReserveAmount,
    event.budget.categories,
    event.budget.expenses
  );

  const costSavingTips = generateCostSavingSuggestions(
    event.budget.totalBudget,
    event.budget.expenses,
    event.budget.categories
  );

  // Prepare data for Recharts Pie Chart
  const pieData = event.budget.categories.map((c) => ({
    name: c.name,
    value: c.allocatedAmount,
    color: c.color,
  }));

  // Bar chart data: Allocated vs Estimated
  const barData = event.budget.categories.map((c) => ({
    name: c.name.split(" ")[0],
    Allocated: c.allocatedAmount,
    Estimated: c.estimatedTotal,
  }));

  // Handle Save Expense (Add or Edit)
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.name.trim()) {
      toast({ type: "error", title: "Name Required", message: "Enter an item or service name." });
      return;
    }

    let updatedExpenses = [...event.budget.expenses];

    if (editingExpense) {
      updatedExpenses = updatedExpenses.map((exp) =>
        exp.id === editingExpense.id
          ? {
              ...exp,
              name: expenseForm.name,
              categoryId: expenseForm.categoryId,
              estimatedCost: Number(expenseForm.estimatedCost),
              committedCost: Number(expenseForm.committedCost),
              actualCost: Number(expenseForm.actualCost),
              status: expenseForm.status,
              isEssential: expenseForm.isEssential,
              notes: expenseForm.notes,
            }
          : exp
      );
      toast({ type: "success", title: "Expense Updated", message: `${expenseForm.name} saved.` });
    } else {
      const newExp: ExpenseItem = {
        id: `exp-${Date.now().toString(36)}`,
        categoryId: expenseForm.categoryId,
        name: expenseForm.name,
        estimatedCost: Number(expenseForm.estimatedCost),
        committedCost: Number(expenseForm.committedCost),
        actualCost: Number(expenseForm.actualCost),
        status: expenseForm.status,
        isEssential: expenseForm.isEssential,
        notes: expenseForm.notes,
      };
      updatedExpenses.push(newExp);
      toast({ type: "success", title: "Expense Added", message: `${expenseForm.name} added to budget.` });
    }

    const updatedEvent: EventPlan = {
      ...event,
      budget: {
        ...event.budget,
        expenses: updatedExpenses,
      },
    };

    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    setIsAddModalOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = event.budget.expenses.filter((e) => e.id !== id);
    const updatedEvent: EventPlan = {
      ...event,
      budget: {
        ...event.budget,
        expenses: updatedExpenses,
      },
    };
    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    toast({ type: "info", title: "Expense Removed", message: "Expense deleted from budget." });
  };

  const openEditModal = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setExpenseForm({
      name: exp.name,
      categoryId: exp.categoryId,
      estimatedCost: exp.estimatedCost,
      committedCost: exp.committedCost,
      actualCost: exp.actualCost,
      status: exp.status,
      isEssential: exp.isEssential,
      notes: exp.notes || "",
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setExpenseForm({
      name: "",
      categoryId: event.budget.categories[0]?.id || "venue",
      estimatedCost: 10000,
      committedCost: 0,
      actualCost: 0,
      status: "planned",
      isEssential: true,
      notes: "",
    });
  };

  // Filtered Expenses
  const filteredExpenses = event.budget.expenses.filter((exp) => {
    if (selectedCategoryFilter === "all") return true;
    return exp.categoryId === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Stitch Screen Context / Intro */}
      <div className="flex flex-col pt-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-fixed-variant">
            <span className="material-symbols-outlined text-sm text-secondary">insights</span>
            <span className="font-label-sm text-xs font-semibold tracking-wide uppercase">
              Real-Time Intelligence
            </span>
          </div>
          <span className="font-label-sm text-xs text-on-surface-variant italic">
            Sample event demonstration figures
          </span>
        </div>
        <div className="mt-2.5">
          <h2 className="font-headline-md text-2xl text-primary font-bold tracking-tight">
            Your Budget, Beautifully Organized.
          </h2>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {event.title} • {event.location.city} ({formatINR(event.budget.totalBudget)} Budget)
          </p>
        </div>
      </div>

      {/* Overrun Health Indicator Pill */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-high/90 shadow-xs border border-primary-container/5">
        <span
          className={`material-symbols-outlined text-base ${
            budgetSummary.isOverBudget ? "text-error" : "text-secondary"
          }`}
        >
          {budgetSummary.isOverBudget ? "warning" : "verified"}
        </span>
        <span className="font-label-md text-xs sm:text-sm text-on-surface flex-1 truncate">
          {budgetSummary.isOverBudget ? (
            <span>
              Projected budget ceiling exceeded by{" "}
              <strong className="text-error font-semibold">{formatINR(budgetSummary.overBudgetAmount)}</strong>
            </span>
          ) : (
            <span>
              No overruns detected. Budget health:{" "}
              <strong className="text-secondary font-semibold">96% optimal</strong>
            </span>
          )}
        </span>
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            budgetSummary.isOverBudget ? "bg-error animate-ping" : "bg-secondary animate-pulse"
          }`}
        />
      </div>

      {/* Summary KPI Strip (Editorial Bento Layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Total Target</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-sm text-xl text-primary font-bold leading-none">
              {formatINR(event.budget.totalBudget)}
            </span>
            <p className="font-label-sm text-xs text-on-surface-variant mt-1">100% Target Cap</p>
          </div>
        </div>

        {/* Card 2: Committed */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Committed</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-base">lock</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-sm text-xl text-primary font-bold leading-none">
              {formatINR(budgetSummary.totalCommitted)}
            </span>
            <p className="font-label-sm text-xs text-secondary font-medium mt-1">Signed &amp; Paid</p>
          </div>
        </div>

        {/* Card 3: Estimated Pending */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-primary-container/8 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Pending Est.</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container/60 flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-base">pending_actions</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-sm text-xl text-on-secondary-container font-bold leading-none">
              {formatINR(Math.max(0, budgetSummary.totalEstimated - budgetSummary.totalCommitted))}
            </span>
            <p className="font-label-sm text-xs text-on-surface-variant mt-1">In Review</p>
          </div>
        </div>

        {/* Card 4: Safe Buffer */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-primary-container/8 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Safe Buffer</span>
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-base">shield</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-sm text-xl text-tertiary font-bold leading-none">
              {formatINR(Math.max(0, budgetSummary.remainingBudget))}
            </span>
            <p className="font-label-sm text-xs text-on-tertiary-fixed-variant font-medium mt-1">
              Reserve: {formatINR(event.budget.emergencyReserveAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Expense Allocation Visual Multi-tier Bar */}
      <div className="p-5 rounded-xl bg-surface-container-lowest shadow-xs border border-primary-container/8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-title-md text-sm font-semibold text-primary-container">
            Allocation Distribution
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant">
            {budgetSummary.budgetUtilizationPct}% committed &amp; planned
          </span>
        </div>

        {/* Multi-tier Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-surface-container flex overflow-hidden p-0.5">
          {event.budget.categories.map((c, idx) => {
            const colors = [
              "bg-primary-container",
              "bg-secondary",
              "bg-tertiary-container",
              "bg-on-tertiary-container",
              "bg-secondary-fixed-dim",
              "bg-surface-tint",
            ];
            return (
              <div
                key={c.id}
                className={`h-full rounded-full ${colors[idx % colors.length]} ml-0.5 first:ml-0`}
                style={{ width: `${c.percentage}%` }}
                title={`${c.name} ${c.percentage}%`}
              />
            );
          })}
        </div>

        {/* Category Color Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          {event.budget.categories.map((c, idx) => {
            const colors = [
              "bg-primary-container",
              "bg-secondary",
              "bg-tertiary-container",
              "bg-on-tertiary-container",
              "bg-secondary-fixed-dim",
              "bg-surface-tint",
            ];
            return (
              <div key={c.id} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                <span className="font-label-sm text-xs text-on-surface-variant">
                  {c.name.split(" ")[0]} ({c.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Share Donut Chart */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-primary-container/8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-title-md text-sm font-semibold text-primary">Category Allocations</h3>
            <span className="font-label-sm text-xs text-on-surface-variant">Target shares</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatINR(Number(value)), "Allocated"]} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Estimated Bar Chart */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-primary-container/8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-title-md text-sm font-semibold text-primary">Budget vs. Estimated Spend</h3>
            <span className="font-label-sm text-xs text-on-surface-variant">Penny-reconciled comparison</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE7E2" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4B454C" }} />
                <YAxis tickFormatter={(v) => formatCompactINR(v)} tick={{ fontSize: 10, fill: "#4B454C" }} />
                <Tooltip formatter={(value: any) => [formatINR(Number(value)), ""]} />
                <Bar dataKey="Allocated" fill="#D9B77E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Estimated" fill="#35213D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expenses Header & Action Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-headline-sm text-lg text-primary font-semibold">Committed &amp; Projected</h3>
            <p className="font-label-sm text-xs text-on-surface-variant">
              {filteredExpenses.length} itemized categories under management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingExpense(null);
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-primary-container text-surface flex items-center gap-1.5 shadow-sm hover:opacity-95 active:scale-95 transition-all font-label-md text-xs font-semibold cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-secondary-container" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-full font-label-sm text-xs whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryFilter === "all"
                ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container"
            }`}
          >
            All ({event.budget.expenses.length})
          </button>
          {event.budget.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-xs whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === c.id
                  ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container"
              }`}
            >
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Expense List Cards (Stitch mobile & desktop layout) */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-primary-container/8 p-6 space-y-2">
            <DollarSign className="h-8 w-8 text-secondary mx-auto opacity-70" />
            <p className="text-sm font-semibold text-primary">No expenses recorded for this filter.</p>
            <p className="text-xs">Click &quot;Log Expense&quot; above to record vendor quotes or advances.</p>
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const cat = event.budget.categories.find((c) => c.id === exp.categoryId);
            return (
              <div
                key={exp.id}
                className="expense-card p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-primary-container/8 space-y-3 transition-all hover:border-primary-container/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-base">receipt</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-title-md text-sm text-primary font-semibold leading-tight truncate">
                        {exp.name}
                      </h4>
                      <span className="font-label-sm text-xs text-on-surface-variant">
                        {cat?.name || exp.categoryId} {exp.notes ? `• ${exp.notes}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
                        exp.status === "paid"
                          ? "bg-secondary-container text-on-secondary-container"
                          : exp.status === "committed"
                          ? "bg-primary-container text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {exp.status === "paid"
                        ? "Deposit Paid"
                        : exp.status === "committed"
                        ? "Contract Signed"
                        : exp.status === "quoted"
                        ? "Quote Confirmed"
                        : "Planned"}
                    </span>
                    <button
                      onClick={() => openEditModal(exp)}
                      className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 bg-surface-container-low px-3.5 py-2.5 rounded-lg text-xs">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Estimate</span>
                    <span className="font-title-md text-sm text-on-surface font-semibold">{formatINR(exp.estimatedCost)}</span>
                  </div>
                  <div className="flex items-center text-secondary">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">
                      {exp.committedCost > 0 ? "Actual Contract" : "Pending Commitment"}
                    </span>
                    <span className="font-title-md text-sm text-primary font-bold">
                      {exp.committedCost > 0 ? formatINR(exp.committedCost) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Concrete Cost-Saving Levers */}
      <div className="p-5 rounded-xl bg-surface-container-lowest shadow-xs border border-primary-container/8 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-secondary" />
          <div>
            <h3 className="font-title-md text-base text-primary font-semibold">Intelligent Cost-Reduction Levers</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Deterministic suggestions tailored to your budget categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {costSavingTips.map((tip) => (
            <div
              key={tip.id}
              className="rounded-xl border border-primary-container/8 bg-surface-container-low p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
                  {tip.category}
                </span>
                <span className="font-label-sm text-xs font-bold text-secondary">
                  Save ~{formatINR(tip.potentialSavings)}
                </span>
              </div>
              <h5 className="font-title-md text-xs sm:text-sm font-semibold text-primary">{tip.title}</h5>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">{tip.advice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingExpense ? "Edit Expense Item" : "Log New Expense Item"}
        description="Record vendor quotations, deposit payments, or estimated expenses."
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <Input
            label="Item / Service Name *"
            placeholder="e.g. Rajbari Courtyard Advance Deposit"
            value={expenseForm.name}
            onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Category *
              </label>
              <select
                value={expenseForm.categoryId}
                onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-primary-container/15 bg-white px-3.5 py-2 text-sm text-primary focus:outline-none"
              >
                {event.budget.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Payment Status
              </label>
              <select
                value={expenseForm.status}
                onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value as ExpenseStatus })}
                className="flex h-11 w-full rounded-xl border border-primary-container/15 bg-white px-3.5 py-2 text-sm text-primary focus:outline-none"
              >
                <option value="planned">Planned (Estimating)</option>
                <option value="quoted">Quotation Received</option>
                <option value="committed">Committed / Contracted</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Estimated Cost (₹)"
              type="number"
              value={expenseForm.estimatedCost}
              onChange={(e) => setExpenseForm({ ...expenseForm, estimatedCost: Number(e.target.value) })}
            />
            <Input
              label="Committed Cost (₹)"
              type="number"
              value={expenseForm.committedCost}
              onChange={(e) => setExpenseForm({ ...expenseForm, committedCost: Number(e.target.value) })}
            />
            <Input
              label="Actual Paid (₹)"
              type="number"
              value={expenseForm.actualCost}
              onChange={(e) => setExpenseForm({ ...expenseForm, actualCost: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Notes / Vendor Terms"
            placeholder="e.g., 50% advance cleared, remaining balance due on wedding morning."
            value={expenseForm.notes}
            onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
          />

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isEssential"
              checked={expenseForm.isEssential}
              onChange={(e) => setExpenseForm({ ...expenseForm, isEssential: e.target.checked })}
              className="h-4 w-4 rounded accent-primary-container"
            />
            <label htmlFor="isEssential" className="text-xs font-medium text-primary cursor-pointer">
              Mark as Essential (Cannot be trimmed during budget cuts)
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-primary-container/10">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingExpense ? "Save Changes" : "Add Expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
