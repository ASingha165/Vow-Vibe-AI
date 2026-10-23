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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <div className="space-y-8 animate-in fade-in-50">
      {/* Over-Budget Alert Banner if applicable */}
      {budgetSummary.isOverBudget && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 sm:p-5 text-rose-900 shadow-xs flex items-start space-x-3.5">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Projected Budget Ceiling Exceeded</h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Total estimated costs currently stand at {formatINR(budgetSummary.totalEstimated)}, exceeding your total ceiling
              by <span className="font-bold">{formatINR(budgetSummary.overBudgetAmount)}</span>. Review the cost-saving
              recommendations below or reallocate from optional items.
            </p>
          </div>
        </div>
      )}

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-semibold text-[#5E4B66]">Total Budget</CardDescription>
            <CardTitle className="text-2xl font-bold text-[#3B1242]">{formatINR(event.budget.totalBudget)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-[#7A6B80]">
            Emergency Reserve: <span className="font-semibold text-[#B33951]">{formatINR(event.budget.emergencyReserveAmount)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-semibold text-[#5E4B66]">Committed / Paid</CardDescription>
            <CardTitle className="text-2xl font-bold text-[#22092C]">{formatINR(budgetSummary.totalCommitted)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-[#7A6B80]">
            Actual Cash Paid: <span className="font-semibold text-[#22092C]">{formatINR(budgetSummary.totalActual)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-semibold text-[#5E4B66]">Estimated Total</CardDescription>
            <CardTitle className="text-2xl font-bold text-[#22092C]">{formatINR(budgetSummary.totalEstimated)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-[#7A6B80]">
            Allocated Sum: <span className="font-semibold text-[#22092C]">{formatINR(budgetSummary.totalAllocated)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs uppercase font-semibold text-[#5E4B66]">Remaining Buffer</CardDescription>
            <CardTitle className={`text-2xl font-bold ${budgetSummary.remainingBudget >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {formatINR(budgetSummary.remainingBudget)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-[#7A6B80]">
            {budgetSummary.remainingBudget >= 0 ? "Buffer available" : "Deficit requires trimming"}
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Share Donut Chart */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Category Allocations</CardTitle>
            <CardDescription>Target share distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatINR(Number(value)), "Allocated"]} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            {/* Category Legend list */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              {event.budget.categories.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-center space-x-1.5 truncate">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate text-[#5E4B66]">{c.name}:</span>
                  <span className="font-semibold text-[#22092C]">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allocated vs Estimated Bar Chart */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Budget vs. Estimated Spend</CardTitle>
            <CardDescription>Comparison per key expense category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF0F3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5E4B66" }} />
                  <YAxis tickFormatter={(v) => formatCompactINR(v)} tick={{ fontSize: 10, fill: "#5E4B66" }} />
                  <Tooltip formatter={(value: any) => [formatINR(Number(value)), ""]} />
                  <Bar dataKey="Allocated" fill="#C5A059" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Estimated" fill="#3B1242" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Management Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF0F3] pb-4">
          <div>
            <CardTitle>Line-Item Expense Tracker</CardTitle>
            <CardDescription>Manage quotes, contracted advances, and actual invoices</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by category */}
            <div className="flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#E5D5B5] rounded-xl px-2.5 py-1 text-xs">
              <Filter className="h-3.5 w-3.5 text-[#5E4B66]" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-[#22092C] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {event.budget.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => {
                setEditingExpense(null);
                resetForm();
                setIsAddModalOpen(true);
              }}
              size="sm"
              className="gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Expense</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 overflow-x-auto">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-[#7A6B80] space-y-2">
              <DollarSign className="h-8 w-8 text-[#C5A059] mx-auto opacity-70" />
              <p className="text-sm font-semibold">No expenses recorded for this filter.</p>
              <p className="text-xs">Click &quot;Add Expense&quot; above to log contracted quotes or paid bills.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#EADBDF] text-[#5E4B66] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-2">Expense Item</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Estimated</th>
                  <th className="py-3 px-2">Committed</th>
                  <th className="py-3 px-2">Actual Paid</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF0F3]">
                {filteredExpenses.map((exp) => {
                  const cat = event.budget.categories.find((c) => c.id === exp.categoryId);
                  return (
                    <tr key={exp.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-semibold text-[#22092C]">{exp.name}</p>
                        {exp.notes && <p className="text-[10px] text-[#7A6B80] max-w-xs truncate">{exp.notes}</p>}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-[10px] py-0 px-2">
                          {cat ? cat.name.split(" ")[0] : exp.categoryId}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 font-medium text-[#22092C]">{formatINR(exp.estimatedCost)}</td>
                      <td className="py-3 px-2 text-[#5E4B66]">
                        {exp.committedCost > 0 ? formatINR(exp.committedCost) : "—"}
                      </td>
                      <td className="py-3 px-2 text-[#22092C] font-semibold">
                        {exp.actualCost > 0 ? formatINR(exp.actualCost) : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            exp.status === "paid"
                              ? "success"
                              : exp.status === "committed"
                              ? "plum"
                              : exp.status === "quoted"
                              ? "gold"
                              : "default"
                          }
                          className="capitalize text-[10px]"
                        >
                          {exp.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1 rounded text-[#5E4B66] hover:bg-[#FAF0F3] hover:text-[#22092C] cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 rounded text-[#5E4B66] hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Concrete Cost-Saving Levers */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-[#C5A059]" />
            <CardTitle>Intelligent Cost-Reduction Levers</CardTitle>
          </div>
          <CardDescription>Deterministic suggestions tailored to your budget categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {costSavingTips.map((tip) => (
              <div key={tip.id} className="rounded-2xl border border-[#E5D5B5]/60 bg-[#FAF8F5] p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <Badge variant="gold" className="text-[10px]">
                    {tip.category}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-700">Save ~{formatINR(tip.potentialSavings)}</span>
                </div>
                <h5 className="font-serif font-bold text-sm text-[#22092C]">{tip.title}</h5>
                <p className="text-xs text-[#5E4B66] leading-relaxed">{tip.advice}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Category *
              </label>
              <select
                value={expenseForm.categoryId}
                onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
              >
                {event.budget.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Payment Status
              </label>
              <select
                value={expenseForm.status}
                onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value as ExpenseStatus })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
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
              className="h-4 w-4 rounded accent-[#3B1242]"
            />
            <label htmlFor="isEssential" className="text-xs font-medium text-[#22092C] cursor-pointer">
              Mark as Essential (Cannot be trimmed during budget cuts)
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-[#FAF0F3]">
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
