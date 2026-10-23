import { GoogleGenAI } from "@google/genai";
import {
  EventCategory,
  EventPlan,
  EventWizardInput,
  ChatMessage,
  PlanChangeProposal,
  RiskScenario,
  VendorItem,
} from "@/types/event";
import { generateBudgetAllocations } from "./budgetEngine";
import { generateTimelineTasks } from "./timelineEngine";

// Initialize Gemini Client safely if key exists
const apiKey = process.env.GEMINI_API_KEY || "";
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Failed to initialize GoogleGenAI client:", err);
  }
}

export const AiService = {
  isConfigured(): boolean {
    return Boolean(apiKey && apiKey.trim().length > 0);
  },

  getModelName(): string {
    return this.isConfigured() ? "Gemini 2.5 Flash" : "Local Intelligence Engine (Deterministic Fallback)";
  },

  /**
   * Generate complete structured Event Plan from Wizard inputs
   */
  async generateEventPlan(input: EventWizardInput): Promise<{ plan: EventPlan; providerUsed: string }> {
    // Deterministic allocations and tasks form the bedrock
    const { emergencyReserveAmount, categories } = generateBudgetAllocations(
      input.category,
      input.totalBudget,
      input.emergencyReservePct
    );

    const baseTasks = generateTimelineTasks(input.category, input.eventDate, input.isTentativeDate);

    if (this.isConfigured() && aiClient) {
      try {
        const prompt = `
You are an expert Luxury & Cultural Event Planning AI Architect for "Vow & Vibe AI".
Analyze this user request and return a rich, culturally sensitive, detailed plan.

Event Details:
- Name: "${input.title}"
- Category: ${input.category}
- Date: ${input.eventDate} (Tentative: ${input.isTentativeDate})
- Location: ${input.city} (${input.venueType})
- Total Budget: INR ${input.totalBudget} (Emergency Reserve: ${input.emergencyReservePct}%)
- Guests: ${input.expectedGuestCount} (Flexibility: ${input.budgetFlexibility})
- Theme: "${input.theme}"
- Color Palette: ${input.preferredColors.join(", ") || "Rose, Champagne, Plum, Ivory"}
- Cultural / Regional Tradition: "${input.culturalRegion}"
- Food Preferences: ${input.foodPreferences.join(", ") || "Standard Multi-Cuisine"}
- Formality: ${input.formality}
- Must-Haves: ${input.mustHaves.join(", ") || "None specified"}
- Things to Avoid: ${input.thingsToAvoid.join(", ") || "None specified"}
- Planning Stage: ${input.planningStage}
- DIY Preference: ${input.diyLevel}

Respond with ONLY valid JSON adhering to this schema (no markdown fences, no extra text):
{
  "executiveSummary": "Concise high-level overview of the event vision",
  "themeConcept": "Detailed description of aesthetics, styling, and decor",
  "recommendedActivities": ["Step 1 / Ritual 1", "Step 2", "Step 3", "Step 4"],
  "culturalHighlights": ["Authentic tradition 1", "Tradition 2"],
  "guestExperienceTips": ["Experience tip 1", "Experience tip 2"],
  "risks": [
    {
      "title": "Specific Risk Name",
      "description": "Why this risk might occur",
      "likelihood": "low" | "medium" | "high",
      "impact": "low" | "medium" | "high",
      "preventiveAction": "Action before the event",
      "contingencyPlan": "Action if risk occurs",
      "estimatedContingencyCost": number in INR
    }
  ]
}
`;

        const response = await aiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const rawText = response.text?.trim() || "";
        // Clean markdown backticks if present
        const jsonStr = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        const parsed = JSON.parse(jsonStr);

        const newPlan: EventPlan = {
          id: `plan-${Date.now().toString(36)}`,
          title: input.title,
          category: input.category,
          eventDate: input.eventDate,
          isTentativeDate: input.isTentativeDate,
          location: {
            city: input.city,
            venueType: input.venueType,
          },
          guests: {
            expectedCount: input.expectedGuestCount,
            flexibility: input.budgetFlexibility,
          },
          budget: {
            totalBudget: input.totalBudget,
            currency: input.currency || "INR",
            emergencyReservePct: input.emergencyReservePct,
            emergencyReserveAmount,
            categories,
            expenses: [],
          },
          preferences: {
            theme: input.theme,
            preferredColors: input.preferredColors,
            culturalRegion: input.culturalRegion,
            foodPreferences: input.foodPreferences,
            formality: input.formality,
            accessibilityRequirements: input.accessibilityRequirements,
            mustHaves: input.mustHaves,
            thingsToAvoid: input.thingsToAvoid,
          },
          planning: {
            stage: input.planningStage,
            diyLevel: input.diyLevel,
            priorityCategories: input.priorityCategories,
            sustainabilityNotes: input.sustainabilityPreferences,
            specialRequirements: input.specialRequirements,
          },
          aiOverview: {
            executiveSummary: parsed.executiveSummary || "A curated, beautifully orchestrated celebration.",
            themeConcept: parsed.themeConcept || input.theme,
            recommendedActivities: parsed.recommendedActivities || [],
            culturalHighlights: parsed.culturalHighlights || [],
            guestExperienceTips: parsed.guestExperienceTips || [],
          },
          timeline: {
            tasks: baseTasks,
          },
          vendors: this.generateSampleVendors(input.category, input.city, categories),
          risks: (parsed.risks || []).map((r: any, idx: number) => ({
            id: `risk-ai-${idx + 1}`,
            title: r.title,
            description: r.description,
            likelihood: r.likelihood || "medium",
            impact: r.impact || "medium",
            preventiveAction: r.preventiveAction,
            contingencyPlan: r.contingencyPlan,
            estimatedContingencyCost: r.estimatedContingencyCost || 10000,
          })),
          chatHistory: [
            {
              id: `chat-${Date.now()}`,
              role: "assistant",
              content: `Welcome! I've synthesized your custom event blueprint for "${input.title}". Your budget of ₹${input.totalBudget.toLocaleString(
                "en-IN"
              )} is allocated with an emergency reserve of ₹${emergencyReserveAmount.toLocaleString(
                "en-IN"
              )}. What would you like to explore first?`,
              timestamp: new Date().toISOString(),
              isAiGenerated: true,
              modelUsed: "Gemini 2.5 Flash",
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: false,
        };

        return { plan: newPlan, providerUsed: "Gemini 2.5 Flash" };
      } catch (err) {
        console.warn("Gemini API call failed or timed out. Gracefully falling back to Local Intelligence Engine:", err);
      }
    }

    // --- Deterministic Fallback Engine ---
    const fallbackPlan = this.generateDeterministicFallback(input, emergencyReserveAmount, categories, baseTasks);
    return { plan: fallbackPlan, providerUsed: "Local Intelligence Engine (Deterministic Fallback)" };
  },

  /**
   * Deterministic High-Quality Fallback Generator
   */
  generateDeterministicFallback(
    input: EventWizardInput,
    emergencyReserveAmount: number,
    categories: any[],
    baseTasks: any[]
  ): EventPlan {
    const isIndian = input.culturalRegion && input.culturalRegion.toLowerCase() !== "none" && input.currency === "INR";
    const sampleVendors = this.generateSampleVendors(input.category, input.city, categories);

    let summary = "";
    let themeConcept = "";
    let activities: string[] = [];
    let culturalHighlights: string[] = [];
    let experienceTips: string[] = [];
    let risks: RiskScenario[] = [];

    if (input.category === "wedding") {
      summary = `A thoughtfully planned wedding celebration in ${input.city} designed for ${input.expectedGuestCount} guests with an optimal budget of ₹${input.totalBudget.toLocaleString("en-IN")}. Blends ${input.culturalRegion} customs with contemporary elegance.`;
      themeConcept = `${input.theme} utilizing a palette of ${input.preferredColors.join(", ") || "Warm Ivory, Rose Gold, and Deep Plum"}. Emphasizes authentic floral fragrance, acoustic warmth, and intimate seating arrangements.`;
      activities = [
        "Pre-event welcoming and traditional welcome drinks",
        "Procession and ceremonial entrance ritual",
        "Sacred vows and garland exchange ceremony",
        "Grand hospitality banquet and couple blessing stage",
      ];
      culturalHighlights = [
        `Customized ${input.culturalRegion} ceremonial elements and ritual music`,
        "Family blessing circles and heritage dress accents",
      ];
      experienceTips = [
        "Arrange a dedicated hydration station with infused water and fresh coconut water.",
        "Provide printed ceremony guides explaining ritual meanings to younger and cross-cultural attendees.",
      ];
      risks = [
        {
          id: "risk-fb-1",
          title: "Weather & Outdoor Temperature Changes",
          description: "Fluctuations in weather could impact outdoor ceremonies.",
          likelihood: "medium",
          impact: "high",
          preventiveAction: "Verify venue has covered indoor backup hall or waterproof marquee.",
          contingencyPlan: "Transition primary rituals into the indoor space with pre-wired sound system.",
          estimatedContingencyCost: Math.round(input.totalBudget * 0.03),
        },
        {
          id: "risk-fb-2",
          title: "Guest Headcount Overrun (+10%)",
          description: "Higher than anticipated RSVP turnout for dining feast.",
          likelihood: "high",
          impact: "medium",
          preventiveAction: "Contract caterer with a guaranteed 10% flexible buffer.",
          contingencyPlan: "Utilize emergency reserve to cover surplus plates without interrupting service.",
          estimatedContingencyCost: Math.round(input.totalBudget * 0.04),
        },
      ];
    } else if (input.category === "birthday") {
      summary = `An energetic, memorable birthday celebration in ${input.city} for ${input.expectedGuestCount} guests, featuring custom entertainment and interactive food experiences.`;
      themeConcept = `${input.theme} with personalized decorative backdrops, custom photo-ops, and vibrant balloon styling.`;
      activities = ["Welcome mocktails & icebreaker games", "Cake cutting ceremony & spotlight toast", "Interactive entertainment & open dance floor", "Gourmet dining and party favors handover"];
      culturalHighlights = ["Special milestone tribute and nostalgic photo video montage"];
      experienceTips = ["Designate a dedicated gift repository with numbered tags.", "Offer dietary allergen flags on all buffet platters."];
      risks = [
        {
          id: "risk-fb-b1",
          title: "Audio-Visual or Sound Glitch",
          description: "Microphone or speaker failure during speeches.",
          likelihood: "low",
          impact: "medium",
          preventiveAction: "Test speaker systems and provide secondary wireless microphone.",
          contingencyPlan: "Venue technician on standby with backup portable PA unit.",
          estimatedContingencyCost: 3000,
        },
      ];
    } else {
      summary = `A well-structured celebration in ${input.city} hosting ${input.expectedGuestCount} guests within a total budget of ₹${input.totalBudget.toLocaleString("en-IN")}.`;
      themeConcept = `${input.theme} balancing relaxed social comfort with cohesive event branding.`;
      activities = ["Guest arrival and registration", "Keynote address / Ceremonial opening", "Culinary feast & networking", "Conmemorative group photos and closing remarks"];
      culturalHighlights = ["Community heritage storytelling and acknowledgements"];
      experienceTips = ["Provide clear signage from parking to the main celebration area."];
      risks = [
        {
          id: "risk-fb-gen-1",
          title: "Vendor Schedule Delay",
          description: "Traffic congestion delaying decorator or caterer delivery.",
          likelihood: "medium",
          impact: "medium",
          preventiveAction: "Set vendor load-in arrival deadline 3 hours prior to guest doors opening.",
          contingencyPlan: "Event coordinator oversees prioritized setup of reception area first.",
          estimatedContingencyCost: 5000,
        },
      ];
    }

    return {
      id: `plan-${Date.now().toString(36)}`,
      title: input.title,
      category: input.category,
      eventDate: input.eventDate,
      isTentativeDate: input.isTentativeDate,
      location: {
        city: input.city,
        venueType: input.venueType,
      },
      guests: {
        expectedCount: input.expectedGuestCount,
        flexibility: input.budgetFlexibility,
      },
      budget: {
        totalBudget: input.totalBudget,
        currency: input.currency || "INR",
        emergencyReservePct: input.emergencyReservePct,
        emergencyReserveAmount,
        categories,
        expenses: [],
      },
      preferences: {
        theme: input.theme,
        preferredColors: input.preferredColors,
        culturalRegion: input.culturalRegion,
        foodPreferences: input.foodPreferences,
        formality: input.formality,
        accessibilityRequirements: input.accessibilityRequirements,
        mustHaves: input.mustHaves,
        thingsToAvoid: input.thingsToAvoid,
      },
      planning: {
        stage: input.planningStage,
        diyLevel: input.diyLevel,
        priorityCategories: input.priorityCategories,
        sustainabilityNotes: input.sustainabilityPreferences,
        specialRequirements: input.specialRequirements,
      },
      aiOverview: {
        executiveSummary: summary,
        themeConcept,
        recommendedActivities: activities,
        culturalHighlights,
        guestExperienceTips: experienceTips,
      },
      timeline: {
        tasks: baseTasks,
      },
      vendors: sampleVendors,
      risks,
      chatHistory: [
        {
          id: `chat-${Date.now()}`,
          role: "assistant",
          content: `Hello! I have created your tailored event plan for "${input.title}". Your budget of ₹${input.totalBudget.toLocaleString(
            "en-IN"
          )} includes a protected contingency reserve of ₹${emergencyReserveAmount.toLocaleString(
            "en-IN"
          )}. Ask me anything about budget trimming, vendor recommendations, or timeline sequencing!`,
          timestamp: new Date().toISOString(),
          isAiGenerated: true,
          modelUsed: "Local Intelligence Engine",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
    };
  },

  /**
   * Helper to produce illustrative sample vendor records
   */
  generateSampleVendors(category: EventCategory, city: string, categories: any[]): VendorItem[] {
    const venueCat = categories.find((c) => c.id === "venue")?.allocatedAmount || 150000;
    const foodCat = categories.find((c) => c.id === "catering")?.allocatedAmount || 200000;
    const photoCat = categories.find((c) => c.id === "photography")?.allocatedAmount || 80000;

    return [
      {
        id: `v-sample-1`,
        name: `The Grand Heritage Pavilion (${city})`,
        category: "Venue & Lawns",
        location: city,
        contactPhone: "+91 98300 00001",
        quotedPrice: venueCat,
        status: "shortlisted",
        rating: 4.8,
        notes: "Illustrative sample venue matching your target allocation.",
        pros: ["Complimentary bridal room", "Power backup included", "Adequate parking"],
        cons: ["Requires noise level reduction by 10:30 PM"],
        isSample: true,
      },
      {
        id: `v-sample-2`,
        name: `Royal Gourmet Catering Co.`,
        category: "Catering & Beverages",
        location: city,
        contactPhone: "+91 98300 00002",
        quotedPrice: foodCat,
        status: "quoted",
        rating: 4.9,
        notes: "Illustrative sample caterer specializing in regional and multi-cuisine banquets.",
        pros: ["Live counters included", "Tasting session offered", "Trained uniformed staff"],
        cons: ["Minimum 100 plates billing"],
        isSample: true,
      },
      {
        id: `v-sample-3`,
        name: `Lumière Moments Candid Cinema`,
        category: "Photography & Cinema",
        location: city,
        contactPhone: "+91 98300 00003",
        quotedPrice: photoCat,
        status: "researching",
        rating: 4.7,
        notes: "Illustrative sample candid photography team.",
        pros: ["Drone coverage included", "7-day teaser turnaround", "Dual memory backup"],
        isSample: true,
      },
    ];
  },

  /**
   * Contextual Chat Assistant:
   * Handles user questions grounded in current event data (budget, tasks, vendors, etc.)
   */
  async chatWithAssistant(
    event: EventPlan,
    userMessage: string
  ): Promise<{ message: ChatMessage; providerUsed: string }> {
    const totalBudget = event.budget.totalBudget;
    const guestCount = event.guests.expectedCount;
    const completedTasks = event.timeline.tasks.filter((t) => t.status === "completed").length;
    const totalTasks = event.timeline.tasks.length;

    // Check if user is asking for cost savings or budget arithmetic
    const lower = userMessage.toLowerCase();

    // Call Gemini if configured
    if (this.isConfigured() && aiClient) {
      try {
        const systemPrompt = `
You are the AI Event Architect for "Vow & Vibe AI".
You are conversing with the planner for the event: "${event.title}".
Event Context:
- Category: ${event.category}
- City: ${event.location.city}
- Date: ${event.eventDate}
- Total Budget: INR ${totalBudget}
- Guest Count: ${guestCount}
- Theme: ${event.preferences.theme}
- Cultural Background: ${event.preferences.culturalRegion}
- Tasks Progress: ${completedTasks} of ${totalTasks} completed
- Categories: ${event.budget.categories.map((c) => `${c.name}: INR ${c.allocatedAmount}`).join(", ")}

Guidelines:
1. Provide practical, empathetic, precise advice.
2. If suggesting budget adjustments, state explicit INR amounts.
3. If proposing a specific modification to the plan (like adding a task or saving budget), include a JSON proposal at the end formatted as:
[PLAN_PROPOSAL]{"type":"general_advice"|"update_budget"|"add_task","description":"...","details":{...}}[/PLAN_PROPOSAL]
4. Keep the tone warm, sophisticated, and encouraging.
`;

        const response = await aiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\nUser Query: "${userMessage}"`,
        });

        const rawText = response.text || "";
        let content = rawText;
        let proposal: PlanChangeProposal | undefined;

        const match = rawText.match(/\[PLAN_PROPOSAL\]([\s\S]*?)\[\/PLAN_PROPOSAL\]/);
        if (match) {
          try {
            proposal = JSON.parse(match[1].trim());
            content = rawText.replace(/\[PLAN_PROPOSAL\][\s\S]*?\[\/PLAN_PROPOSAL\]/, "").trim();
          } catch (e) {
            console.error("Failed to parse plan proposal from AI response", e);
          }
        }

        const assistantMsg: ChatMessage = {
          id: `chat-${Date.now()}`,
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
          proposedChanges: proposal,
          isAiGenerated: true,
          modelUsed: "Gemini 2.5 Flash",
        };

        return { message: assistantMsg, providerUsed: "Gemini 2.5 Flash" };
      } catch (err) {
        console.warn("Gemini Chat failed, using deterministic contextual engine:", err);
      }
    }

    // --- Deterministic Contextual Assistant Fallback ---
    let reply = "";
    let proposedChanges: PlanChangeProposal | undefined;

    if (lower.includes("save") || lower.includes("budget") || lower.includes("cut") || lower.includes("reduce")) {
      const suggestedSaving = Math.round(totalBudget * 0.05);
      reply = `To optimize your budget without diluting guest experience for "${event.title}", here are 3 high-impact strategies:

1. **Strategic Catering Mix**: Replace 2 heavy fried starters with 2 live street food counters (e.g. chaat/puchka). This reduces catering overhead by ~₹${Math.round(
        suggestedSaving * 0.5
      ).toLocaleString("en-IN")} and guests usually prefer live interactive counters.
2. **Hybrid Floral Decor**: Restrict fresh premium flowers to the eye-level mandap/photo-backdrop, and utilize high-grade silk florals for higher rafters. This saves approximately ₹${Math.round(
        suggestedSaving * 0.35
      ).toLocaleString("en-IN")}.
3. **Digital-First Invitations**: Reserve physical boxed cards for immediate elders and distribute elegant animated video invitations with interactive RSVP tracking to friends and out-of-town guests.

Total potential savings: **₹${suggestedSaving.toLocaleString("en-IN")}**`;

      proposedChanges = {
        type: "update_budget",
        description: `Apply suggested savings of ₹${suggestedSaving.toLocaleString("en-IN")} to emergency reserve`,
        details: {
          suggestedSavings: suggestedSaving,
        },
      };
    } else if (lower.includes("week") || lower.includes("todo") || lower.includes("do next") || lower.includes("task")) {
      const pendingTasks = event.timeline.tasks.filter((t) => t.status !== "completed").slice(0, 3);
      if (pendingTasks.length > 0) {
        reply = `Here are your top prioritized action items to focus on this week:

${pendingTasks.map((t, idx) => `${idx + 1}. **${t.title}** (Priority: ${t.priority.toUpperCase()}, Due: ${t.dueDate || "Upcoming"})\n   *${t.description}*`).join("\n\n")}

Focusing on locking these down will keep your planning momentum on schedule!`;
      } else {
        reply = `Outstanding progress! All your currently scheduled milestone tasks are marked completed. You can relax or add custom tasks for specific family requirements.`;
      }
    } else if (lower.includes("guest") || lower.includes("increase") || lower.includes("50")) {
      const extraGuests = 50;
      const cateringPerGuest = Math.round(
        (event.budget.categories.find((c) => c.id === "catering")?.allocatedAmount || 200000) / Math.max(1, guestCount)
      );
      const estExtraCatering = cateringPerGuest * extraGuests;
      const estExtraFavors = Math.round(extraGuests * 150);
      const totalImpact = estExtraCatering + estExtraFavors;

      reply = `If your guest count expands by +${extraGuests} (from ${guestCount} to ${guestCount + extraGuests}):

- **Catering Impact**: ~₹${estExtraCatering.toLocaleString("en-IN")} (at ₹${cateringPerGuest.toLocaleString("en-IN")} per plate)
- **Favors & Stationery**: ~₹${estExtraFavors.toLocaleString("en-IN")}
- **Total Projected Cost Increase**: **₹${totalImpact.toLocaleString("en-IN")}**

**Recommendation**: Your emergency contingency reserve is ₹${event.budget.emergencyReserveAmount.toLocaleString(
        "en-IN"
      )}. This buffer can absorb the expansion, or you can negotiate a bulk plate concession with your caterer.`;
    } else {
      reply = `For "${event.title}" (${event.location.city}, ${guestCount} guests, budget ₹${totalBudget.toLocaleString(
        "en-IN"
      )}), everything is well balanced.

You can ask me to:
- Compare vendor quotations
- Simulate a guest increase or decrease
- Suggest cost reductions
- Draft a 7-day final countdown runsheet
- Tailor ${event.preferences.culturalRegion} ceremonial traditions.`;
    }

    const fallbackMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: "assistant",
      content: reply,
      timestamp: new Date().toISOString(),
      proposedChanges,
      isAiGenerated: true,
      modelUsed: "Local Intelligence Engine (Deterministic)",
    };

    return { message: fallbackMsg, providerUsed: "Local Intelligence Engine (Deterministic)" };
  },
};
