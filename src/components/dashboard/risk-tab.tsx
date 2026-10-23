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
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Top Advisory Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-surface-container-lowest p-5 border border-primary-container/10 shadow-xs space-y-1">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Identified Risks</p>
          <p className="font-serif text-2xl font-bold text-primary mt-1">{event.risks.length} Scenarios</p>
          <p className="font-sans text-[11px] text-on-surface-variant/80 mt-0.5">Pre-planned preventive &amp; backup protocols</p>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-5 border border-primary-container/10 shadow-xs space-y-1">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Est. Contingency Exposure</p>
          <p className="font-serif text-2xl font-bold text-error mt-1">{formatINR(totalContingencyCost)}</p>
          <p className="font-sans text-[11px] text-on-surface-variant/80 mt-0.5">Total backup budget needed if all occur</p>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-5 border border-primary-container/10 shadow-xs space-y-1">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Your Contingency Reserve</p>
          <p className="font-serif text-2xl font-bold text-emerald-700 mt-1">
            {formatINR(event.budget.emergencyReserveAmount)}
          </p>
          <p className="font-sans text-[11px] text-on-surface-variant/80 mt-0.5">
            {event.budget.emergencyReserveAmount >= totalContingencyCost
              ? "Fully funded by emergency reserve"
              : "Recommend expanding contingency reserve"}
          </p>
        </div>
      </div>

      {/* Risk Scenarios List */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 sm:p-6 border border-primary-container/10 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">shield</span>
              <h3 className="font-serif text-lg font-bold text-primary">Risk &amp; Contingency Scenarios</h3>
            </div>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Proactive plans to guard against weather, power, schedule, or vendor disruptions.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add_moderator</span>
            <span>+ Add Risk Scenario</span>
          </button>
        </div>

        <div className="space-y-4">
          {event.risks.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">
              <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2 opacity-60" />
              <p className="font-serif text-sm font-bold text-primary">No risk scenarios logged.</p>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">Add potential risks to formulate backup protocols.</p>
            </div>
          ) : (
            event.risks.map((risk) => (
              <div
                key={risk.id}
                className="rounded-xl border border-primary-container/10 bg-surface-container-lowest p-4 sm:p-5 hover:shadow-sm transition-shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-secondary shrink-0" />
                    <h4 className="font-serif font-bold text-base text-primary">{risk.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        risk.likelihood === "high"
                          ? "bg-error/15 text-error"
                          : risk.likelihood === "medium"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      Likelihood: {risk.likelihood}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        risk.impact === "high"
                          ? "bg-error/15 text-error"
                          : risk.impact === "medium"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      Impact: {risk.impact}
                    </span>
                    <button
                      onClick={() => handleDeleteRisk(risk.id)}
                      className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors ml-2"
                      title="Delete Scenario"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{risk.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl bg-surface-container-low p-3 border border-primary-container/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Preventive Measure (Before Event)
                    </span>
                    <p className="font-sans text-xs text-primary leading-snug">{risk.preventiveAction}</p>
                  </div>

                  <div className="rounded-xl bg-surface-container p-3 border border-primary-container/10 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Backup Action Plan
                      </span>
                      {risk.estimatedContingencyCost ? (
                        <span className="text-[11px] font-bold text-secondary">
                          Est. Buffer: {formatINR(risk.estimatedContingencyCost)}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-sans text-xs text-primary leading-snug">{risk.contingencyPlan}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Custom Risk Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Custom Risk Scenario"
        description="Anticipate logistical vulnerabilities and document concrete backup protocols."
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Likelihood
              </label>
              <select
                value={riskForm.likelihood}
                onChange={(e) => setRiskForm({ ...riskForm, likelihood: e.target.value as RiskLevel })}
                className="flex h-11 w-full rounded-xl border border-primary-container/20 bg-surface px-3.5 py-2 text-sm text-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Potential Impact
              </label>
              <select
                value={riskForm.impact}
                onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value as RiskLevel })}
                className="flex h-11 w-full rounded-xl border border-primary-container/20 bg-surface px-3.5 py-2 text-sm text-primary"
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
            placeholder="Actions taken in advance (waterproof German canopy tent on standby)..."
            value={riskForm.preventiveAction}
            onChange={(e) => setRiskForm({ ...riskForm, preventiveAction: e.target.value })}
          />

          <Textarea
            label="Backup Contingency Plan (If it occurs anyway)"
            placeholder="Step-by-step immediate response protocol..."
            value={riskForm.contingencyPlan}
            onChange={(e) => setRiskForm({ ...riskForm, contingencyPlan: e.target.value })}
          />

          <div className="pt-4 flex justify-end space-x-2 border-t border-surface-container">
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

