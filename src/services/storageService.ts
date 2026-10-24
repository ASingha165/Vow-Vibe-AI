import { EventPlan } from "@/types/event";
import { DEMO_BENGALI_WEDDING, createDemoBengaliWedding } from "@/data/demoEvent";

const ACTIVE_EVENT_ID_KEY = "vow_vibe_active_event_id";
const EVENTS_STORAGE_KEY = "vow_vibe_events_list";
const WIZARD_DRAFT_KEY = "vow_vibe_wizard_draft";

// In-memory fallback store for SSR and automated testing environments
const memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  }
  return memoryStore[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      memoryStore[key] = value;
      return;
    }
  }
  memoryStore[key] = value;
}

function removeStorageItem(key: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
      return;
    } catch {
      delete memoryStore[key];
      return;
    }
  }
  delete memoryStore[key];
}

/**
 * Storage Service:
 * Provides client-side persistence with fallback for local development mode.
 * Supabase can be connected via environment variables without breaking this interface.
 */
export const StorageService = {
  // --- Active Event Management ---
  getActiveEventId(): string {
    return getStorageItem(ACTIVE_EVENT_ID_KEY) || DEMO_BENGALI_WEDDING.id;
  },

  setActiveEventId(id: string): void {
    if (!id || typeof id !== "string") return;
    setStorageItem(ACTIVE_EVENT_ID_KEY, id);
  },

  // --- Normalize Event to Guarantee Full Data Contract ---
  normalizeEvent(raw: any): EventPlan {
    const fallback = createDemoBengaliWedding();
    if (!raw || typeof raw !== "object") return fallback;

    const id = raw.id && typeof raw.id === "string" ? raw.id : `plan-${Date.now().toString(36)}`;
    const title = raw.title && typeof raw.title === "string" ? raw.title : "My Celebration";
    const category = raw.category || "wedding";
    const eventDate = raw.eventDate && typeof raw.eventDate === "string" ? raw.eventDate : fallback.eventDate;
    const isTentativeDate = Boolean(raw.isTentativeDate);

    const location = {
      city: raw.location?.city || "Kolkata, West Bengal",
      venueType: raw.location?.venueType || "indoor",
      venueName: raw.location?.venueName || "",
    };

    const guests = {
      expectedCount: typeof raw.guests?.expectedCount === "number" ? raw.guests.expectedCount : 100,
      flexibility: raw.guests?.flexibility || "moderate",
    };

    const totalBudget = typeof raw.budget?.totalBudget === "number" ? raw.budget.totalBudget : 500000;
    const emergencyReservePct =
      typeof raw.budget?.emergencyReservePct === "number" ? raw.budget.emergencyReservePct : 10;
    const emergencyReserveAmount =
      typeof raw.budget?.emergencyReserveAmount === "number"
        ? raw.budget.emergencyReserveAmount
        : Math.round((totalBudget * emergencyReservePct) / 100);

    const budget = {
      totalBudget,
      currency: raw.budget?.currency || "INR",
      emergencyReservePct,
      emergencyReserveAmount,
      categories: Array.isArray(raw.budget?.categories) && raw.budget.categories.length > 0
        ? raw.budget.categories
        : fallback.budget.categories,
      expenses: Array.isArray(raw.budget?.expenses) ? raw.budget.expenses : [],
    };

    const preferences = {
      theme: raw.preferences?.theme || "Modern Celebration",
      preferredColors: Array.isArray(raw.preferences?.preferredColors) ? raw.preferences.preferredColors : [],
      culturalRegion: raw.preferences?.culturalRegion || "Pan-Indian Contemporary",
      foodPreferences: Array.isArray(raw.preferences?.foodPreferences) ? raw.preferences.foodPreferences : [],
      formality: raw.preferences?.formality || "formal",
      accessibilityRequirements: raw.preferences?.accessibilityRequirements || "",
      mustHaves: Array.isArray(raw.preferences?.mustHaves) ? raw.preferences.mustHaves : [],
      thingsToAvoid: Array.isArray(raw.preferences?.thingsToAvoid) ? raw.preferences.thingsToAvoid : [],
    };

    const planning = {
      stage: raw.planning?.stage || "just_started",
      diyLevel: raw.planning?.diyLevel || "hybrid",
      priorityCategories: Array.isArray(raw.planning?.priorityCategories) ? raw.planning.priorityCategories : [],
      sustainabilityNotes: raw.planning?.sustainabilityNotes || "",
      specialRequirements: raw.planning?.specialRequirements || "",
    };

    const aiOverview = {
      executiveSummary: raw.aiOverview?.executiveSummary || "A curated, beautifully orchestrated celebration.",
      themeConcept: raw.aiOverview?.themeConcept || preferences.theme,
      recommendedActivities: Array.isArray(raw.aiOverview?.recommendedActivities)
        ? raw.aiOverview.recommendedActivities
        : fallback.aiOverview.recommendedActivities,
      culturalHighlights: Array.isArray(raw.aiOverview?.culturalHighlights)
        ? raw.aiOverview.culturalHighlights
        : fallback.aiOverview.culturalHighlights,
      guestExperienceTips: Array.isArray(raw.aiOverview?.guestExperienceTips)
        ? raw.aiOverview.guestExperienceTips
        : fallback.aiOverview.guestExperienceTips,
    };

    const timeline = {
      tasks: Array.isArray(raw.timeline?.tasks) && raw.timeline.tasks.length > 0
        ? raw.timeline.tasks
        : fallback.timeline.tasks,
    };

    const vendors = Array.isArray(raw.vendors) && raw.vendors.length > 0 ? raw.vendors : fallback.vendors;
    const risks = Array.isArray(raw.risks) && raw.risks.length > 0 ? raw.risks : fallback.risks;
    const chatHistory = Array.isArray(raw.chatHistory) ? raw.chatHistory : fallback.chatHistory;

    return {
      id,
      title,
      tagline: raw.tagline || "",
      category,
      eventDate,
      isTentativeDate,
      location,
      guests,
      budget,
      preferences,
      planning,
      aiOverview,
      timeline,
      vendors,
      risks,
      chatHistory,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
      isDemo: Boolean(raw.isDemo),
    };
  },

  // --- Get All Events ---
  getAllEvents(): EventPlan[] {
    try {
      const raw = getStorageItem(EVENTS_STORAGE_KEY);
      if (!raw) {
        const initial = [createDemoBengaliWedding()];
        setStorageItem(EVENTS_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        const initial = [createDemoBengaliWedding()];
        setStorageItem(EVENTS_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const normalized = parsed.map((e) => this.normalizeEvent(e));
      if (normalized.length === 0) {
        normalized.push(createDemoBengaliWedding());
        setStorageItem(EVENTS_STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
    } catch (e) {
      console.error("Failed to read events from storage", e);
      return [createDemoBengaliWedding()];
    }
  },

  // --- Get Specific Event ---
  getEventById(id: string): EventPlan | null {
    if (!id || typeof id !== "string") return null;
    const events = this.getAllEvents();
    const match = events.find((e) => e.id === id);
    return match ? this.normalizeEvent(match) : null;
  },

  // --- Get Current Active Event ---
  getCurrentEvent(): EventPlan {
    const activeId = this.getActiveEventId();
    const event = this.getEventById(activeId);
    if (event) return event;
    const all = this.getAllEvents();
    return all[0] || createDemoBengaliWedding();
  },

  // --- Save / Update Event ---
  saveEvent(event: EventPlan): boolean {
    try {
      if (!event || !event.id || typeof event.id !== "string") {
        console.error("StorageService.saveEvent: Missing valid event id", event);
        return false;
      }
      if (!event.eventDate || typeof event.eventDate !== "string") {
        console.error("StorageService.saveEvent: Missing valid eventDate", event);
        return false;
      }

      const normalized = this.normalizeEvent(event);
      const events = this.getAllEvents();
      const existingIdx = events.findIndex((e) => e.id === normalized.id);

      if (existingIdx >= 0) {
        events[existingIdx] = normalized;
      } else {
        events.push(normalized);
      }

      setStorageItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      setStorageItem(ACTIVE_EVENT_ID_KEY, normalized.id);
      return true;
    } catch (e) {
      console.error("Failed to save event to storage", e);
      return false;
    }
  },

  // --- Delete Event ---
  deleteEvent(id: string): void {
    try {
      const events = this.getAllEvents().filter((e) => e.id !== id);
      setStorageItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      if (this.getActiveEventId() === id) {
        this.setActiveEventId(events[0]?.id || DEMO_BENGALI_WEDDING.id);
      }
    } catch (e) {
      console.error("Failed to delete event", e);
    }
  },

  // --- Reset Demo Event to Pristine State ---
  resetDemoEvent(): EventPlan {
    try {
      const events = this.getAllEvents().filter((e) => e.id !== DEMO_BENGALI_WEDDING.id);
      const freshDemo = { ...createDemoBengaliWedding(), updatedAt: new Date().toISOString() };
      events.unshift(freshDemo);
      setStorageItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      setStorageItem(ACTIVE_EVENT_ID_KEY, freshDemo.id);
      return freshDemo;
    } catch (e) {
      console.error("Failed to reset demo event", e);
      return createDemoBengaliWedding();
    }
  },

  // --- Wizard Draft Management ---
  saveWizardDraft(draftData: unknown): void {
    try {
      setStorageItem(WIZARD_DRAFT_KEY, JSON.stringify(draftData));
    } catch (e) {
      console.error("Failed to save wizard draft", e);
    }
  },

  getWizardDraft<T>(): T | null {
    try {
      const raw = getStorageItem(WIZARD_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearWizardDraft(): void {
    removeStorageItem(WIZARD_DRAFT_KEY);
  },
};
