import { EventCategory, EventTask, TaskPriority, TaskStatus } from "@/types/event";

interface TaskSeed {
  title: string;
  description: string;
  offsetDays: number; // Negative = days before event; 0 = event day; Positive = post event
  priority: TaskPriority;
  relatedCategory: string;
}

const WEDDING_TASK_SEEDS: TaskSeed[] = [
  {
    title: "Finalize Date & Lock Core Budget",
    description: "Agree upon auspicious mahurat / preferred dates with family and set a hard ceiling for total expenses.",
    offsetDays: -180,
    priority: "critical",
    relatedCategory: "Venue & Lawns",
  },
  {
    title: "Inspect & Book Primary Venue",
    description: "Verify capacity, parking, catering permissions, sound curfew, and air conditioning before signing contract.",
    offsetDays: -150,
    priority: "critical",
    relatedCategory: "Venue & Lawns",
  },
  {
    title: "Shortlist & Taste Test Caterers",
    description: "Request menu tasting session for regional delicacies (e.g. Bhetki Paturi, Biryani, Mutton Rogan Josh).",
    offsetDays: -120,
    priority: "high",
    relatedCategory: "Catering & Beverages",
  },
  {
    title: "Hire Lead Candid Photographer & Cinematographer",
    description: "Review past full wedding albums, confirm drone permissions, delivery timelines, and payment milestones.",
    offsetDays: -100,
    priority: "high",
    relatedCategory: "Photography & Cinema",
  },
  {
    title: "Finalize Decor Theme & Mandap Layout",
    description: "Approve 3D render or mood board for floral color palettes, entrance gate, and stage lighting.",
    offsetDays: -80,
    priority: "medium",
    relatedCategory: "Floral & Decor",
  },
  {
    title: "Bridal & Groom Attire Fittings",
    description: "Order wedding outfits, schedule trial sessions for tailoring, and match accessories/footwear.",
    offsetDays: -60,
    priority: "high",
    relatedCategory: "Attire & Styling",
  },
  {
    title: "Dispatch Save-the-Dates & Digital Invites",
    description: "Send WhatsApp video invites, launch event itinerary website, and request early guest RSVPs.",
    offsetDays: -45,
    priority: "medium",
    relatedCategory: "Invitations & Stationery",
  },
  {
    title: "Book DJ, Sound System & Sangeet Choreographer",
    description: "Finalize playlist preferences, couple entry songs, and schedule family dance rehearsals.",
    offsetDays: -30,
    priority: "medium",
    relatedCategory: "Music, DJ & Entertainment",
  },
  {
    title: "Confirm Room Allocations & Guest Transport",
    description: "Assign hotel room blocks, arrange airport/railway station pick-up cabs for outstation relatives.",
    offsetDays: -20,
    priority: "medium",
    relatedCategory: "Transport & Hospitality",
  },
  {
    title: "Final Headcount Recheck with Caterer",
    description: "Lock guaranteed plate count with caterer (allow 5-10% buffer) to avoid over-ordering food.",
    offsetDays: -10,
    priority: "critical",
    relatedCategory: "Catering & Beverages",
  },
  {
    title: "Emergency Kit & Day-of Runsheet Distribution",
    description: "Prepare bridal safety pin/makeup touch-up kit, cash envelopes for priest/tips, and assign point persons.",
    offsetDays: -3,
    priority: "critical",
    relatedCategory: "Venue & Lawns",
  },
  {
    title: "Post-Event Settlements & Thank-You Notes",
    description: "Settle final outstanding balances with vendors, return rented equipment, and send thank-you messages.",
    offsetDays: 3,
    priority: "low",
    relatedCategory: "Gifts & Favors",
  },
];

const BIRTHDAY_TASK_SEEDS: TaskSeed[] = [
  {
    title: "Choose Birthday Theme & Reserve Venue",
    description: "Select party theme (e.g. Retro, Superhero, Bohemian) and book party hall or garden.",
    offsetDays: -30,
    priority: "critical",
    relatedCategory: "Venue / Space",
  },
  {
    title: "Order Custom Designer Cake & Finalize Menu",
    description: "Order multi-tier or shaped birthday cake and arrange finger foods/mocktails.",
    offsetDays: -18,
    priority: "high",
    relatedCategory: "Food & Cake",
  },
  {
    title: "Send Digital Invites & Collect RSVPs",
    description: "Share animated invites with venue GPS location and dress code.",
    offsetDays: -14,
    priority: "medium",
    relatedCategory: "Invites & Printables",
  },
  {
    title: "Hire Entertainer / Emcee / Photo Booth",
    description: "Book magic show, game host, balloon artist, or 360-photo booth.",
    offsetDays: -10,
    priority: "medium",
    relatedCategory: "Host, Magic & Games",
  },
  {
    title: "Assemble Return Gifts & Party Favors",
    description: "Curate gift bags tailored to age group of attending guests.",
    offsetDays: -4,
    priority: "low",
    relatedCategory: "Return Gifts",
  },
  {
    title: "Day-of Setup & Music Playlist Check",
    description: "Inspect balloon decor, test bluetooth sound system, and setup cake table.",
    offsetDays: 0,
    priority: "critical",
    relatedCategory: "Thematic Decor & Balloons",
  },
];

const GENERAL_TASK_SEEDS: TaskSeed[] = [
  {
    title: "Define Objective & Budget Ceiling",
    description: "Confirm target audience, date, and overall budget allocation.",
    offsetDays: -60,
    priority: "critical",
    relatedCategory: "Venue Booking",
  },
  {
    title: "Reserve Event Venue & Permissions",
    description: "Secure booking, review noise guidelines and parking capacity.",
    offsetDays: -45,
    priority: "high",
    relatedCategory: "Venue Booking",
  },
  {
    title: "Lock Catering & Beverage Package",
    description: "Determine menu, live refreshment counters, and dietary needs.",
    offsetDays: -30,
    priority: "high",
    relatedCategory: "Food & Drinks",
  },
  {
    title: "Promote & Confirm Attendance",
    description: "Broadcast invitations, registration links, and track attendee count.",
    offsetDays: -20,
    priority: "medium",
    relatedCategory: "Miscellaneous & Favors",
  },
  {
    title: "Final Logistics & Equipment Run-Through",
    description: "Test projectors, audio microphones, and backup power generator.",
    offsetDays: -3,
    priority: "critical",
    relatedCategory: "Music / Activities",
  },
  {
    title: "Day-of Execution & Guest Welcoming",
    description: "Coordinate arrivals, schedule transitions, and oversee hospitality.",
    offsetDays: 0,
    priority: "critical",
    relatedCategory: "Venue Booking",
  },
];

/**
 * Generate initial task timeline mapped to target date
 */
export function generateTimelineTasks(
  category: EventCategory,
  targetDateStr: string,
  isTentative = false
): EventTask[] {
  let seeds = GENERAL_TASK_SEEDS;
  if (category === "wedding") {
    seeds = WEDDING_TASK_SEEDS;
  } else if (category === "birthday") {
    seeds = BIRTHDAY_TASK_SEEDS;
  }

  const baseDate = targetDateStr ? new Date(targetDateStr) : new Date(Date.now() + 90 * 86400000);

  return seeds.map((seed, idx) => {
    const taskDate = new Date(baseDate);
    taskDate.setDate(taskDate.getDate() + seed.offsetDays);

    const year = taskDate.getFullYear();
    const month = String(taskDate.getMonth() + 1).padStart(2, "0");
    const day = String(taskDate.getDate()).padStart(2, "0");
    const computedDueDate = `${year}-${month}-${day}`;

    // Check if task is already in the past relative to today
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const isPastDue = taskDate < now;

    return {
      id: `task-${idx + 1}-${Date.now().toString(36)}`,
      title: seed.title,
      description: seed.description,
      dueDate: computedDueDate,
      relativeOffsetDays: seed.offsetDays,
      priority: seed.priority,
      status: isPastDue ? "completed" : "todo",
      relatedCategory: seed.relatedCategory,
      isCustom: false,
    };
  });
}

/**
 * Calculate progress metrics for tasks
 */
export function calculateTaskMetrics(tasks: EventTask[]) {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      overdue: 0,
      completionRate: 0,
    };
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;

  const overdue = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate && t.dueDate < todayStr
  ).length;

  const completionRate = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    inProgress,
    todo,
    overdue,
    completionRate,
  };
}

/**
 * Filter and sort tasks
 */
export function filterAndSortTasks(
  tasks: EventTask[],
  filterStatus: "all" | TaskStatus,
  filterPriority: "all" | TaskPriority,
  searchQuery = ""
): EventTask[] {
  return tasks
    .filter((task) => {
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesCat = task.relatedCategory?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesCat;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort completed to bottom
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      // Sort by due date
      return (a.dueDate || "").localeCompare(b.dueDate || "");
    });
}
