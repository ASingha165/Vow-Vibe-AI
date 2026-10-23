import { EventPlan } from "@/types/event";
import { formatINR, formatDate } from "@/lib/utils";

export const ExportService = {
  /**
   * Export Budget to CSV
   */
  exportBudgetCSV(event: EventPlan): void {
    const rows = [
      ["Vow & Vibe AI - Event Budget Summary"],
      ["Event Name", event.title],
      ["Event Date", formatDate(event.eventDate)],
      ["Total Budget", `₹${event.budget.totalBudget}`],
      ["Emergency Reserve", `₹${event.budget.emergencyReserveAmount} (${event.budget.emergencyReservePct}%)`],
      [],
      ["Category Name", "Percentage (%)", "Allocated (₹)", "Estimated (₹)", "Committed (₹)", "Actual (₹)"],
    ];

    event.budget.categories.forEach((cat) => {
      rows.push([
        cat.name,
        `${cat.percentage}%`,
        cat.allocatedAmount.toString(),
        cat.estimatedTotal.toString(),
        cat.committedTotal.toString(),
        cat.actualTotal.toString(),
      ]);
    });

    rows.push([]);
    rows.push(["Individual Expenses"]);
    rows.push(["Expense Name", "Category", "Status", "Essential", "Estimated (₹)", "Committed (₹)", "Actual (₹)", "Notes"]);

    event.budget.expenses.forEach((exp) => {
      const cat = event.budget.categories.find((c) => c.id === exp.categoryId);
      rows.push([
        `"${exp.name.replace(/"/g, '""')}"`,
        cat ? cat.name : exp.categoryId,
        exp.status,
        exp.isEssential ? "Yes" : "No",
        exp.estimatedCost.toString(),
        exp.committedCost.toString(),
        exp.actualCost.toString(),
        `"${(exp.notes || "").replace(/"/g, '""')}"`,
      ]);
    });

    this.downloadCSV(rows, `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_Budget.csv`);
  },

  /**
   * Export Tasks to CSV
   */
  exportTasksCSV(event: EventPlan): void {
    const rows = [
      ["Vow & Vibe AI - Task Checklist & Timeline"],
      ["Event Name", event.title],
      ["Event Date", formatDate(event.eventDate)],
      [],
      ["Task Name", "Status", "Priority", "Due Date", "Category", "Description"],
    ];

    event.timeline.tasks.forEach((t) => {
      rows.push([
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.dueDate,
        t.relatedCategory || "General",
        `"${(t.description || "").replace(/"/g, '""')}"`,
      ]);
    });

    this.downloadCSV(rows, `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_Tasks.csv`);
  },

  /**
   * Export Vendors to CSV
   */
  exportVendorsCSV(event: EventPlan): void {
    const rows = [
      ["Vow & Vibe AI - Vendor Comparison Directory"],
      ["Event Name", event.title],
      [],
      ["Vendor Name", "Category", "Quoted Price (₹)", "Status", "Rating", "Contact Phone", "Location", "Notes"],
    ];

    event.vendors.forEach((v) => {
      rows.push([
        `"${v.name.replace(/"/g, '""')}"`,
        v.category,
        v.quotedPrice.toString(),
        v.status,
        v.rating ? `${v.rating}/5` : "N/A",
        v.contactPhone || "N/A",
        `"${v.location.replace(/"/g, '""')}"`,
        `"${(v.notes || "").replace(/"/g, '""')}"`,
      ]);
    });

    this.downloadCSV(rows, `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_Vendors.csv`);
  },

  /**
   * Generate text summary to copy to clipboard
   */
  copyPlanSummary(event: EventPlan): string {
    const text = `
🎉 ${event.title}
📅 Date: ${formatDate(event.eventDate)} | 📍 ${event.location.city}
👥 Expected Guests: ${event.guests.expectedCount}
💰 Total Budget: ${formatINR(event.budget.totalBudget)} (Emergency Reserve: ${formatINR(event.budget.emergencyReserveAmount)})

🎨 Theme & Atmosphere:
${event.preferences.theme} | ${event.preferences.culturalRegion}

✨ AI Executive Summary:
${event.aiOverview.executiveSummary}

📊 Top Budget Allocations:
${event.budget.categories
  .slice(0, 5)
  .map((c) => `- ${c.name}: ${formatINR(c.allocatedAmount)} (${c.percentage}%)`)
  .join("\n")}

📋 Key Tasks (${event.timeline.tasks.filter((t) => t.status === "completed").length}/${event.timeline.tasks.length} Completed):
${event.timeline.tasks
  .slice(0, 5)
  .map((t) => `- [${t.status === "completed" ? "x" : " "}] ${t.title} (Due: ${t.dueDate})`)
  .join("\n")}

Generated with Vow & Vibe AI — Your Vision. Your Budget. Your Perfect Event.
    `.trim();

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
    }
    return text;
  },

  /**
   * Helper to trigger CSV download in browser
   */
  downloadCSV(rows: string[][], filename: string): void {
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Trigger print dialog
   */
  printDossier(): void {
    if (typeof window !== "undefined") {
      window.print();
    }
  },
};
