import { z } from "zod";

// --- Enums and Constants ---
export type EventCategory =
  | "wedding"
  | "birthday"
  | "anniversary"
  | "community"
  | "college_fest"
  | "corporate"
  | "other";

export type VenueType = "indoor" | "outdoor" | "undecided";

export type BudgetFlexibility = "strict" | "moderate" | "flexible";

export type FormalityLevel = "casual" | "semi_formal" | "formal" | "traditional_royal";

export type PlanningStage = "just_started" | "venue_booked" | "halfway" | "last_month";

export type DiyLevel = "full_diy" | "hybrid" | "full_pro";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskStatus = "todo" | "in_progress" | "completed";

export type ExpenseStatus = "planned" | "quoted" | "committed" | "paid";

export type VendorStatus =
  | "researching"
  | "contacted"
  | "quoted"
  | "shortlisted"
  | "booked"
  | "declined";

export type RiskLevel = "low" | "medium" | "high";

// --- Expense & Budget Categories ---
export interface ExpenseItem {
  id: string;
  categoryId: string;
  name: string;
  estimatedCost: number;
  committedCost: number;
  actualCost: number;
  status: ExpenseStatus;
  isEssential: boolean;
  notes?: string;
  vendorId?: string;
}

export interface BudgetCategoryAllocation {
  id: string;
  name: string;
  percentage: number; // e.g. 25 for 25%
  allocatedAmount: number;
  estimatedTotal: number;
  committedTotal: number;
  actualTotal: number;
  color: string;
  iconName: string;
  description: string;
}

// --- Tasks ---
export interface EventTask {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  relativeOffsetDays?: number; // Days before event (e.g. -90)
  priority: TaskPriority;
  status: TaskStatus;
  relatedCategory?: string;
  dependencies?: string[]; // IDs of tasks that must be done first
  notes?: string;
  assignedTo?: string;
  isCustom?: boolean;
}

// --- Vendors ---
export interface VendorItem {
  id: string;
  name: string;
  category: string;
  location: string;
  contactPhone?: string;
  contactEmail?: string;
  quotedPrice: number;
  status: VendorStatus;
  rating?: number; // 1 to 5
  notes?: string;
  pros?: string[];
  cons?: string[];
  followUpDate?: string;
  questionsToAsk?: string[];
  isSample?: boolean;
}

// --- Risks ---
export interface RiskScenario {
  id: string;
  title: string;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  preventiveAction: string;
  contingencyPlan: string;
  estimatedContingencyCost?: number;
}

// --- AI Chat ---
export interface PlanChangeProposal {
  type: "update_budget" | "add_task" | "update_expense" | "general_advice";
  description: string;
  details: {
    category?: string;
    amount?: number;
    taskTitle?: string;
    taskDue?: string;
    suggestedSavings?: number;
    [key: string]: unknown;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  proposedChanges?: PlanChangeProposal;
  isAiGenerated?: boolean;
  modelUsed?: string;
}

// --- Event Plan ---
export interface EventPlan {
  id: string;
  title: string;
  tagline?: string;
  category: EventCategory;
  eventDate: string; // YYYY-MM-DD
  isTentativeDate: boolean;
  location: {
    city: string;
    venueName?: string;
    venueType: VenueType;
  };
  guests: {
    expectedCount: number;
    flexibility: BudgetFlexibility;
  };
  budget: {
    totalBudget: number;
    currency: string; // 'INR'
    emergencyReservePct: number; // e.g. 10
    emergencyReserveAmount: number;
    categories: BudgetCategoryAllocation[];
    expenses: ExpenseItem[];
  };
  preferences: {
    theme: string;
    preferredColors: string[];
    culturalRegion: string; // e.g. 'Bengali', 'South Indian', 'Pan-Indian', 'Modern Western', etc.
    foodPreferences: string[]; // e.g. 'Traditional Bengali Feast', 'Pure Vegetarian', 'Multi-Cuisine Buffet'
    formality: FormalityLevel;
    accessibilityRequirements?: string;
    mustHaves: string[];
    thingsToAvoid: string[];
  };
  planning: {
    stage: PlanningStage;
    diyLevel: DiyLevel;
    priorityCategories: string[];
    sustainabilityNotes?: string;
    specialRequirements?: string;
  };
  aiOverview: {
    executiveSummary: string;
    themeConcept: string;
    recommendedActivities: string[];
    culturalHighlights: string[];
    guestExperienceTips: string[];
  };
  timeline: {
    tasks: EventTask[];
  };
  vendors: VendorItem[];
  risks: RiskScenario[];
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

// --- Zod Validation Schemas for Wizard Input ---
export const EventWizardSchema = z.object({
  // Step 1: Basics
  title: z.string().min(2, "Event name must be at least 2 characters").max(80),
  category: z.enum(["wedding", "birthday", "anniversary", "community", "college_fest", "corporate", "other"]),
  eventDate: z.string().min(1, "Event date is required"),
  isTentativeDate: z.boolean().default(false),
  city: z.string().min(2, "City is required").max(60),
  venueType: z.enum(["indoor", "outdoor", "undecided"]),

  // Step 2: Budget & Attendance
  totalBudget: z.number().min(5000, "Minimum budget is ₹5,000").max(100000000),
  currency: z.string().default("INR"),
  expectedGuestCount: z.number().min(5, "Minimum 5 guests").max(10000),
  budgetFlexibility: z.enum(["strict", "moderate", "flexible"]).default("moderate"),
  emergencyReservePct: z.number().min(0).max(25).default(10),

  // Step 3: Preferences
  theme: z.string().min(2, "Theme is required"),
  preferredColors: z.array(z.string()).default([]),
  culturalRegion: z.string().default("Pan-Indian"),
  foodPreferences: z.array(z.string()).default([]),
  formality: z.enum(["casual", "semi_formal", "formal", "traditional_royal"]).default("formal"),
  accessibilityRequirements: z.string().optional(),
  mustHaves: z.array(z.string()).default([]),
  thingsToAvoid: z.array(z.string()).default([]),

  // Step 4: Planning
  planningStage: z.enum(["just_started", "venue_booked", "halfway", "last_month"]).default("just_started"),
  diyLevel: z.enum(["full_diy", "hybrid", "full_pro"]).default("hybrid"),
  priorityCategories: z.array(z.string()).default([]),
  sustainabilityPreferences: z.string().optional(),
  specialRequirements: z.string().optional(),
});

export type EventWizardInput = z.infer<typeof EventWizardSchema>;

// What-If Simulator Input & Output
export interface WhatIfSimulationInput {
  guestCount: number;
  totalBudget: number;
  venueTier: "budget" | "standard" | "premium" | "heritage_luxury";
  cateringTier: "economy" | "standard_buffet" | "royal_deluxe" | "bespoke_live";
  decorationTier: "minimalist" | "ambient_elegant" | "grand_thematic";
}

export interface WhatIfSimulationResult {
  projectedCost: number;
  costDelta: number; // positive = over budget, negative = savings
  perGuestCost: number;
  categoryImpacts: {
    categoryName: string;
    originalAllocated: number;
    simulatedEstimate: number;
    delta: number;
    comment: string;
  }[];
  recommendations: string[];
}
