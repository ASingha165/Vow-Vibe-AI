import {
  EventCategory,
  BudgetCategoryAllocation,
  ExpenseItem,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
} from "@/types/event";

export interface CategoryTemplate {
  id: string;
  name: string;
  baseWeight: number; // relative weight before normalization
  color: string;
  iconName: string;
  description: string;
}

// Standard category weights by event type (percentages will be scaled to 100% minus emergency reserve)
export const CATEGORY_TEMPLATES: Record<EventCategory, CategoryTemplate[]> = {
  wedding: [
    { id: "venue", name: "Venue & Lawns", baseWeight: 22, color: "#8B263E", iconName: "Castle", description: "Banquets, outdoor lawn, mandap space & lighting" },
    { id: "catering", name: "Catering & Beverages", baseWeight: 28, color: "#D48B38", iconName: "Utensils", description: "Welcome drinks, multi-course feast, live counters, dessert" },
    { id: "decoration", name: "Floral & Decor", baseWeight: 15, color: "#C59B27", iconName: "Sparkles", description: "Mandap, stage backdrop, entrance arch, floral canopies" },
    { id: "photography", name: "Photography & Cinema", baseWeight: 11, color: "#2E6F74", iconName: "Camera", description: "Candid photography, cinematic drone teaser, traditional album" },
    { id: "attire", name: "Attire & Styling", baseWeight: 9, color: "#934A81", iconName: "Shirt", description: "Bridal lehenga / saree, groom sherwani, jewellery & bridal makeup" },
    { id: "entertainment", name: "Music, DJ & Entertainment", baseWeight: 6, color: "#543C78", iconName: "Music", description: "DJ, sound system, dhol players, sangeet choreo" },
    { id: "invitations", name: "Invitations & Stationery", baseWeight: 3, color: "#A87042", iconName: "Mail", description: "Physical cards, digital animations, welcome signages, itinerary" },
    { id: "logistics", name: "Transport & Hospitality", baseWeight: 4, color: "#456990", iconName: "Car", description: "Guest shuttles, vintage bridal entry car, welcome hampers" },
    { id: "gifts", name: "Gifts & Favors", baseWeight: 2, color: "#D95B72", iconName: "Gift", description: "Return favors, mithai boxes, shagun envelopes" },
  ],
  birthday: [
    { id: "venue", name: "Venue / Space", baseWeight: 20, color: "#8B263E", iconName: "Castle", description: "Party hall, cafe booking, or garden area" },
    { id: "catering", name: "Food & Cake", baseWeight: 35, color: "#D48B38", iconName: "Utensils", description: "Signature cake, finger foods, mocktails, dinner buffet" },
    { id: "decoration", name: "Thematic Decor & Balloons", baseWeight: 18, color: "#C59B27", iconName: "Sparkles", description: "Balloon arch, photo booth, backdrop, table runners" },
    { id: "entertainment", name: "Host, Magic & Games", baseWeight: 12, color: "#543C78", iconName: "Music", description: "Emcee, magician / game host, DJ playlist" },
    { id: "photography", name: "Photography", baseWeight: 7, color: "#2E6F74", iconName: "Camera", description: "Event coverage and high-res family portraits" },
    { id: "gifts", name: "Return Gifts", baseWeight: 5, color: "#D95B72", iconName: "Gift", description: "Curated gift hampers for attending guests" },
    { id: "invitations", name: "Invites & Printables", baseWeight: 3, color: "#A87042", iconName: "Mail", description: "Digital video invitations and name tags" },
  ],
  anniversary: [
    { id: "venue", name: "Venue & Atmosphere", baseWeight: 25, color: "#8B263E", iconName: "Castle", description: "Rooftop lounge, private dining, or banquet" },
    { id: "catering", name: "Gourmet Dining & Toast", baseWeight: 35, color: "#D48B38", iconName: "Utensils", description: "Plated dinner / buffet, mocktails, tier cake" },
    { id: "decoration", name: "Ambient Decor & Florals", baseWeight: 15, color: "#C59B27", iconName: "Sparkles", description: "Fairy lights, subtle floral centrepieces, memories photo wall" },
    { id: "photography", name: "Photography & Video", baseWeight: 10, color: "#2E6F74", iconName: "Camera", description: "Couples session and guest candids" },
    { id: "entertainment", name: "Acoustic Band / Live Singer", baseWeight: 8, color: "#543C78", iconName: "Music", description: "Live melodies and personalized couple songs" },
    { id: "gifts", name: "Favors & Mementos", baseWeight: 4, color: "#D95B72", iconName: "Gift", description: "Custom keepsake gifts for guests" },
    { id: "invitations", name: "Invitations", baseWeight: 3, color: "#A87042", iconName: "Mail", description: "Golden foil cards / digital invites" },
  ],
  college_fest: [
    { id: "venue", name: "Stage, Sound & Rigging", baseWeight: 30, color: "#8B263E", iconName: "Music", description: "Main stage, line array acoustics, truss lighting" },
    { id: "entertainment", name: "Celebrity Artist & Bands", baseWeight: 30, color: "#543C78", iconName: "Sparkles", description: "Star performer, opening acts, battle of the bands" },
    { id: "logistics", name: "Security & Permissions", baseWeight: 15, color: "#456990", iconName: "Shield", description: "Bouncers, barricading, fire safety, licenses" },
    { id: "catering", name: "Food Stalls & Refreshments", baseWeight: 10, color: "#D48B38", iconName: "Utensils", description: "Crew meals and student concession kiosks" },
    { id: "decoration", name: "Branding & Campus Decor", baseWeight: 7, color: "#C59B27", iconName: "Sparkles", description: "Gate arches, selfie points, directional signs" },
    { id: "photography", name: "Media & Livestreaming", baseWeight: 5, color: "#2E6F74", iconName: "Camera", description: "Aftermovie, live stream on screens, reels crew" },
    { id: "invitations", name: "Wristbands & Marketing", baseWeight: 3, color: "#A87042", iconName: "Mail", description: "RFID / Holographic entry bands, poster prints" },
  ],
  community: [
    { id: "venue", name: "Community Hall / Grounds", baseWeight: 25, color: "#8B263E", iconName: "Castle", description: "Public park or community hall hire & seating" },
    { id: "catering", name: "Community Feast / Prasadam", baseWeight: 40, color: "#D48B38", iconName: "Utensils", description: "Bulk community feast or buffet" },
    { id: "decoration", name: "Mandap / Cultural Stage", baseWeight: 15, color: "#C59B27", iconName: "Sparkles", description: "Cultural stage, lighting, floral arrangements" },
    { id: "logistics", name: "Sound & Public Address", baseWeight: 10, color: "#543C78", iconName: "Music", description: "PA system, mic setups, generator backup" },
    { id: "photography", name: "Photography & Coverage", baseWeight: 5, color: "#2E6F74", iconName: "Camera", description: "Volunteer documentation and community album" },
    { id: "invitations", name: "Pamphlets & Community Notice", baseWeight: 5, color: "#A87042", iconName: "Mail", description: "Banners and circulars" },
  ],
  corporate: [
    { id: "venue", name: "Hotel Ballroom / Convention Hall", baseWeight: 35, color: "#8B263E", iconName: "Castle", description: "Convention hall, AV projection & breakout rooms" },
    { id: "catering", name: "Executive Catering & High Tea", baseWeight: 30, color: "#D48B38", iconName: "Utensils", description: "Breakfast spread, networking lunch, hi-tea breaks" },
    { id: "entertainment", name: "Keynote Speakers & Emcee", baseWeight: 12, color: "#543C78", iconName: "Music", description: "Industry speaker honorarium, professional host" },
    { id: "photography", name: "Video Production & Livestream", baseWeight: 10, color: "#2E6F74", iconName: "Camera", description: "Dual camera stream, transcript recording, press photo" },
    { id: "decoration", name: "Branding, Badges & Stage Backdrop", baseWeight: 8, color: "#C59B27", iconName: "Sparkles", description: "Step-and-repeat backdrop, lanyard badges, banners" },
    { id: "gifts", name: "Corporate Swag & Kits", baseWeight: 5, color: "#D95B72", iconName: "Gift", description: "Branded delegate folders and executive gifts" },
  ],
  other: [
    { id: "venue", name: "Venue Booking", baseWeight: 25, color: "#8B263E", iconName: "Castle", description: "Space reservation and utilities" },
    { id: "catering", name: "Food & Drinks", baseWeight: 35, color: "#D48B38", iconName: "Utensils", description: "Refreshments and meal arrangements" },
    { id: "decoration", name: "Decoration & Setup", baseWeight: 15, color: "#C59B27", iconName: "Sparkles", description: "Atmospheric styling and seating" },
    { id: "photography", name: "Photography", baseWeight: 10, color: "#2E6F74", iconName: "Camera", description: "Event memories" },
    { id: "entertainment", name: "Music / Activities", baseWeight: 10, color: "#543C78", iconName: "Music", description: "Sound and entertainment" },
    { id: "gifts", name: "Miscellaneous & Favors", baseWeight: 5, color: "#D95B72", iconName: "Gift", description: "Gifts and incidentals" },
  ],
};

/**
 * Deterministically allocate total budget across categories.
 * Reconciles exact sum to (totalBudget - emergencyReserveAmount) with NO rounding discrepancy!
 */
export function generateBudgetAllocations(
  category: EventCategory,
  totalBudget: number,
  emergencyReservePct = 10
): {
  emergencyReserveAmount: number;
  categories: BudgetCategoryAllocation[];
} {
  const templates = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.wedding;
  const reserveAmount = Math.round((totalBudget * emergencyReservePct) / 100);
  const spendableBudget = totalBudget - reserveAmount;

  const totalBaseWeight = templates.reduce((sum, t) => sum + t.baseWeight, 0);

  // First pass: integer rounding of each category share
  let runningAllocated = 0;
  const categories: BudgetCategoryAllocation[] = templates.map((tpl) => {
    const rawPct = (tpl.baseWeight / totalBaseWeight) * (100 - emergencyReservePct);
    const amount = Math.floor((tpl.baseWeight / totalBaseWeight) * spendableBudget);
    runningAllocated += amount;

    return {
      id: tpl.id,
      name: tpl.name,
      percentage: Number(rawPct.toFixed(1)),
      allocatedAmount: amount,
      estimatedTotal: amount,
      committedTotal: 0,
      actualTotal: 0,
      color: tpl.color,
      iconName: tpl.iconName,
      description: tpl.description,
    };
  });

  // Reconcile remaining rounding pennies/rupees to the primary category (usually Catering or Venue)
  const remainder = spendableBudget - runningAllocated;
  if (remainder !== 0 && categories.length > 0) {
    // Add remainder to the highest allocated category
    categories[0].allocatedAmount += remainder;
    categories[0].estimatedTotal += remainder;
  }

  return {
    emergencyReserveAmount: reserveAmount,
    categories,
  };
}

/**
 * Recalculate summary metrics from category allocations and expense items.
 */
export function recalculateBudgetSummary(
  totalBudget: number,
  reserveAmount: number,
  categories: BudgetCategoryAllocation[],
  expenses: ExpenseItem[]
) {
  // Aggregate expenses per category
  const updatedCategories = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
    const estimatedTotal = catExpenses.reduce((sum, e) => sum + (e.estimatedCost || 0), 0);
    const committedTotal = catExpenses.reduce(
      (sum, e) => sum + (e.status === "committed" || e.status === "paid" ? e.committedCost || e.estimatedCost : 0),
      0
    );
    const actualTotal = catExpenses.reduce((sum, e) => sum + (e.actualCost || 0), 0);

    return {
      ...cat,
      // If expenses have been entered, use expense sum; otherwise keep baseline allocation
      estimatedTotal: catExpenses.length > 0 ? estimatedTotal : cat.allocatedAmount,
      committedTotal,
      actualTotal,
    };
  });

  const totalAllocated = updatedCategories.reduce((s, c) => s + c.allocatedAmount, 0) + reserveAmount;
  const totalEstimated = updatedCategories.reduce((s, c) => s + c.estimatedTotal, 0) + reserveAmount;
  const totalCommitted = updatedCategories.reduce((s, c) => s + c.committedTotal, 0);
  const totalActual = updatedCategories.reduce((s, c) => s + c.actualTotal, 0);

  const remainingBudget = totalBudget - Math.max(totalEstimated, totalCommitted, totalActual);
  const isOverBudget = totalEstimated > totalBudget;
  const budgetUtilizationPct = totalBudget > 0 ? Math.min(100, Math.round((totalEstimated / totalBudget) * 100)) : 0;

  return {
    totalBudget,
    reserveAmount,
    updatedCategories,
    totalAllocated,
    totalEstimated,
    totalCommitted,
    totalActual,
    remainingBudget,
    isOverBudget,
    overBudgetAmount: isOverBudget ? totalEstimated - totalBudget : 0,
    budgetUtilizationPct,
  };
}

/**
 * "What If?" Simulator Engine:
 * Simulates impact of changing guest count, total budget, and vendor tier selections.
 */
export function runWhatIfSimulation(
  baseBudget: number,
  baseGuests: number,
  input: WhatIfSimulationInput
): WhatIfSimulationResult {
  const guestRatio = input.guestCount / Math.max(1, baseGuests);

  // Multipliers based on tiers
  const venueMultipliers = {
    budget: 0.75,
    standard: 1.0,
    premium: 1.35,
    heritage_luxury: 1.8,
  };

  const cateringMultipliers = {
    economy: 0.8,
    standard_buffet: 1.0,
    royal_deluxe: 1.4,
    bespoke_live: 1.75,
  };

  const decorMultipliers = {
    minimalist: 0.7,
    ambient_elegant: 1.0,
    grand_thematic: 1.5,
  };

  // Compute baseline category splits from default wedding weights
  const templates = CATEGORY_TEMPLATES.wedding;
  const totalWeight = templates.reduce((sum, t) => sum + t.baseWeight, 0);

  let totalSimulated = 0;
  const categoryImpacts = templates.map((tpl) => {
    const originalAllocated = Math.round((tpl.baseWeight / totalWeight) * baseBudget * 0.9);
    let simulated = originalAllocated;
    let comment = "Baseline proportion";

    if (tpl.id === "catering") {
      // Scales directly with guest count and catering tier
      const perGuestRate = originalAllocated / Math.max(1, baseGuests);
      simulated = Math.round(perGuestRate * input.guestCount * cateringMultipliers[input.cateringTier]);
      comment = `Scaled for ${input.guestCount} guests at ${input.cateringTier.replace("_", " ")} tier`;
    } else if (tpl.id === "venue") {
      // Scales with venue tier and slight capacity requirement for guest count
      const capacityFactor = guestRatio > 1.3 ? 1.2 : guestRatio < 0.7 ? 0.9 : 1.0;
      simulated = Math.round(originalAllocated * venueMultipliers[input.venueTier] * capacityFactor);
      comment = `${input.venueTier.replace("_", " ")} tier with capacity adjustments`;
    } else if (tpl.id === "decoration") {
      simulated = Math.round(originalAllocated * decorMultipliers[input.decorationTier]);
      comment = `${input.decorationTier.replace("_", " ")} styling specification`;
    } else if (tpl.id === "invitations" || tpl.id === "gifts") {
      // Partially scale with guest count
      simulated = Math.round(originalAllocated * Math.sqrt(guestRatio));
      comment = `Adjusted proportionally for attendee gifts/invites`;
    } else {
      // Fixed items (photography, DJ) do not increase linearly with guests
      simulated = originalAllocated;
      comment = `Fixed service cost unaffected by guest headcount`;
    }

    totalSimulated += simulated;
    const delta = simulated - originalAllocated;

    return {
      categoryName: tpl.name,
      originalAllocated,
      simulatedEstimate: simulated,
      delta,
      comment,
    };
  });

  // Include 10% emergency reserve in simulated total
  const simulatedReserve = Math.round(totalSimulated * 0.1);
  const grandSimulatedTotal = totalSimulated + simulatedReserve;
  const costDelta = grandSimulatedTotal - input.totalBudget;
  const perGuestCost = Math.round(grandSimulatedTotal / Math.max(1, input.guestCount));

  // Generate actionable recommendations
  const recommendations: string[] = [];
  if (costDelta > 0) {
    recommendations.push(
      `Projected to exceed budget by ₹${Math.abs(costDelta).toLocaleString("en-IN")}. Consider adjusting catering tier or trimming non-essential floral decor.`
    );
    if (input.cateringTier === "bespoke_live" || input.cateringTier === "royal_deluxe") {
      recommendations.push(
        `Switching catering to "Standard Buffet" would recover approximately ₹${Math.round(
          categoryImpacts.find((c) => c.categoryName.includes("Catering"))?.simulatedEstimate || 0 * 0.25
        ).toLocaleString("en-IN")}.`
      );
    }
    if (input.venueTier === "heritage_luxury") {
      recommendations.push(
        `Heritage venues carry high mandatory rentals. A premium banquet hall would reduce venue expense by up to 25%.`
      );
    }
  } else {
    recommendations.push(
      `Healthy budget buffer of ₹${Math.abs(costDelta).toLocaleString("en-IN")} available. This can enhance entertainment or upgrade guest gifts.`
    );
    recommendations.push(
      `At ₹${perGuestCost.toLocaleString("en-IN")} per attendee, this allocation provides balanced hospitality.`
    );
  }

  return {
    projectedCost: grandSimulatedTotal,
    costDelta,
    perGuestCost,
    categoryImpacts,
    recommendations,
  };
}

/**
 * Suggest concrete, deterministic cost-saving levers
 */
export function generateCostSavingSuggestions(
  totalBudget: number,
  expenses: ExpenseItem[],
  categories: BudgetCategoryAllocation[]
): {
  id: string;
  category: string;
  potentialSavings: number;
  title: string;
  advice: string;
}[] {
  const suggestions = [
    {
      id: "save-1",
      category: "Catering",
      potentialSavings: Math.round(totalBudget * 0.04),
      title: "Replace Heavy Appetizers with Live Street Chaat Counters",
      advice: "Replacing 3 deep-fried appetizers with interactive live street chaat (Puchka, Papdi Chaat) cuts food wastage by 30% and is universally beloved by guests.",
    },
    {
      id: "save-2",
      category: "Floral & Decor",
      potentialSavings: Math.round(totalBudget * 0.035),
      title: "Seasonal Florals & Reusable Stage Backdrop",
      advice: "Prioritize local seasonal marigolds, tuberoses (Rajnigandha), and fairy light canopies instead of imported lilies or carnations to reduce floral bills.",
    },
    {
      id: "save-3",
      category: "Invitations",
      potentialSavings: Math.round(totalBudget * 0.015),
      title: "Digital Video Itinerary & Limited Box Invites",
      advice: "Send animated WhatsApp video invitations with interactive RSVP links to out-of-town guests, reserving printed physical boxes for immediate elders.",
    },
    {
      id: "save-4",
      category: "Attire & Styling",
      potentialSavings: Math.round(totalBudget * 0.02),
      title: "Boutique Designer Studio vs Big Label Names",
      advice: "Select master-weaver ateliers or bridal rental options for groom accessories, safas, and jewellery instead of retail brand flagships.",
    },
  ];

  return suggestions;
}
