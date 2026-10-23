"use client";

import * as React from "react";
import {
  ShieldAlert,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { EventPlan, RiskScenario, RiskLevel } from "@/types/event";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatINR } from "@/lib/utils";
import { StorageService } from "@/services/storageService";

interface RiskTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export function RiskTab({ event, onUpdateEvent }: RiskTabProps) {
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [riskForm, setRiskForm] = React.useState<{
    title: string;
    description: string;
    likelihood: RiskLevel;
    impact: RiskLevel;
    preventiveAction: string;
    contingencyPlan: string;
    estimatedContingencyCost: number;
  }>({
    title: "",
    description: "",
    likelihood: "medium",
    impact: "high",
    preventiveAction: "",
    contingencyPlan: "",
    estimatedContingencyCost: 15000,
  });

  const totalContingencyCost = event.risks.reduce(
    (sum, r) => sum + (r.estimatedContingencyCost || 0),
    0
  );

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskForm.title.trim()) {
      toast({ type: "error", title: "Title Required", message: "Enter a risk scenario title." });
      return;
    }

    const newRisk: RiskScenario = {
      id: `risk-custom-${Date.now().toString(36)}`,
      title: riskForm.title,
      description: riskForm.description,
      likelihood: riskForm.likelihood,
      impact: riskForm.impact,
      preventiveAction: riskForm.preventiveAction,
      contingencyPlan: riskForm.contingencyPlan,
      estimatedContingencyCost: Number(riskForm.estimatedContingencyCost),
    };

    const updatedEvent: EventPlan = {
      ...event,
      risks: [...event.risks, newRisk],
    };

    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    toast({ type: "success", title: "Risk Added", message: riskForm.title });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDeleteRisk = (id: string) => {
    const updatedRisks = event.risks.filter((r) => r.id !== id);
    const updatedEvent: EventPlan = { ...event, risks: updatedRisks };
    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    toast({ type: "info", title: "Risk Removed", message: "Scenario removed from assessment." });
  };

  const resetForm = () => {
    setRiskForm({
      title: "",
      description: "",
      likelihood: "medium",
      impact: "high",
      preventiveAction: "",
      contingencyPlan: "",
      estimatedContingencyCost: 15000,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Advisory Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">Identified Risks</p>
          <p className="font-serif text-2xl font-bold text-[#22092C] mt-1">{event.risks.length} Scenarios</p>
          <p className="text-[11px] text-[#7A6B80] mt-0.5">Pre-planned preventive &amp; backup protocols</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">Est. Contingency Exposure</p>
          <p className="font-serif text-2xl font-bold text-[#B33951] mt-1">{formatINR(totalContingencyCost)}</p>
          <p className="text-[11px] text-[#7A6B80] mt-0.5">Total backup budget needed if all occur</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">Your Contingency Reserve</p>
          <p className="font-serif text-2xl font-bold text-emerald-700 mt-1">
            {formatINR(event.budget.emergencyReserveAmount)}
          </p>
          <p className="text-[11px] text-[#7A6B80] mt-0.5">
            {event.budget.emergencyReserveAmount >= totalContingencyCost
              ? "Fully funded by emergency reserve"
              : "Recommend expanding contingency reserve"}
          </p>
        </Card>
      </div>

      {/* Risk Scenarios List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FAF0F3] pb-4">
          <div>
            <CardTitle>Risk &amp; Contingency Scenarios</CardTitle>
            <CardDescription>
              Proactive plans to guard against weather, power, schedule, or vendor disruptions.
            </CardDescription>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            size="sm"
            className="gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Risk Scenario</span>
          </Button>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {event.risks.length === 0 ? (
            <div className="text-center py-10 text-[#7A6B80]">
              <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">No risk scenarios logged.</p>
              <p className="text-xs">Add potential risks to formulate backup protocols.</p>
            </div>
          ) : (
            event.risks.map((risk) => (
              <div
                key={risk.id}
                className="rounded-2xl border border-[#E5D5B5]/70 bg-white p-5 hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FAF0F3] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <AlertTriangle className="h-4 w-4 text-[#C5A059] shrink-0" />
                    <h4 className="font-serif font-bold text-base text-[#22092C]">{risk.title}</h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        risk.likelihood === "high"
                          ? "danger"
                          : risk.likelihood === "medium"
                          ? "warning"
                          : "default"
                      }
                      className="text-[10px] uppercase"
                    >
                      Likelihood: {risk.likelihood}
                    </Badge>
                    <Badge
                      variant={
                        risk.impact === "high"
                          ? "danger"
                          : risk.impact === "medium"
                          ? "warning"
                          : "default"
                      }
                      className="text-[10px] uppercase"
                    >
                      Impact: {risk.impact}
                    </Badge>
                    <button
                      onClick={() => handleDeleteRisk(risk.id)}
                      className="p-1 rounded text-[#7A6B80] hover:text-rose-600 cursor-pointer ml-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#5E4B66] leading-relaxed">{risk.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#E5D5B5]/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Preventive Measure (Before Event)
                    </span>
                    <p className="text-xs text-[#22092C] leading-snug">{risk.preventiveAction}</p>
                  </div>

                  <div className="rounded-xl bg-[#FAF0F3] p-3 border border-[#EADBDF] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B33951] flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Backup Action Plan
                      </span>
                      {risk.estimatedContingencyCost ? (
                        <span className="text-[11px] font-bold text-[#B33951]">
                          Est. Buffer: {formatINR(risk.estimatedContingencyCost)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#22092C] leading-snug">{risk.contingencyPlan}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Custom Risk Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Custom Risk Scenario"
        description="Anticipate logistical vulnerabilities and document concrete preventive protocols."
      >
        <form onSubmit={handleSaveRisk} className="space-y-4">
          <Input
            label="Risk Scenario Title *"
            placeholder="e.g., Unseasonal Rain on Outdoor Dining Area"
            value={riskForm.title}
            onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })}
          />

          <Textarea
            label="Scenario Description"
            placeholder="Why might this happen and what would be disrupted?"
            value={riskForm.description}
            onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Likelihood
              </label>
              <select
                value={riskForm.likelihood}
                onChange={(e) => setRiskForm({ ...riskForm, likelihood: e.target.value as RiskLevel })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Potential Impact
              </label>
              <select
                value={riskForm.impact}
                onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value as RiskLevel })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <Input
              label="Est. Contingency Cost (₹)"
              type="number"
              value={riskForm.estimatedContingencyCost}
              onChange={(e) => setRiskForm({ ...riskForm, estimatedContingencyCost: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Preventive Action (To prevent occurrence)"
            placeholder="Actions taken in advance (contracts, inspections, backups)..."
            value={riskForm.preventiveAction}
            onChange={(e) => setRiskForm({ ...riskForm, preventiveAction: e.target.value })}
          />

          <Textarea
            label="Backup Contingency Plan (If it occurs anyway)"
            placeholder="Step-by-step immediate response protocol..."
            value={riskForm.contingencyPlan}
            onChange={(e) => setRiskForm({ ...riskForm, contingencyPlan: e.target.value })}
          />

          <div className="pt-4 flex justify-end space-x-2 border-t border-[#FAF0F3]">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Scenario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
