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
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6 animate-in fade-in-50">
      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Data Downloads */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-[#C5A059]" />
              <CardTitle>Structured CSV Exports</CardTitle>
            </div>
            <CardDescription>
              Download tabular spreadsheets compatible with Microsoft Excel, Google Sheets, or Numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] p-3 border border-[#E5D5B5]/60">
              <div>
                <p className="text-xs font-semibold text-[#22092C]">Complete Budget Breakdown</p>
                <p className="text-[11px] text-[#7A6B80]">Category allocations and line-item expenses</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => ExportService.exportBudgetCSV(event)} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] p-3 border border-[#E5D5B5]/60">
              <div>
                <p className="text-xs font-semibold text-[#22092C]">Milestone Task Checklist</p>
                <p className="text-[11px] text-[#7A6B80]">Timeline milestones, due dates &amp; priorities</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => ExportService.exportTasksCSV(event)} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] p-3 border border-[#E5D5B5]/60">
              <div>
                <p className="text-xs font-semibold text-[#22092C]">Vendor Quote Comparison</p>
                <p className="text-[11px] text-[#7A6B80]">Quoted pricing, contact info &amp; ratings</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => ExportService.exportVendorsCSV(event)} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Print & Shareable Dossier */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Printer className="h-5 w-5 text-[#3B1242]" />
              <CardTitle>Printable Dossier &amp; Sharing</CardTitle>
            </div>
            <CardDescription>
              Clean, printer-friendly PDF layout or shareable executive summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-[#E5D5B5]/70 bg-[#FAF8F5] p-4 space-y-2.5">
              <h5 className="font-serif font-bold text-sm text-[#22092C]">Official Event Planning Dossier</h5>
              <p className="text-xs text-[#5E4B66] leading-relaxed">
                Generates a clean, typography-focused printable layout without browser navigation headers or background clutter. Perfect for family committee meetings and vendor consultations.
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                <Button size="sm" variant="primary" onClick={() => ExportService.printDossier()} className="gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save as PDF</span>
                </Button>

                <Button size="sm" variant="outline" onClick={handleCopySummary} className="gap-1.5 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Summary"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Administration & Reset Controls */}
      <Card className="border-rose-200 bg-rose-50/40">
        <CardHeader>
          <CardTitle className="text-base text-rose-900">Event Administration</CardTitle>
          <CardDescription className="text-xs text-rose-700">
            Reset demo state for judges or manage persistent storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-0">
          <div>
            <p className="text-xs text-rose-800">
              Storage Mode: <span className="font-semibold">Local Persistence (Browser Storage)</span>
            </p>
            <p className="text-[11px] text-rose-600">
              Your edits are automatically saved locally. No cloud credentials required.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {event.isDemo && (
              <Button size="sm" variant="outline" onClick={handleResetDemo} className="text-xs gap-1.5 border-rose-300 text-rose-800 hover:bg-rose-100">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Event</span>
              </Button>
            )}

            {!event.isDemo && (
              <Button size="sm" variant="danger" onClick={handleDeleteEvent} className="text-xs gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Event</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
