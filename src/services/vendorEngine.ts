import { VendorItem, BudgetCategoryAllocation } from "@/types/event";

export interface VendorCategoryCriteria {
  category: string;
  mustAskQuestions: string[];
  negotiationTips: string[];
  keyDeliverables: string[];
}

export const VENDOR_REQUIREMENTS_GUIDE: Record<string, VendorCategoryCriteria> = {
  venue: {
    category: "Venue & Lawns",
    mustAskQuestions: [
      "Is outside catering and outside decorator allowed, or are there royalty fees?",
      "What is the noise curfew for amplified music / DJ?",
      "What is the DG generator power backup capacity in case of grid failure?",
      "How many dedicated car parking slots and valet attendants are included?",
      "Are green rooms / bridal changing suites included in the rental package?",
    ],
    negotiationTips: [
      "Ask for complimentary bridal dressing suites or complimentary morning hours for setup.",
      "If booking on a non-peak weekday or Sunday morning, negotiate 10-15% discount on hall charges.",
      "Request waived corkage fees or discounted electricity unit rates.",
    ],
    keyDeliverables: [
      "Written booking receipt with explicit start and end hours",
      "Refundable caution deposit terms clearly documented",
      "List of prohibited items (e.g. cold pyros, confetti cannons)",
    ],
  },
  catering: {
    category: "Catering & Beverages",
    mustAskQuestions: [
      "Can we do a live food tasting of our selected wedding menu with 4 people?",
      "What is the ratio of service waiters to dining guests (ideal is 1:15)?",
      "Are mineral water bottles, soft drinks, and ice cubes included in the per-plate price?",
      "How do you handle leftover food (can it be packed or given to local food charities)?",
      "What is your grace policy if guest count fluctuates by 10% on the event day?",
    ],
    negotiationTips: [
      "Bundle welcome mocktail counters and dessert stalls into the per-plate rate without extra setup charges.",
      "Ask for 1 free live counter (e.g. Hot Jalebi with Rabdi or Live Chaat) if total guest count exceeds 250.",
      "Negotiate a reduced plate price for children under 8 years.",
    ],
    keyDeliverables: [
      "Printed final menu card counters with allergen / veg-nonveg markers",
      "Dedicated banquet captain on floor overseeing live refill stations",
      "Hygiene, food safety certification, and uniformed servers",
    ],
  },
  decoration: {
    category: "Floral & Decor",
    mustAskQuestions: [
      "Will the stage backdrop and mandap use fresh exotic flowers, local flowers, or artificial silk florals?",
      "Can you provide a 3D visual render or color mood board before finalizing the contract?",
      "Does the quote include truss lighting, fairy light canopies, and generator fuel for decorative lights?",
      "What time will the setup crew begin and when will the stage be 100% photo-ready?",
    ],
    negotiationTips: [
      "Adopt hybrid floral arrangements: fresh flowers at eye-level and high-grade silk flowers at elevated rafters.",
      "Repurpose aisle floral stands to stage backdrop or dining entrance to save 20% on fresh flower volume.",
    ],
    keyDeliverables: [
      "Signed mood board specifying colors, fabric drapery, and lighting positions",
      "Early completion guarantee: stage photo-ready 2 hours before guest arrival",
    ],
  },
  photography: {
    category: "Photography & Cinema",
    mustAskQuestions: [
      "How many total shooters will be present on-site (Candid lead, Traditional, Drone, Cinematographer)?",
      "What is the exact delivery timeline for the 3-minute teaser reel, full 30-minute film, and edited raw photos?",
      "Do you provide backup camera bodies and dual SD card recording to guard against hardware corruption?",
      "How many pages and sheets are included in the custom leatherette wedding album?",
    ],
    negotiationTips: [
      "Request a complimentary pre-wedding couple photoshoot or complimentary 60-second Instagram cinematic teaser.",
      "Negotiate payment schedule: 25% advance, 50% on event day, 25% only after raw edited images are previewed.",
    ],
    keyDeliverables: [
      "Cloud gallery link with high-resolution downloadable images within 25 days",
      "Raw uncompressed footage on external hard drive",
      "Flush-mount embossed photo album with warranty",
    ],
  },
};

/**
 * Determine budget compatibility of a vendor quote against its category allocation
 */
export function checkVendorBudgetFit(
  vendor: VendorItem,
  categories: BudgetCategoryAllocation[]
): {
  status: "comfortable" | "close" | "exceeds" | "unknown";
  categoryName: string;
  allocatedAmount: number;
  percentageOfCategory: number;
  badgeText: string;
  badgeVariant: "success" | "warning" | "danger" | "neutral";
} {
  const match = categories.find(
    (c) =>
      c.id.toLowerCase() === vendor.category.toLowerCase() ||
      c.name.toLowerCase().includes(vendor.category.toLowerCase()) ||
      vendor.category.toLowerCase().includes(c.name.toLowerCase())
  );

  if (!match || match.allocatedAmount <= 0) {
    return {
      status: "unknown",
      categoryName: vendor.category,
      allocatedAmount: 0,
      percentageOfCategory: 0,
      badgeText: "Budget TBD",
      badgeVariant: "neutral",
    };
  }

  const ratio = vendor.quotedPrice / match.allocatedAmount;
  const pct = Math.round(ratio * 100);

  if (ratio <= 0.85) {
    return {
      status: "comfortable",
      categoryName: match.name,
      allocatedAmount: match.allocatedAmount,
      percentageOfCategory: pct,
      badgeText: `Within Budget (${pct}%)`,
      badgeVariant: "success",
    };
  } else if (ratio <= 1.05) {
    return {
      status: "close",
      categoryName: match.name,
      allocatedAmount: match.allocatedAmount,
      percentageOfCategory: pct,
      badgeText: `Balanced (${pct}%)`,
      badgeVariant: "warning",
    };
  } else {
    return {
      status: "exceeds",
      categoryName: match.name,
      allocatedAmount: match.allocatedAmount,
      percentageOfCategory: pct,
      badgeText: `Exceeds Target by ${pct - 100}%`,
      badgeVariant: "danger",
    };
  }
}
