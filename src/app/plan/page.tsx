"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Palette,
  ChefHat,
  ShieldAlert,
  Loader2,
  Check,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { EventCategory, EventWizardInput, VenueType, FormalityLevel, PlanningStage, DiyLevel } from "@/types/event";
import { formatINR } from "@/lib/utils";
import { StorageService } from "@/services/storageService";

const POPULAR_COLORS = [
  "Crimson Red",
  "Champagne Gold",
  "Deep Plum",
  "Warm Ivory",
  "Rose Pink",
  "Sage Green",
  "Royal Blue",
  "Turmeric Yellow",
  "Terracotta",
];

const FOOD_TAGS = [
  "Authentic Regional Feast",
  "Pure Vegetarian",
  "Gourmet Non-Veg",
  "Live Street Chaat Counter",
  "Jain Options",
  "Multi-Cuisine Buffet",
  "Artisanal Sweet & Dessert Bar",
];

const CULTURAL_REGIONS = [
  "Bengali (Kolkata Tradition)",
  "South Indian (Tamil / Telugu / Kannada / Kerala)",
  "North Indian / Punjabi",
  "Gujarati / Marwari",
  "Pan-Indian Contemporary",
  "Western / Modern Minimalist",
  "Multicultural Fusion",
];

export default function EventWizardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = React.useState<number>(1);
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generationPhase, setGenerationPhase] = React.useState<string>("");

  // Form State with Initial Defaults
  const [formData, setFormData] = React.useState<EventWizardInput>({
    title: "",
    category: "wedding",
    eventDate: "",
    isTentativeDate: false,
    city: "Kolkata",
    venueType: "indoor",
    totalBudget: 800000,
    currency: "INR",
    expectedGuestCount: 250,
    budgetFlexibility: "moderate",
    emergencyReservePct: 10,
    theme: "Heritage Elegance with Warm Lighting",
    preferredColors: ["Crimson Red", "Champagne Gold", "Warm Ivory"],
    culturalRegion: "Bengali (Kolkata Tradition)",
    foodPreferences: ["Authentic Regional Feast", "Live Street Chaat Counter"],
    formality: "traditional_royal",
    accessibilityRequirements: "",
    mustHaves: ["Auspicious Lagna Rituals", "Dedicated Photography Crew"],
    thingsToAvoid: ["Loud commercial music during rituals"],
    planningStage: "just_started",
    diyLevel: "hybrid",
    priorityCategories: ["Catering & Beverages", "Venue & Lawns"],
    sustainabilityPreferences: "Sal leaf plates and donation of surplus meal boxes",
    specialRequirements: "",
  });

  // Load draft from localStorage on mount
  React.useEffect(() => {
    const draft = StorageService.getWizardDraft<EventWizardInput>();
    if (draft && draft.title) {
      setFormData(draft);
      toast({
        type: "info",
        title: "Draft Restored",
        message: `Loaded your in-progress plan for "${draft.title}".`,
      });
    }
  }, [toast]);

  // Save draft whenever formData changes
  React.useEffect(() => {
    if (formData.title || formData.city) {
      StorageService.saveWizardDraft(formData);
    }
  }, [formData]);

  const updateField = <K extends keyof EventWizardInput>(field: K, value: EventWizardInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "preferredColors" | "foodPreferences" | "mustHaves" | "thingsToAvoid", item: string) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast({ type: "error", title: "Event Name Required", message: "Please name your celebration." });
        return false;
      }
      if (!formData.city.trim()) {
        toast({ type: "error", title: "City Required", message: "Please enter your event city/location." });
        return false;
      }
      if (!formData.isTentativeDate && !formData.eventDate) {
        toast({ type: "error", title: "Date Required", message: "Select an event date or mark it as tentative." });
        return false;
      }
    } else if (currentStep === 2) {
      if (formData.totalBudget < 5000) {
        toast({ type: "error", title: "Invalid Budget", message: "Budget must be at least ₹5,000." });
        return false;
      }
      if (formData.expectedGuestCount < 5) {
        toast({ type: "error", title: "Guest Count", message: "Must have at least 5 guests." });
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.theme.trim()) {
        toast({ type: "error", title: "Theme Required", message: "Please describe your celebration theme." });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(5, prev + 1));
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Submit and Generate Plan via API
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGenerationPhase("Synthesizing ceremony traditions and deterministic budget allocations...");

    try {
      const timer1 = setTimeout(() => {
        setGenerationPhase("Sequencing preparation timeline milestones and vendor evaluation criteria...");
      }, 700);

      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      clearTimeout(timer1);
      const data = await res.json();

      if (!data.success || !data.plan) {
        throw new Error(data.error || "Failed to generate plan");
      }

      // Save generated plan to persistence layer
      StorageService.saveEvent(data.plan);
      StorageService.clearWizardDraft();

      toast({
        type: "success",
        title: "Event Plan Ready!",
        message: `Plan generated via ${data.providerUsed}.`,
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Plan generation error:", err);
      toast({
        type: "error",
        title: "Synthesis Error",
        message: err.message || "Failed to generate plan. Please try again.",
      });
      setIsGenerating(false);
    }
  };

  const progressPercent = Math.round((step / 5) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Wizard Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
              Step {step} of 5 • {step === 1 && "Event Basics"}
              {step === 2 && "Budget & Guests"}
              {step === 3 && "Theme & Cultural Preferences"}
              {step === 4 && "Planning Preferences"}
              {step === 5 && "Review & Synthesize"}
            </span>
            <span className="text-xs font-semibold text-[#5E4B66]">{progressPercent}% Completed</span>
          </div>
          <ProgressBar value={progressPercent} variant="plum" />
        </div>

        {/* Wizard Step Cards */}
        <Card className="border border-[#E5D5B5] shadow-lg p-6 sm:p-8 rounded-3xl bg-white relative">
          {/* STEP 1: EVENT BASICS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="border-b border-[#FAF0F3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#22092C]">Tell us about your celebration</h2>
                <p className="mt-1 text-sm text-[#5E4B66]">Start with the foundational details of the event.</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Event Name *"
                  placeholder="e.g., A Royal Bengali Wedding: Sourav & Debolina"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                      Event Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateField("category", e.target.value as EventCategory)}
                      className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C] focus:border-[#3B1242] focus:outline-none focus:ring-2 focus:ring-[#3B1242]/20"
                    >
                      <option value="wedding">Wedding Celebration</option>
                      <option value="birthday">Milestone Birthday</option>
                      <option value="anniversary">Anniversary Celebration</option>
                      <option value="college_fest">College Festival</option>
                      <option value="community">Community Gathering / Puja</option>
                      <option value="corporate">Corporate Gala / Meet</option>
                      <option value="other">Other Celebration</option>
                    </select>
                  </div>

                  <div>
                    <Input
                      label="City & Location *"
                      placeholder="e.g., Kolkata, West Bengal"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <Input
                      label="Event Date"
                      type="date"
                      value={formData.eventDate}
                      disabled={formData.isTentativeDate}
                      onChange={(e) => updateField("eventDate", e.target.value)}
                      helperText={formData.isTentativeDate ? "Date is marked tentative" : "Select target date"}
                    />
                  </div>

                  <div className="pt-5 flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      id="tentativeDate"
                      checked={formData.isTentativeDate}
                      onChange={(e) => updateField("isTentativeDate", e.target.checked)}
                      className="h-4 w-4 rounded accent-[#3B1242] cursor-pointer"
                    />
                    <label htmlFor="tentativeDate" className="text-sm font-medium text-[#22092C] cursor-pointer">
                      Date is tentative / not yet locked
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                    Venue Setting
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["indoor", "outdoor", "undecided"] as VenueType[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => updateField("venueType", v)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                          formData.venueType === v
                            ? "bg-[#3B1242] text-white border-[#3B1242] shadow-sm"
                            : "bg-white text-[#5E4B66] border-[#E5D5B5] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUDGET & ATTENDANCE */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="border-b border-[#FAF0F3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#22092C]">Budget &amp; Attendance</h2>
                <p className="mt-1 text-sm text-[#5E4B66]">
                  Set realistic financial boundaries. Our engine allocates amounts with deterministic precision.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">
                      Total Budget (INR) *
                    </label>
                    <span className="font-bold text-lg text-[#3B1242]">{formatINR(formData.totalBudget)}</span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={5000000}
                    step={25000}
                    value={formData.totalBudget}
                    onChange={(e) => updateField("totalBudget", Number(e.target.value))}
                    className="w-full accent-[#3B1242] cursor-pointer mb-2"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#7A6B80]">Or enter exact amount:</span>
                    <input
                      type="number"
                      min={5000}
                      value={formData.totalBudget}
                      onChange={(e) => updateField("totalBudget", Number(e.target.value))}
                      className="w-36 rounded-lg border border-[#E5D5B5] px-2.5 py-1 text-xs font-semibold text-[#22092C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66]">
                        Expected Guests *
                      </label>
                      <span className="font-bold text-sm text-[#22092C]">{formData.expectedGuestCount} people</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={1200}
                      step={10}
                      value={formData.expectedGuestCount}
                      onChange={(e) => updateField("expectedGuestCount", Number(e.target.value))}
                      className="w-full accent-[#C5A059] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                      Budget Flexibility
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["strict", "moderate", "flexible"] as const).map((flex) => (
                        <button
                          key={flex}
                          type="button"
                          onClick={() => updateField("budgetFlexibility", flex)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                            formData.budgetFlexibility === flex
                              ? "bg-[#C5A059] text-white border-[#C5A059]"
                              : "bg-white text-[#5E4B66] border-[#E5D5B5] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          {flex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Emergency Reserve Preference */}
                <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#E5D5B5]/60">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#B33951] flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> Emergency Contingency Reserve
                    </label>
                    <span className="font-bold text-sm text-[#B33951]">
                      {formData.emergencyReservePct}% ({formatINR(Math.round((formData.totalBudget * formData.emergencyReservePct) / 100))})
                    </span>
                  </div>
                  <p className="text-xs text-[#5E4B66] mb-2">
                    Protects you against last-minute headcount surges, rain covers, or generator fuel without exceeding your total budget ceiling.
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={1}
                    value={formData.emergencyReservePct}
                    onChange={(e) => updateField("emergencyReservePct", Number(e.target.value))}
                    className="w-full accent-[#B33951] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES & CULTURAL NUANCES */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="border-b border-[#FAF0F3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#22092C]">Theme, Atmosphere &amp; Traditions</h2>
                <p className="mt-1 text-sm text-[#5E4B66]">
                  Configure your aesthetic vision and cultural context.
                </p>
              </div>

              <div className="space-y-5">
                <Input
                  label="Event Theme & Concept *"
                  placeholder="e.g., Traditional Bengali Elegance with Warm Amber Fairy Lights"
                  value={formData.theme}
                  onChange={(e) => updateField("theme", e.target.value)}
                />

                {/* Cultural Tradition Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                    Cultural / Regional Tradition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CULTURAL_REGIONS.map((region) => (
                      <button
                        key={region}
                        type="button"
                        onClick={() => updateField("culturalRegion", region)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          formData.culturalRegion === region
                            ? "bg-[#3B1242] text-white border-[#3B1242] shadow-xs"
                            : "bg-white text-[#5E4B66] border-[#E5D5B5] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palette Tags */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                    Preferred Color Palette
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_COLORS.map((col) => {
                      const isSelected = formData.preferredColors.includes(col);
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => toggleArrayItem("preferredColors", col)}
                          className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#FAF0F3] text-[#B33951] border-[#D95B72] font-semibold"
                              : "bg-white text-[#5E4B66] border-[#EADBDF] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          <span>{col}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Food Preferences */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                    Catering &amp; Cuisine Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FOOD_TAGS.map((tag) => {
                      const isSelected = formData.foodPreferences.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleArrayItem("foodPreferences", tag)}
                          className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#FAF4E6] text-[#8C6D23] border-[#C5A059] font-semibold"
                              : "bg-white text-[#5E4B66] border-[#E5D5B5] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Formality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                      Atmosphere &amp; Formality
                    </label>
                    <select
                      value={formData.formality}
                      onChange={(e) => updateField("formality", e.target.value as FormalityLevel)}
                      className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C] focus:border-[#3B1242] focus:outline-none"
                    >
                      <option value="traditional_royal">Traditional Royal / Cultural Grandeur</option>
                      <option value="formal">Black-Tie / High Formal</option>
                      <option value="semi_formal">Semi-Formal &amp; Elegant</option>
                      <option value="casual">Casual &amp; Relaxed Social</option>
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Accessibility Notes"
                      placeholder="e.g. Ground floor seating / wheelchair ramp"
                      value={formData.accessibilityRequirements}
                      onChange={(e) => updateField("accessibilityRequirements", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PLANNING PREFERENCES */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="border-b border-[#FAF0F3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#22092C]">Planning Approach &amp; Guardrails</h2>
                <p className="mt-1 text-sm text-[#5E4B66]">Define how much professional help you want and what matters most.</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                      Current Planning Stage
                    </label>
                    <select
                      value={formData.planningStage}
                      onChange={(e) => updateField("planningStage", e.target.value as PlanningStage)}
                      className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
                    >
                      <option value="just_started">Just Started (Idea Stage)</option>
                      <option value="venue_booked">Venue Booked, Need Rest</option>
                      <option value="halfway">Halfway Through Planning</option>
                      <option value="last_month">Final 30-Day Sprint</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                      DIY vs Professional Support
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["full_diy", "hybrid", "full_pro"] as DiyLevel[]).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => updateField("diyLevel", level)}
                          className={`py-2 px-1 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer text-center ${
                            formData.diyLevel === level
                              ? "bg-[#3B1242] text-white border-[#3B1242]"
                              : "bg-white text-[#5E4B66] border-[#E5D5B5] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          {level.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Textarea
                  label="Sustainability Preferences & Guidelines"
                  placeholder="e.g. Biodegradable plates, no single-use plastics, digital QR menu, donate surplus food"
                  value={formData.sustainabilityPreferences}
                  onChange={(e) => updateField("sustainabilityPreferences", e.target.value)}
                />

                <Textarea
                  label="Special Requirements / Family Traditions"
                  placeholder="e.g. Brother carrying bride on wooden piri, special morning Shehnai players, late-night reception"
                  value={formData.specialRequirements}
                  onChange={(e) => updateField("specialRequirements", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SYNTHESIS */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="border-b border-[#FAF0F3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#22092C]">Review Your Event Blueprint</h2>
                <p className="mt-1 text-sm text-[#5E4B66]">
                  Inspect your configuration before our engine compiles your comprehensive event plan.
                </p>
              </div>

              {/* Review Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#E5D5B5] bg-[#FAF8F5] p-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">Event Basics</span>
                    <button onClick={() => setStep(1)} className="text-xs text-[#3B1242] hover:underline flex items-center gap-1 cursor-pointer">
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                  <p className="font-serif font-bold text-base text-[#22092C]">{formData.title}</p>
                  <p className="text-xs text-[#5E4B66]">
                    Category: <span className="font-semibold text-[#22092C] capitalize">{formData.category.replace("_", " ")}</span>
                  </p>
                  <p className="text-xs text-[#5E4B66]">
                    City: <span className="font-semibold text-[#22092C]">{formData.city}</span> ({formData.venueType})
                  </p>
                  <p className="text-xs text-[#5E4B66]">
                    Date: <span className="font-semibold text-[#22092C]">{formData.isTentativeDate ? "Tentative Date" : formData.eventDate}</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5D5B5] bg-[#FAF8F5] p-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">Budget &amp; Guests</span>
                    <button onClick={() => setStep(2)} className="text-xs text-[#3B1242] hover:underline flex items-center gap-1 cursor-pointer">
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                  <p className="font-bold text-lg text-[#3B1242]">{formatINR(formData.totalBudget)}</p>
                  <p className="text-xs text-[#5E4B66]">
                    Expected Guests: <span className="font-semibold text-[#22092C]">{formData.expectedGuestCount} people</span>
                  </p>
                  <p className="text-xs text-[#B33951] font-semibold">
                    Emergency Reserve ({formData.emergencyReservePct}%): {formatINR(Math.round((formData.totalBudget * formData.emergencyReservePct) / 100))}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5D5B5] bg-[#FAF8F5] p-4 space-y-2.5 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">Atmosphere &amp; Culture</span>
                    <button onClick={() => setStep(3)} className="text-xs text-[#3B1242] hover:underline flex items-center gap-1 cursor-pointer">
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#5E4B66]">
                    Theme: <span className="font-semibold text-[#22092C]">{formData.theme}</span>
                  </p>
                  <p className="text-xs text-[#5E4B66]">
                    Cultural Tradition: <span className="font-semibold text-[#22092C]">{formData.culturalRegion}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.preferredColors.map((c) => (
                      <Badge key={c} variant="rose" className="text-[10px]">
                        {c}
                      </Badge>
                    ))}
                    {formData.foodPreferences.map((f) => (
                      <Badge key={f} variant="gold" className="text-[10px]">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loading animation state if generating */}
              {isGenerating ? (
                <div className="rounded-2xl border border-[#C5A059] bg-[#FAF4E6]/50 p-6 text-center space-y-3 animate-pulse">
                  <Loader2 className="h-8 w-8 text-[#C5A059] animate-spin mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-[#22092C]">Generating Your Event Plan</h4>
                  <p className="text-xs text-[#8C6D23] max-w-md mx-auto">{generationPhase}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-[#FAF0F3] flex items-center justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isGenerating} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="gap-2">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="gold"
                size="lg"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="gap-2 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate My Plan</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
