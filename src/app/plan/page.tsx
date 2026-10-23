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
  Bookmark,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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

const CELEBRATION_TYPES = [
  {
    type: "wedding" as EventCategory,
    title: "Wedding",
    subtitle: "Multiday / Traditional",
    icon: "favorite",
  },
  {
    type: "birthday" as EventCategory,
    title: "Birthday",
    subtitle: "Milestone soirée",
    icon: "cake",
  },
  {
    type: "anniversary" as EventCategory,
    title: "Anniversary",
    subtitle: "Jubilee & renewal",
    icon: "wine_bar",
  },
  {
    type: "community" as EventCategory,
    title: "Community",
    subtitle: "Utsav & gathering",
    icon: "groups",
  },
  {
    type: "college_fest" as EventCategory,
    title: "College Fest",
    subtitle: "Cultural summit",
    icon: "celebration",
  },
  {
    type: "other" as EventCategory,
    title: "Other",
    subtitle: "Custom occasion",
    icon: "auto_awesome",
  },
];

export default function EventWizardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = React.useState<number>(1);
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generationPhase, setGenerationPhase] = React.useState<string>("");
  const [expandedAccordion, setExpandedAccordion] = React.useState<number | null>(null);

  // Form State with Initial Defaults
  const [formData, setFormData] = React.useState<EventWizardInput>({
    title: "Bengali Wedding Celebration - Ananya & Rohan",
    category: "wedding",
    eventDate: "2025-12-12",
    isTentativeDate: false,
    city: "Kolkata, West Bengal",
    venueType: "indoor",
    totalBudget: 800000,
    currency: "INR",
    expectedGuestCount: 300,
    budgetFlexibility: "moderate",
    emergencyReservePct: 10,
    theme: "Heritage Rajbari Elegance with Ambient Amber Lighting",
    preferredColors: ["Crimson Red", "Champagne Gold", "Warm Ivory"],
    culturalRegion: "Bengali (Kolkata Tradition)",
    foodPreferences: ["Authentic Regional Feast", "Live Street Chaat Counter"],
    formality: "traditional_royal",
    accessibilityRequirements: "Ground floor access & wheelchair ramps",
    mustHaves: ["Auspicious Shehnai Ensemble", "Floral Rajnigandha Mandap", "Candid Photojournalism Duo"],
    thingsToAvoid: ["Loud commercial DJ music during Saat Paake Ghaura"],
    planningStage: "just_started",
    diyLevel: "hybrid",
    priorityCategories: ["Catering & Beverages", "Venue & Lawns"],
    sustainabilityPreferences: "Sal leaf plates and donation of surplus meal boxes to local shelter",
    specialRequirements: "Authentic Gaye Holud brass urli setup with fresh marigold strings",
  });

  // Load draft from localStorage on mount
  React.useEffect(() => {
    const draft = StorageService.getWizardDraft<EventWizardInput>();
    if (draft && draft.title) {
      setFormData(draft);
    }
  }, []);

  // Save draft whenever formData changes
  React.useEffect(() => {
    if (formData.title || formData.city) {
      StorageService.saveWizardDraft(formData);
    }
  }, [formData]);

  const updateField = <K extends keyof EventWizardInput>(field: K, value: EventWizardInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (
    field: "preferredColors" | "foodPreferences" | "mustHaves" | "thingsToAvoid",
    item: string
  ) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const handleManualSaveDraft = () => {
    StorageService.saveWizardDraft(formData);
    toast({
      type: "success",
      title: "Draft Saved",
      message: `Your draft for "${formData.title || "Celebration"}" has been persisted.`,
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface">
      <Navbar />

      <main className="flex-1 flex flex-col relative w-full bg-surface pb-32">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
          {/* Top Progress & Header Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-xs text-secondary uppercase tracking-widest font-semibold">
                  Step {step} of 5
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="font-label-sm text-xs text-on-surface-variant font-medium">
                  {step === 1 && "Event Basics"}
                  {step === 2 && "Budget & Guests"}
                  {step === 3 && "Theme & Traditions"}
                  {step === 4 && "Planning Guardrails"}
                  {step === 5 && "Review & Synthesis"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleManualSaveDraft}
                className="flex items-center gap-1 font-label-md text-xs text-secondary hover:text-primary transition-colors py-1 px-2.5 rounded-lg bg-surface-container-low cursor-pointer"
              >
                <Bookmark className="h-3 w-3" />
                <span>Save Draft</span>
              </button>
            </div>

            {/* Stepper Indicator Dots */}
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    s <= step ? "bg-primary-container" : "bg-surface-variant"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: EVENT BASICS */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-in fade-in-50">
              {/* Editorial Headline */}
              <div className="pt-1">
                <h1 className="font-headline-lg-mobile sm:font-headline-lg text-primary tracking-tight">
                  Let’s shape your milestone.
                </h1>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Begin crafting your bespoke itinerary and intelligent vendor blueprint.
                </p>
              </div>

              {/* Field 1: Event Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-title-md text-sm text-primary flex items-center justify-between">
                  <span>Celebration Name</span>
                  <span className="font-label-sm text-[10px] text-secondary-fixed-dim bg-primary-container px-2 py-0.5 rounded-full tracking-wide">
                    REQUIRED
                  </span>
                </label>
                <div className="relative bg-surface-container-lowest rounded-xl shadow-xs border border-primary-container/10 p-1">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g., Ananya & Rohan's Vivaha"
                    className="w-full bg-transparent px-3 py-2 font-body-lg text-sm text-primary focus:outline-none placeholder:text-outline"
                  />
                </div>
              </div>

              {/* Field 2: Event Type Matrix */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <label className="font-title-md text-sm text-primary font-semibold">Celebration Type</label>
                  <span className="font-label-sm text-xs text-on-surface-variant">Select format</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CELEBRATION_TYPES.map((cat) => {
                    const isSelected = formData.category === cat.type;
                    return (
                      <button
                        key={cat.type}
                        type="button"
                        onClick={() => updateField("category", cat.type)}
                        className={`text-left p-3.5 rounded-xl flex items-start justify-between shadow-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary-container text-on-primary shadow-md"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-primary-container/8"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span
                            className={`material-symbols-outlined text-lg ${
                              isSelected ? "text-secondary-container" : "text-secondary"
                            }`}
                          >
                            {cat.icon}
                          </span>
                          <span
                            className={`font-title-md text-sm font-semibold ${
                              isSelected ? "text-surface-container-lowest" : "text-primary"
                            }`}
                          >
                            {cat.title}
                          </span>
                          <span
                            className={`font-label-sm text-[11px] ${
                              isSelected ? "text-primary-fixed-dim" : "text-on-surface-variant"
                            }`}
                          >
                            {cat.subtitle}
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="material-symbols-outlined text-secondary-fixed text-lg">check_circle</span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-surface-variant shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Date & Flexibility */}
              <div className="flex flex-col gap-2">
                <label className="font-title-md text-sm text-primary font-semibold">Target Date</label>
                <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-primary-container/10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <Calendar className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-label-sm text-xs text-on-surface-variant">Auspicious Day</span>
                      <input
                        type="date"
                        value={formData.eventDate}
                        disabled={formData.isTentativeDate}
                        onChange={(e) => updateField("eventDate", e.target.value)}
                        className="bg-transparent font-title-md text-sm text-primary font-semibold focus:outline-none"
                      />
                    </div>
                    <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                      Lagna Active
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">date_range</span>
                      <span className="font-body-sm text-xs text-on-surface">Date is flexible (± 3 days)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("isTentativeDate", !formData.isTentativeDate)}
                      className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
                        formData.isTentativeDate
                          ? "bg-primary-container justify-end"
                          : "bg-surface-variant justify-start"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full shadow-xs block ${
                          formData.isTentativeDate ? "bg-secondary-fixed" : "bg-surface-container-lowest"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Field 4: Location & Venue Ambience */}
              <div className="flex flex-col gap-2">
                <label className="font-title-md text-sm text-primary font-semibold">City &amp; Venue Setting</label>
                <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-primary-container/10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <MapPin className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-label-sm text-xs text-on-surface-variant">Hub Location</span>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="e.g. Kolkata, West Bengal"
                        className="bg-transparent font-title-md text-sm text-primary font-semibold focus:outline-none"
                      />
                    </div>
                    <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                      IN
                    </span>
                  </div>

                  {/* Venue Chips */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-label-sm text-xs text-on-surface-variant">Preferred Environment</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["indoor", "outdoor", "undecided"] as VenueType[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => updateField("venueType", v)}
                          className={`py-2 px-2.5 rounded-lg font-label-md text-xs text-center transition-all flex items-center justify-center gap-1 cursor-pointer capitalize ${
                            formData.venueType === v
                              ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                              : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {v === "indoor" ? "apartment" : v === "outdoor" ? "park" : "help_center"}
                          </span>
                          <span>{v}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editorial Inspiration Vignette */}
              <div className="relative rounded-xl overflow-hidden shadow-sm bg-primary-container text-on-primary p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[11px] text-secondary-container tracking-wider uppercase font-semibold">
                    AI Pre-Curation Note
                  </span>
                  <span className="material-symbols-outlined text-secondary-container text-base">auto_awesome</span>
                </div>
                <p className="font-headline-sm text-base text-surface-container-lowest leading-snug">
                  Kolkata in mid-December offers pleasant 18°C evenings—ideal for royal silk drape attire and courtyard Shehnai acoustics.
                </p>
                <span className="font-label-sm text-xs text-primary-fixed-dim">
                  Heritage Rajbari &amp; 5-Star Banquet matrices ready.
                </span>
              </div>

              {/* Forward Steps Accordion Previews (Interactive Inspection) */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-sm text-primary font-semibold">Upcoming Stages</span>
                  <span className="font-label-sm text-xs text-secondary">Tap to preview specs</span>
                </div>

                {/* Stage 2 Accordion */}
                <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-primary-container/8 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedAccordion(expandedAccordion === 2 ? null : 2)}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-label-sm text-xs font-bold text-primary">
                        2
                      </span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-sm text-primary font-semibold">Budget &amp; Guest Count</span>
                        <span className="font-label-sm text-xs text-on-surface-variant">₹8,00,000 INR • 300 Guests • 10% Contingency</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-secondary transition-transform ${
                        expandedAccordion === 2 ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedAccordion === 2 && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-on-surface-variant bg-surface-container-low rounded-b-xl space-y-1.5">
                      <div className="flex justify-between">
                        <span>Catering &amp; Feast:</span>
                        <span className="font-semibold text-primary">₹2,40,000 (30%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Venue &amp; Banquets:</span>
                        <span className="font-semibold text-primary">₹1,84,000 (23%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency Contingency Reserve:</span>
                        <span className="font-semibold text-secondary">₹80,000 (10%)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage 3 Accordion */}
                <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-primary-container/8 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedAccordion(expandedAccordion === 3 ? null : 3)}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-label-sm text-xs font-bold text-primary">
                        3
                      </span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-sm text-primary font-semibold">Theme &amp; Culinary Style</span>
                        <span className="font-label-sm text-xs text-on-surface-variant">Traditional Bengali • Crimson &amp; Champagne</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-secondary transition-transform ${
                        expandedAccordion === 3 ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedAccordion === 3 && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-on-surface-variant bg-surface-container-low rounded-b-xl space-y-1.5">
                      <p>
                        Curated 8-course Bengali Gourmet banquet: Bhetki Paturi, Basanti Pulao, Chingri Malai Curry, and authentic Mishti Dohi counters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUDGET & GUESTS */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-in fade-in-50">
              <div className="pt-1">
                <h2 className="font-headline-lg-mobile sm:font-headline-lg text-primary tracking-tight">
                  Budget &amp; Attendance
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Set realistic financial boundaries. Our engine allocates amounts with deterministic precision.
                </p>
              </div>

              {/* Budget Slider */}
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-primary-container/10 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-title-md text-sm text-primary font-semibold">Total Target Budget</span>
                  <span className="font-headline-sm text-xl text-primary font-bold">{formatINR(formData.totalBudget)}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={5000000}
                  step={25000}
                  value={formData.totalBudget}
                  onChange={(e) => updateField("totalBudget", Number(e.target.value))}
                  className="w-full accent-primary-container cursor-pointer"
                />
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-label-sm text-xs text-on-surface-variant">Or enter exact sum:</span>
                  <input
                    type="number"
                    min={5000}
                    value={formData.totalBudget}
                    onChange={(e) => updateField("totalBudget", Number(e.target.value))}
                    className="w-36 rounded-lg border border-primary-container/20 px-2.5 py-1 text-xs font-semibold text-primary bg-surface-container-low focus:outline-none"
                  />
                </div>
              </div>

              {/* Guest Count & Flexibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-primary-container/10 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-title-md text-sm text-primary font-semibold">Expected Guests</span>
                    <span className="font-title-md text-sm font-bold text-secondary">{formData.expectedGuestCount} people</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={1200}
                    step={10}
                    value={formData.expectedGuestCount}
                    onChange={(e) => updateField("expectedGuestCount", Number(e.target.value))}
                    className="w-full accent-secondary cursor-pointer mt-1"
                  />
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-primary-container/10 flex flex-col gap-2">
                  <span className="font-title-md text-sm text-primary font-semibold">Budget Elasticity</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {(["strict", "moderate", "flexible"] as const).map((flex) => (
                      <button
                        key={flex}
                        type="button"
                        onClick={() => updateField("budgetFlexibility", flex)}
                        className={`py-2 px-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer text-center ${
                          formData.budgetFlexibility === flex
                            ? "bg-secondary-container text-on-secondary-container shadow-xs font-bold"
                            : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        {flex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contingency Reserve Card */}
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-primary-container/10 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-title-md text-sm text-primary font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-secondary" />
                    Emergency Contingency Reserve ({formData.emergencyReservePct}%)
                  </span>
                  <span className="font-title-md text-sm font-bold text-secondary">
                    {formatINR(Math.round((formData.totalBudget * formData.emergencyReservePct) / 100))}
                  </span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Automatically set aside as an unallocated safety cushion for unexpected guest surges, generator fuel, or weather backups.
                </p>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={formData.emergencyReservePct}
                  onChange={(e) => updateField("emergencyReservePct", Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer mt-1"
                />
              </div>
            </div>
          )}

          {/* STEP 3: THEME & TRADITIONS */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-in fade-in-50">
              <div className="pt-1">
                <h2 className="font-headline-lg-mobile sm:font-headline-lg text-primary tracking-tight">
                  Theme, Atmosphere &amp; Traditions
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Configure your aesthetic vision and cultural context.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-title-md text-sm text-primary font-semibold">Event Theme &amp; Concept</label>
                <div className="bg-surface-container-lowest p-1 rounded-xl shadow-xs border border-primary-container/10">
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => updateField("theme", e.target.value)}
                    placeholder="e.g., Traditional Bengali Elegance with Warm Amber Fairy Lights"
                    className="w-full bg-transparent px-3 py-2 font-body-md text-sm text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Cultural Tradition Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-title-md text-sm text-primary font-semibold">Cultural / Regional Tradition</label>
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_REGIONS.map((region) => {
                    const isSelected = formData.culturalRegion === region;
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => updateField("culturalRegion", region)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-primary-container/8"
                        }`}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Tags */}
              <div className="flex flex-col gap-2">
                <label className="font-title-md text-sm text-primary font-semibold">Preferred Color Palette</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_COLORS.map((col) => {
                    const isSelected = formData.preferredColors.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => toggleArrayItem("preferredColors", col)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-secondary-container text-on-secondary-container font-semibold shadow-xs"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-primary-container/8"
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
              <div className="flex flex-col gap-2">
                <label className="font-title-md text-sm text-primary font-semibold">Catering &amp; Cuisine Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {FOOD_TAGS.map((tag) => {
                    const isSelected = formData.foodPreferences.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleArrayItem("foodPreferences", tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-primary-container/8"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PLANNING PREFERENCES */}
          {step === 4 && (
            <div className="flex flex-col gap-5 animate-in fade-in-50">
              <div className="pt-1">
                <h2 className="font-headline-lg-mobile sm:font-headline-lg text-primary tracking-tight">
                  Planning Approach &amp; Guardrails
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Define how much professional help you want and what matters most.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-title-md text-sm text-primary font-semibold">Current Planning Stage</label>
                  <select
                    value={formData.planningStage}
                    onChange={(e) => updateField("planningStage", e.target.value as PlanningStage)}
                    className="h-11 rounded-xl border border-primary-container/15 bg-surface-container-lowest px-3 py-2 text-xs font-medium text-primary focus:outline-none"
                  >
                    <option value="just_started">Just Started (Idea Stage)</option>
                    <option value="venue_booked">Venue Booked, Need Rest</option>
                    <option value="halfway">Halfway Through Planning</option>
                    <option value="last_month">Final 30-Day Sprint</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-title-md text-sm text-primary font-semibold">DIY vs Professional Support</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["full_diy", "hybrid", "full_pro"] as DiyLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateField("diyLevel", level)}
                        className={`h-11 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer text-center ${
                          formData.diyLevel === level
                            ? "bg-primary-container text-on-primary font-bold shadow-xs"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-primary-container/8"
                        }`}
                      >
                        {level.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-title-md text-sm text-primary font-semibold">Sustainability Guidelines</label>
                <div className="bg-surface-container-lowest p-1 rounded-xl shadow-xs border border-primary-container/10">
                  <textarea
                    rows={2}
                    value={formData.sustainabilityPreferences}
                    onChange={(e) => updateField("sustainabilityPreferences", e.target.value)}
                    placeholder="e.g. Biodegradable plates, no single-use plastics, digital QR menu"
                    className="w-full bg-transparent px-3 py-2 font-body-md text-xs text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-title-md text-sm text-primary font-semibold">Special Family Traditions</label>
                <div className="bg-surface-container-lowest p-1 rounded-xl shadow-xs border border-primary-container/10">
                  <textarea
                    rows={2}
                    value={formData.specialRequirements}
                    onChange={(e) => updateField("specialRequirements", e.target.value)}
                    placeholder="e.g. Brother carrying bride on wooden piri, special morning Shehnai players"
                    className="w-full bg-transparent px-3 py-2 font-body-md text-xs text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SYNTHESIS */}
          {step === 5 && (
            <div className="flex flex-col gap-5 animate-in fade-in-50">
              <div className="pt-1">
                <h2 className="font-headline-lg-mobile sm:font-headline-lg text-primary tracking-tight">
                  Review Your Event Blueprint
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Inspect your configuration before our engine compiles your comprehensive event plan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-primary-container/10 bg-surface-container-lowest p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-secondary">
                      Event Basics
                    </span>
                    <button
                      onClick={() => setStep(1)}
                      className="font-label-sm text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                  <p className="font-headline-sm text-base text-primary font-bold">{formData.title}</p>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Category: <span className="font-semibold text-primary capitalize">{formData.category.replace("_", " ")}</span>
                  </p>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    City: <span className="font-semibold text-primary">{formData.city}</span> ({formData.venueType})
                  </p>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Date: <span className="font-semibold text-primary">{formData.isTentativeDate ? "Tentative Date" : formData.eventDate}</span>
                  </p>
                </div>

                <div className="rounded-xl border border-primary-container/10 bg-surface-container-lowest p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-secondary">
                      Budget &amp; Guests
                    </span>
                    <button
                      onClick={() => setStep(2)}
                      className="font-label-sm text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                  <p className="font-headline-sm text-xl text-primary font-bold">{formatINR(formData.totalBudget)}</p>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Expected Guests: <span className="font-semibold text-primary">{formData.expectedGuestCount} people</span>
                  </p>
                  <p className="font-body-sm text-xs text-secondary font-semibold">
                    Reserve Buffer ({formData.emergencyReservePct}%): {formatINR(Math.round((formData.totalBudget * formData.emergencyReservePct) / 100))}
                  </p>
                </div>

                <div className="rounded-xl border border-primary-container/10 bg-surface-container-lowest p-4 space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-secondary">
                      Atmosphere &amp; Culture
                    </span>
                    <button
                      onClick={() => setStep(3)}
                      className="font-label-sm text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Theme: <span className="font-semibold text-primary">{formData.theme}</span>
                  </p>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Cultural Tradition: <span className="font-semibold text-primary">{formData.culturalRegion}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.preferredColors.map((c) => (
                      <span key={c} className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-primary font-medium">
                        {c}
                      </span>
                    ))}
                    {formData.foodPreferences.map((f) => (
                      <span key={f} className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generating Animation State */}
              {isGenerating && (
                <div className="rounded-xl border border-secondary/30 bg-secondary-container/40 p-6 text-center space-y-3 animate-pulse">
                  <Loader2 className="h-8 w-8 text-secondary animate-spin mx-auto" />
                  <h4 className="font-headline-sm text-lg text-primary font-bold">Synthesizing Your Celebration Plan</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-md mx-auto">{generationPhase}</p>
                </div>
              )}
            </div>
          )}

          {/* Transparency & Accuracy Disclaimer Card */}
          <div className="bg-surface-container p-3.5 rounded-xl flex items-start gap-2.5 text-on-surface-variant mt-2">
            <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">info</span>
            <p className="font-body-sm text-xs leading-relaxed">
              <strong>Demonstration Figures:</strong> AI-generated prices, allocations, and capacity estimates are simulated recommendations. Exact vendor prices will be verified through real-time quotes upon plan publication.
            </p>
          </div>
        </div>

        {/* Persistent Floating Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md px-4 sm:px-6 py-3 border-t border-primary-container/10 shadow-xl">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isGenerating}
                className="py-3 px-4 rounded-xl bg-surface-container text-primary font-label-md text-xs font-semibold hover:bg-surface-variant active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleManualSaveDraft}
                className="py-3 px-4 rounded-xl bg-surface-container text-primary font-label-md text-xs font-semibold hover:bg-surface-variant active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Bookmark className="h-4 w-4 text-secondary" />
                <span>Save Draft</span>
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-3 px-4 rounded-xl bg-primary-container text-on-primary font-label-md text-xs font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all flex-1 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>
                  {step === 1 && "Continue to Budget & Guests"}
                  {step === 2 && "Continue to Theme & Traditions"}
                  {step === 3 && "Continue to Planning Guardrails"}
                  {step === 4 && "Review Plan Blueprint"}
                </span>
                <span className="material-symbols-outlined text-base text-secondary-fixed transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="py-3 px-6 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex-1 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Plan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    <span>Generate My Personalized Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
