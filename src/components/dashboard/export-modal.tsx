"use client";

import * as React from "react";
import {
  Download,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  FileText,
  Share2,
} from "lucide-react";
import { EventPlan } from "@/types/event";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ExportService } from "@/services/exportService";
import { StorageService } from "@/services/storageService";
import { useRouter } from "next/navigation";

interface ExportTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export function ExportTab({ event, onUpdateEvent }: ExportTabProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    ExportService.copyPlanSummary(event);
    setCopied(true);
    toast({ type: "success", title: "Summary Copied", message: "Formatted event dossier copied to clipboard." });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetDemo = () => {
    if (confirm("Reset the demo event to pristine showcase state? Any temporary edits will be restored.")) {
      const fresh = StorageService.resetDemoEvent();
      onUpdateEvent(fresh);
      toast({ type: "success", title: "Demo Reset", message: "Showcase Bengali Wedding restored." });
    }
  };

  const handleDeleteEvent = () => {
    if (confirm(`Are you sure you want to permanently delete "${event.title}"?`)) {
      StorageService.deleteEvent(event.id);
      toast({ type: "info", title: "Event Deleted", message: "Redirecting..." });
      router.push("/");
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Data Downloads */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-primary-container/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-secondary-container/70 flex items-center justify-center text-secondary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-primary">Structured CSV Data Exports</h3>
              <p className="font-sans text-xs text-on-surface-variant">
                Download tabular spreadsheets compatible with Microsoft Excel, Google Sheets, or Numbers.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3.5 border border-primary-container/5">
              <div>
                <p className="text-xs font-bold text-primary">Complete Budget Ledger</p>
                <p className="text-[11px] text-on-surface-variant">Category allocations, line-item expenses &amp; variances</p>
              </div>
              <button
                onClick={() => ExportService.exportBudgetCSV(event)}
                className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3.5 border border-primary-container/5">
              <div>
                <p className="text-xs font-bold text-primary">Milestone Task Checklist</p>
                <p className="text-[11px] text-on-surface-variant">Timeline milestones, target dates, priorities &amp; categories</p>
              </div>
              <button
                onClick={() => ExportService.exportTasksCSV(event)}
                className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3.5 border border-primary-container/5">
              <div>
                <p className="text-xs font-bold text-primary">Vendor Intelligence Directory</p>
                <p className="text-[11px] text-on-surface-variant">Quoted pricing, locations, ratings &amp; contact coordinates</p>
              </div>
              <button
                onClick={() => ExportService.exportVendorsCSV(event)}
                className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Print & Shareable Dossier */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-primary-container/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
              <Printer className="h-5 w-5 text-secondary-container" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-primary">Printable Dossier &amp; Family Briefing</h3>
              <p className="font-sans text-xs text-on-surface-variant">
                Clean, printer-friendly PDF layout or shareable executive summary.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary-container/10 bg-surface-container-low p-4 space-y-3">
            <h5 className="font-serif font-bold text-sm text-primary">Official Event Planning Dossier</h5>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Generates an editorial, typography-focused printable layout without browser navigation headers or background clutter. Tailored for family committee deliberations, vendor walkthroughs, and binder preservation.
            </p>
            <div className="pt-1 flex flex-wrap gap-2.5">
              <button
                onClick={() => ExportService.printDossier()}
                className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5 text-secondary-container" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="px-4 py-2 rounded-full bg-surface-container text-primary text-xs font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1.5 border border-primary-container/10"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Text Summary"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Administration & Reset Controls */}
      <div className="rounded-2xl border border-error/20 bg-surface-container-low/60 p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-serif font-bold text-sm text-primary">Event Showcase &amp; Storage Controls</h4>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Storage Mode: <span className="font-semibold text-primary">Local Persistence (Browser Storage)</span>. Edits auto-saved on-device.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {event.isDemo && (
              <button
                onClick={handleResetDemo}
                className="px-4 py-1.5 rounded-full bg-surface-container text-primary border border-primary-container/15 text-xs font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Event</span>
              </button>
            )}

            {!event.isDemo && (
              <button
                onClick={handleDeleteEvent}
                className="px-4 py-1.5 rounded-full bg-error/15 text-error text-xs font-bold hover:bg-error/25 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

