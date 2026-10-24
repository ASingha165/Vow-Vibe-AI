import { EventPlan } from "@/types/event";
import { DEMO_BENGALI_WEDDING, createDemoBengaliWedding } from "@/data/demoEvent";

const ACTIVE_EVENT_ID_KEY = "vow_vibe_active_event_id";
const EVENTS_STORAGE_KEY = "vow_vibe_events_list";
const WIZARD_DRAFT_KEY = "vow_vibe_wizard_draft";

/**
 * Storage Service:
 * Provides client-side persistence with fallback for local development mode.
 * Supabase can be connected via environment variables without breaking this interface.
 */
export const StorageService = {
  // --- Active Event Management ---
  getActiveEventId(): string {
    if (typeof window === "undefined") return DEMO_BENGALI_WEDDING.id;
    return localStorage.getItem(ACTIVE_EVENT_ID_KEY) || DEMO_BENGALI_WEDDING.id;
  },

  setActiveEventId(id: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACTIVE_EVENT_ID_KEY, id);
  },

  // --- Get All Events ---
  getAllEvents(): EventPlan[] {
    if (typeof window === "undefined") return [DEMO_BENGALI_WEDDING];
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!raw) {
        // Initialize with default demo event
        const initial = [createDemoBengaliWedding()];
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed: EventPlan[] = JSON.parse(raw);
      // Ensure demo event exists if list is empty
      const demoIdx = parsed.findIndex((e) => e.id === DEMO_BENGALI_WEDDING.id);
      if (demoIdx === -1 && parsed.length === 0) {
        parsed.unshift(createDemoBengaliWedding());
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error("Failed to read events from localStorage", e);
      return [createDemoBengaliWedding()];
    }
  },

  // --- Get Specific Event ---
  getEventById(id: string): EventPlan | null {
    const events = this.getAllEvents();
    return events.find((e) => e.id === id) || null;
  },

  // --- Get Current Active Event ---
  getCurrentEvent(): EventPlan {
    const activeId = this.getActiveEventId();
    const event = this.getEventById(activeId);
    if (event) return event;
    const all = this.getAllEvents();
    return all[0] || DEMO_BENGALI_WEDDING;
  },

  // --- Save / Update Event ---
  saveEvent(event: EventPlan): void {
    if (typeof window === "undefined") return;
    try {
      const events = this.getAllEvents();
      const existingIdx = events.findIndex((e) => e.id === event.id);
      const updatedEvent = {
        ...event,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        events[existingIdx] = updatedEvent;
      } else {
        events.push(updatedEvent);
      }

      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      localStorage.setItem(ACTIVE_EVENT_ID_KEY, updatedEvent.id);
    } catch (e) {
      console.error("Failed to save event to localStorage", e);
    }
  },

  // --- Delete Event ---
  deleteEvent(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const events = this.getAllEvents().filter((e) => e.id !== id);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      if (this.getActiveEventId() === id) {
        this.setActiveEventId(events[0]?.id || DEMO_BENGALI_WEDDING.id);
      }
    } catch (e) {
      console.error("Failed to delete event", e);
    }
  },

  // --- Reset Demo Event to Pristine State ---
  resetDemoEvent(): EventPlan {
    if (typeof window === "undefined") return createDemoBengaliWedding();
    try {
      const events = this.getAllEvents().filter((e) => e.id !== DEMO_BENGALI_WEDDING.id);
      const freshDemo = { ...createDemoBengaliWedding(), updatedAt: new Date().toISOString() };
      events.unshift(freshDemo);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      localStorage.setItem(ACTIVE_EVENT_ID_KEY, freshDemo.id);
      return freshDemo;
    } catch (e) {
      console.error("Failed to reset demo event", e);
      return createDemoBengaliWedding();
    }
  },

  // --- Wizard Draft Management ---
  saveWizardDraft(draftData: unknown): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(draftData));
    } catch (e) {
      console.error("Failed to save wizard draft", e);
    }
  },

  getWizardDraft<T>(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(WIZARD_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearWizardDraft(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(WIZARD_DRAFT_KEY);
  },
};
