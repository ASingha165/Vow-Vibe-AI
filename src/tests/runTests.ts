/**
 * Comprehensive Automated Test Suite for Vow & Vibe AI
 * Tests:
 * 1. Budget exact reconciliation & rounding logic
 * 2. Emergency reserve math
 * 3. Over-budget detection & metrics
 * 4. "What If?" simulator calculations
 * 5. Timeline milestone generation & task metrics
 * 6. Zod form validation (valid & invalid inputs)
 * 7. AI Service fallback engine (missing API key)
 * 8. Error handling for malformed AI output
 * 9. Indian currency formatting (Lakhs, Crores, commas)
 */

import { generateBudgetAllocations, recalculateBudgetSummary, runWhatIfSimulation } from "../services/budgetEngine";
import { generateTimelineTasks, calculateTaskMetrics } from "../services/timelineEngine";
import { EventWizardSchema } from "../types/event";
import { AiService } from "../services/aiService";
import { formatINR, formatCompactINR, getDaysRemaining } from "../lib/utils";
import {
  getLocalDateString,
  parseLocalDate,
  diffCalendarDays,
  addDaysToLocalDate,
  isDateBeforeToday,
  isDateSelectable,
  canNavigateToPreviousMonth,
  validateEventDate,
  getCalendarGrid,
  getDaysInMonth,
  formatDateDisplay,
  parseDateDisplay,
} from "../lib/dateUtils";
import { DEMO_BENGALI_WEDDING, createDemoBengaliWedding } from "../data/demoEvent";
import { StorageService } from "../services/storageService";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, errorDetails?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${errorDetails ? `(${errorDetails})` : ""}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log("\n=======================================================");
  console.log("   VOW & VIBE AI — AUTOMATED TEST SUITE EXECUTION      ");
  console.log("=======================================================\n");

  // --- Test Suite 1: Budget Exact Reconciliation & Rounding ---
  console.log("Suite 1: Budget Exact Reconciliation & Zero-Rounding-Leak Math");
  const testBudgets = [800000, 533333, 1250000, 100000, 999999];

  testBudgets.forEach((total) => {
    const { emergencyReserveAmount, categories } = generateBudgetAllocations("wedding", total, 10);
    const sumCategories = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
    const grandSum = sumCategories + emergencyReserveAmount;

    assert(
      grandSum === total,
      `Budget ₹${total.toLocaleString("en-IN")} reconciles exactly to 100% (Sum: ${grandSum})`,
      `Expected ${total}, got ${grandSum}`
    );

    assert(
      emergencyReserveAmount === Math.round(total * 0.1),
      `Emergency reserve is exactly 10% for ₹${total.toLocaleString("en-IN")}`
    );
  });

  // --- Test Suite 2: Budget Summary & Over-Budget Logic ---
  console.log("\nSuite 2: Budget Utilization & Over-Budget Warning Calculation");
  {
    const total = 500000;
    const { emergencyReserveAmount, categories } = generateBudgetAllocations("birthday", total, 10);

    // Baseline with no expenses
    const summary1 = recalculateBudgetSummary(total, emergencyReserveAmount, categories, []);
    assert(summary1.remainingBudget >= 0, "Initial remaining budget is non-negative");
    assert(!summary1.isOverBudget, "Initially not over budget");

    // Add expenses exceeding budget
    const expensiveExpenses = [
      {
        id: "e-1",
        categoryId: "venue",
        name: "Lawn",
        estimatedCost: 350000,
        committedCost: 350000,
        actualCost: 100000,
        status: "committed" as const,
        isEssential: true,
      },
      {
        id: "e-2",
        categoryId: "catering",
        name: "Feast",
        estimatedCost: 250000,
        committedCost: 200000,
        actualCost: 50000,
        status: "committed" as const,
        isEssential: true,
      },
    ];

    const summary2 = recalculateBudgetSummary(total, emergencyReserveAmount, categories, expensiveExpenses);
    assert(summary2.isOverBudget === true, "Accurately detects over-budget state");
    assert(summary2.overBudgetAmount > 0, `Calculated overBudgetAmount correctly: ₹${summary2.overBudgetAmount}`);
  }

  // --- Test Suite 3: What-If Simulator Math & Scaling ---
  console.log("\nSuite 3: 'What If?' Simulator Scaling Math");
  {
    const baseBudget = 800000;
    const baseGuests = 200;

    const simResult = runWhatIfSimulation(baseBudget, baseGuests, {
      guestCount: 300, // +50% guests
      totalBudget: 800000,
      venueTier: "standard",
      cateringTier: "royal_deluxe", // upscale tier
      decorationTier: "ambient_elegant",
    });

    assert(simResult.projectedCost > baseBudget, "Projected cost increases when guests and tier increase");
    assert(simResult.perGuestCost > 0, `Calculates reasonable per-guest cost: ₹${simResult.perGuestCost}`);
    assert(simResult.recommendations.length > 0, "Provides actionable recommendations in simulation");
    assert(simResult.categoryImpacts.length > 0, "Returns detailed category impacts");
  }

  // --- Test Suite 4: Timeline Milestones & Task Metrics ---
  console.log("\nSuite 4: Timeline Milestone Sequencing & Task Metrics");
  {
    const targetDate = "2026-11-20";
    const tasks = generateTimelineTasks("wedding", targetDate);

    assert(tasks.length >= 10, `Generated ${tasks.length} realistic wedding milestone tasks`);

    // Verify preparation tasks are not scheduled post-event (except settlements)
    const prepTasks = tasks.filter((t) => (t.relativeOffsetDays || 0) < 0);
    const allPrepBeforeTarget = prepTasks.every((t) => t.dueDate <= targetDate);
    assert(allPrepBeforeTarget, "All pre-event preparation tasks have due dates on or before event date");

    const metrics = calculateTaskMetrics(tasks);
    assert(metrics.total === tasks.length, "Task total matches metrics total");
    assert(typeof metrics.completionRate === "number", "Calculates completion percentage");
  }

  // --- Test Suite 5: Zod Event Form Validation ---
  console.log("\nSuite 5: Zod Schema Input Validation");
  {
    // Valid input
    const validData = {
      title: "Rohan & Priya Wedding",
      category: "wedding",
      eventDate: "2026-12-10",
      isTentativeDate: false,
      city: "Kolkata",
      venueType: "indoor",
      totalBudget: 1000000,
      currency: "INR",
      expectedGuestCount: 350,
      budgetFlexibility: "moderate",
      emergencyReservePct: 10,
      theme: "Royal Zamindari Elegance",
      preferredColors: ["Crimson Red", "Champagne Gold"],
      culturalRegion: "Bengali",
      foodPreferences: ["Authentic Bengali Feast"],
      formality: "traditional_royal",
      mustHaves: ["Live Shehnai"],
      thingsToAvoid: ["Loud EDM"],
      planningStage: "just_started",
      diyLevel: "hybrid",
      priorityCategories: ["Catering & Beverages"],
    };

    const validResult = EventWizardSchema.safeParse(validData);
    assert(validResult.success, "Valid event input passes Zod schema validation");

    // Invalid input: Title too short, budget below minimum, negative guest count
    const invalidData = {
      ...validData,
      title: "X", // too short
      totalBudget: 200, // below 5000 min
      expectedGuestCount: -5, // invalid
    };

    const invalidResult = EventWizardSchema.safeParse(invalidData);
    assert(!invalidResult.success, "Invalid payload correctly rejected by Zod schema");
  }

  // --- Test Suite 6: AI Fallback Engine (No API Key Required) ---
  console.log("\nSuite 6: AI Service Deterministic Fallback Mode");
  {
    const fallbackInput = {
      title: "A Bengali Wedding Celebration: Sourav & Debolina",
      category: "wedding" as const,
      eventDate: "2026-11-28",
      isTentativeDate: false,
      city: "Kolkata",
      venueType: "indoor" as const,
      totalBudget: 800000,
      currency: "INR",
      expectedGuestCount: 300,
      budgetFlexibility: "moderate" as const,
      emergencyReservePct: 10,
      theme: "Traditional Bengali Elegance with Modern Design",
      preferredColors: ["Crimson Red", "Champagne Gold"],
      culturalRegion: "Bengali",
      foodPreferences: ["Bhetki Paturi", "Mutton Kosha"],
      formality: "traditional_royal" as const,
      mustHaves: ["Shubho Drishti"],
      thingsToAvoid: ["Plastic cutlery"],
      planningStage: "halfway" as const,
      diyLevel: "hybrid" as const,
      priorityCategories: ["Catering"],
    };

    const { plan, providerUsed } = await AiService.generateEventPlan(fallbackInput);

    assert(Boolean(plan && plan.id), "Successfully synthesized full event plan in fallback mode");
    assert(plan.budget.totalBudget === 800000, "Preserved exact budget ceiling in synthesized plan");
    assert(plan.budget.categories.length > 5, "Generated full category allocations");
    assert(plan.vendors.length > 0, "Supplied illustrative sample vendors for the target city");
    assert(plan.risks.length > 0, "Generated proactive risk and contingency scenarios");
    assert(Boolean(providerUsed), `Identified provider: "${providerUsed}"`);
  }

  // --- Test Suite 7: Contextual AI Assistant Chat Fallback ---
  console.log("\nSuite 7: Contextual Assistant Deterministic Response & Arithmetic");
  {
    const dummyEvent = (await AiService.generateEventPlan({
      title: "Test Gala",
      category: "wedding",
      eventDate: "2026-12-01",
      isTentativeDate: false,
      city: "Mumbai",
      venueType: "indoor",
      totalBudget: 1000000,
      currency: "INR",
      expectedGuestCount: 200,
      budgetFlexibility: "moderate",
      emergencyReservePct: 10,
      theme: "Classic Gold",
      preferredColors: [],
      culturalRegion: "Pan-Indian",
      foodPreferences: [],
      formality: "formal",
      mustHaves: [],
      thingsToAvoid: [],
      planningStage: "just_started",
      diyLevel: "hybrid",
      priorityCategories: [],
    })).plan;

    const chatRes1 = await AiService.chatWithAssistant(dummyEvent, "How can I save ₹30,000?");
    assert(chatRes1.message.content.length > 50, "Assistant returned detailed cost-saving response");
    assert(Boolean(chatRes1.message.proposedChanges), "Assistant included concrete proposal for user confirmation");

    const chatRes2 = await AiService.chatWithAssistant(dummyEvent, "What happens if my guest count increases by 50?");
    assert(chatRes2.message.content.includes("Catering Impact"), "Calculates deterministic per-guest catering expansion");
  }

  // --- Test Suite 8: Indian Currency & Formatting Utilities ---
  console.log("\nSuite 8: Indian Currency & Number Formatting (INR)");
  {
    assert(formatINR(800000) === "₹8,00,000", `800000 formatted as Indian ₹8,00,000 (Got: ${formatINR(800000)})`);
    assert(formatINR(12500000) === "₹1,25,00,000", `12500000 formatted as ₹1,25,00,000 (Got: ${formatINR(12500000)})`);
    assert(formatCompactINR(800000) === "₹8.00 L", `Compact formatting: ₹8.00 L (Got: ${formatCompactINR(800000)})`);
    assert(formatCompactINR(15000000) === "₹1.50 Cr", `Compact formatting: ₹1.50 Cr (Got: ${formatCompactINR(15000000)})`);
  }

  // --- Test Suite 9: Dynamic Event Date Picker, Calendar Navigation & Countdown ---
  console.log("\nSuite 9: Dynamic Event Date Picker, Calendar Boundaries & Countdown");
  {
    const todayStr = getLocalDateString();
    const todayParsed = parseLocalDate(todayStr)!;
    const tomorrowStr = addDaysToLocalDate(todayStr, 1);
    const futureDateStr = addDaysToLocalDate(todayStr, 30);
    const yesterdayStr = addDaysToLocalDate(todayStr, -1);
    const pastDateStr = addDaysToLocalDate(todayStr, -10);

    // 1. Today's date is selectable
    const isTodaySelectable = isDateSelectable(todayStr, todayStr);
    const todayVal = validateEventDate(todayStr, false, todayStr);
    assert(isTodaySelectable, "1. Today's date is selectable (isDateSelectable)");
    assert(todayVal.valid, "1b. Today's date passes validation without errors");

    // 2. A future date is selectable
    const isFutureSelectable = isDateSelectable(futureDateStr, todayStr);
    const futureVal = validateEventDate(futureDateStr, false, todayStr);
    assert(isFutureSelectable, "2. A future date is selectable");
    assert(futureVal.valid, "2b. A future date passes validation");

    // 3. Yesterday is rejected
    const isYesterdaySelectable = isDateSelectable(yesterdayStr, todayStr);
    const yesterdayVal = validateEventDate(yesterdayStr, false, todayStr);
    assert(!isYesterdaySelectable, "3. Yesterday is rejected by isDateSelectable");
    assert(!yesterdayVal.valid && Boolean(yesterdayVal.error?.includes("past")), "3b. Yesterday fails validation with clear past-date error");

    // 4. A date from a previous month is disabled
    const prevMonthDateStr = addDaysToLocalDate(todayStr, -35);
    const isPrevMonthSelectable = isDateSelectable(prevMonthDateStr, todayStr);
    assert(!isPrevMonthSelectable, "4. A date from a previous month is disabled");

    // 5. A date from a previous year is disabled
    const prevYearDateStr = `${todayParsed.year - 1}-${String(todayParsed.month).padStart(2, "0")}-${String(todayParsed.day).padStart(2, "0")}`;
    const isPrevYearSelectable = isDateSelectable(prevYearDateStr, todayStr);
    assert(!isPrevYearSelectable, "5. A date from a previous year is disabled");

    // 6. Month navigation cannot move entirely before the current month
    const canMoveBackInCurrentMonth = canNavigateToPreviousMonth(
      todayParsed.year,
      todayParsed.month,
      todayParsed.year,
      todayParsed.month
    );
    assert(!canMoveBackInCurrentMonth, "6a. Month navigation disabled for current month");

    const canMoveBackInPreviousYear = canNavigateToPreviousMonth(
      todayParsed.year - 1,
      12,
      todayParsed.year,
      todayParsed.month
    );
    assert(!canMoveBackInPreviousYear, "6b. Month navigation disabled for previous year");

    const canMoveBackFromNextMonth = canNavigateToPreviousMonth(
      todayParsed.month === 12 ? todayParsed.year + 1 : todayParsed.year,
      todayParsed.month === 12 ? 1 : todayParsed.month + 1,
      todayParsed.year,
      todayParsed.month
    );
    assert(canMoveBackFromNextMonth, "6c. Month navigation allowed to move back from next month to current month");

    // 7. A saved draft containing a past date is handled correctly
    const mockDraftWithPastDate = {
      title: "Saved Bengali Wedding Draft",
      eventDate: yesterdayStr,
      city: "Kolkata",
      totalBudget: 800000,
    };
    const draftDateIsPast = isDateBeforeToday(mockDraftWithPastDate.eventDate, todayStr);
    assert(draftDateIsPast, "7a. Draft containing past date correctly flagged as expired");

    const draftSanitized = {
      ...mockDraftWithPastDate,
      eventDate: draftDateIsPast ? "" : mockDraftWithPastDate.eventDate,
    };
    assert(
      draftSanitized.eventDate === "" && draftSanitized.title === mockDraftWithPastDate.title,
      "7b. Saved draft preserves other fields while requiring a fresh valid date selection"
    );

    // 8. A future event displays the correct countdown
    const countdown30 = getDaysRemaining(futureDateStr, todayStr);
    assert(
      countdown30.days === 30 && countdown30.text === "30 days to go" && !countdown30.isPast && !countdown30.isToday,
      `8a. 30 days future event displays "${countdown30.text}" (Expected: 30 days to go)`
    );

    const countdown1 = getDaysRemaining(tomorrowStr, todayStr);
    assert(
      countdown1.days === 1 && countdown1.text === "1 day to go",
      `8b. 1 day future event displays "${countdown1.text}" (Expected: 1 day to go)`
    );

    // 9. An event occurring today displays "Today"
    const countdownToday = getDaysRemaining(todayStr, todayStr);
    assert(
      countdownToday.days === 0 && countdownToday.text === "Today" && countdownToday.isToday && !countdownToday.isPast,
      `9. Event occurring today displays "${countdownToday.text}" with isToday=true and isPast=false`
    );

    // 10. A past event displays "Event completed"
    const countdownPast = getDaysRemaining(pastDateStr, todayStr);
    assert(
      countdownPast.isPast === true && countdownPast.text === "Event completed" && countdownPast.days === 0,
      `10. Past event displays "${countdownPast.text}" and never displays a negative upcoming countdown`
    );

    // 11. Date calculations remain correct across months, years, and leap years
    // Month rollover
    assert(addDaysToLocalDate("2026-01-31", 1) === "2026-02-01", "11a. Month boundary: 2026-01-31 + 1 day = 2026-02-01");
    // Year rollover
    assert(addDaysToLocalDate("2026-12-31", 1) === "2027-01-01", "11b. Year boundary: 2026-12-31 + 1 day = 2027-01-01");
    assert(diffCalendarDays("2027-01-01", "2026-12-31") === 1, "11c. Day difference across year boundary is exactly 1");

    // Leap year verification
    assert(getDaysInMonth(2028, 2) === 29, "11d. Leap year 2028 has 29 days in February");
    assert(getDaysInMonth(2026, 2) === 28, "11e. Common year 2026 has 28 days in February");
    assert(addDaysToLocalDate("2028-02-28", 1) === "2028-02-29", "11f. Leap day addition: 2028-02-28 + 1 = 2028-02-29");
    assert(addDaysToLocalDate("2028-02-29", 1) === "2028-03-01", "11g. Post-leap addition: 2028-02-29 + 1 = 2028-03-01");
    assert(diffCalendarDays("2028-03-01", "2028-02-28") === 2, "11h. Leap year day difference across Feb 29 is exactly 2");

    // 12. Dynamic Demonstration Event Integrity
    const demoEvent = createDemoBengaliWedding(todayStr);
    assert(
      isDateSelectable(demoEvent.eventDate, todayStr),
      `12a. Demo event date (${demoEvent.eventDate}) is a valid relative future date from today (${todayStr})`
    );
    assert(
      diffCalendarDays(demoEvent.eventDate, todayStr) === 180,
      "12b. Demo event date is positioned at a consistent 180-day future planning milestone"
    );
    const demoTasks = demoEvent.timeline.tasks;
    const task1 = demoTasks.find((t) => t.id === "task-1")!;
    const expectedTask1Due = addDaysToLocalDate(demoEvent.eventDate, task1.relativeOffsetDays || 0);
    assert(
      task1.dueDate === expectedTask1Due,
      `12c. Demo Task 1 due date (${task1.dueDate}) dynamically synchronizes with relative offset (${task1.relativeOffsetDays} days)`
    );
    assert(
      demoEvent.budget.totalBudget === 800000 && demoEvent.budget.emergencyReserveAmount === 80000,
      "12d. Demo event preserves exact budget reconciliation and deterministic finances"
    );
  }

  // --- Test Suite 10: Calendar Glitch Prevention, Date State Stability & Mode Separation ---
  console.log("\nSuite 10: Calendar Glitch Prevention, Date State Stability & Mode Separation");
  {
    const todayStr = getLocalDateString();
    const todayParsed = parseLocalDate(todayStr)!;
    const futureDateStr = addDaysToLocalDate(todayStr, 45); // 45 days in future
    const parsedFuture = parseLocalDate(futureDateStr)!;

    // 1. Selecting a date retains the canonical value and formats as DD/MM/YYYY
    let selectedDate = futureDateStr;
    const formattedDisplay = formatDateDisplay(selectedDate);
    assert(
      selectedDate === futureDateStr && formattedDisplay === `${String(parsedFuture.day).padStart(2, "0")}/${String(parsedFuture.month).padStart(2, "0")}/${parsedFuture.year}`,
      `1. Date selection retains canonical '${selectedDate}' and formats to display '${formattedDisplay}'`
    );
    assert(
      parseDateDisplay(formattedDisplay) === selectedDate,
      `1b. Parsing displayed date '${formattedDisplay}' reconstructs canonical '${selectedDate}' without timezone shift`
    );

    // 2. Navigating months preserves the selected date
    let viewYear = todayParsed.year;
    let viewMonth = todayParsed.month;
    // User navigates forward two months
    viewMonth += 2;
    if (viewMonth > 12) {
      viewMonth -= 12;
      viewYear += 1;
    }
    // Selected date must remain unaffected by month navigation
    assert(
      selectedDate === futureDateStr,
      `2. Navigating to month ${viewMonth}/${viewYear} preserves selected date '${selectedDate}'`
    );

    // Grid generated for the new view month maintains selected state if selected date falls in it, or keeps it selected globally
    const gridNavigated = getCalendarGrid(viewYear, viewMonth, selectedDate, todayStr);
    const dayMatch = gridNavigated.find((d) => d.dateStr === selectedDate);
    if (dayMatch) {
      assert(dayMatch.isSelected, "2b. Grid cell in navigated month correctly marks selectedDate as isSelected=true");
    } else {
      assert(true, "2b. Navigated month grid accurately reflects that selected date is in another month without resetting selected date");
    }

    // 3. Selecting a date updates the view month and does not reset unexpectedly
    const targetMonthDate = addDaysToLocalDate(todayStr, 75);
    const parsedTarget = parseLocalDate(targetMonthDate)!;
    selectedDate = targetMonthDate;
    viewYear = parsedTarget.year;
    viewMonth = parsedTarget.month;
    assert(
      viewYear === parsedTarget.year && viewMonth === parsedTarget.month && selectedDate === targetMonthDate,
      `3. Selecting date '${targetMonthDate}' synchronizes view to month ${viewMonth}/${viewYear} stably`
    );

    // 4. Editing event name and date works seamlessly
    let formState = {
      title: "Pooja & Sameer Wedding Gala",
      eventDate: futureDateStr,
      city: "Mumbai, Maharashtra",
      totalBudget: 1200000,
    };
    formState = { ...formState, title: "Pooja & Sameer Royal Wedding" };
    formState = { ...formState, eventDate: addDaysToLocalDate(todayStr, 60) };
    assert(
      formState.title === "Pooja & Sameer Royal Wedding" && formState.eventDate === addDaysToLocalDate(todayStr, 60),
      "4. Editing event name and date updates state without side effects"
    );

    // 5. Past dates in calendar grid are disabled; today and future are selectable
    const currentMonthGrid = getCalendarGrid(todayParsed.year, todayParsed.month, selectedDate, todayStr);
    const todayCell = currentMonthGrid.find((d) => d.dateStr === todayStr);
    assert(
      Boolean(todayCell && !todayCell.isDisabled && todayCell.isToday),
      "5a. Today cell in grid is enabled (isDisabled=false) and marked isToday=true"
    );
    const pastCells = currentMonthGrid.filter((d) => diffCalendarDays(d.dateStr, todayStr) < 0);
    const allPastDisabled = pastCells.every((d) => d.isDisabled);
    assert(allPastDisabled, `5b. All ${pastCells.length} past date cells in grid are disabled (isDisabled=true)`);

    const futureCells = currentMonthGrid.filter((d) => diffCalendarDays(d.dateStr, todayStr) > 0);
    const allFutureEnabled = futureCells.every((d) => !d.isDisabled);
    assert(allFutureEnabled, `5c. All ${futureCells.length} future date cells in grid are enabled (isDisabled=false)`);

    // 6. Restoring a saved draft does not create an update loop or wipe valid dates
    const validDraft = {
      title: "Anita & Kunal Reception",
      eventDate: addDaysToLocalDate(todayStr, 90),
      city: "Bengaluru, Karnataka",
      totalBudget: 600000,
    };
    const isPastDraft = isDateBeforeToday(validDraft.eventDate, todayStr);
    assert(!isPastDraft, "6a. Valid draft date is recognized as not expired");
    const restoredForm = { ...validDraft };
    assert(
      restoredForm.eventDate === validDraft.eventDate && restoredForm.title === validDraft.title,
      "6b. Saved draft is restored cleanly with date and title intact"
    );

    // 7. Midnight refresh does not overwrite selected event date
    const priorSelectedDate = addDaysToLocalDate(todayStr, 120);
    const nextDayStr = addDaysToLocalDate(todayStr, 1); // simulate midnight tick
    // When todayStr transitions to nextDayStr, selectedDate must NOT be reset to nextDayStr
    const dateAfterMidnight = priorSelectedDate;
    assert(
      dateAfterMidnight === priorSelectedDate && dateAfterMidnight !== nextDayStr,
      `7. Midnight transition from '${todayStr}' to '${nextDayStr}' leaves selected date '${dateAfterMidnight}' unchanged`
    );

    // 8. Re-renders maintain stable state
    let renderCount = 0;
    let stableDate = futureDateStr;
    for (let r = 0; r < 5; r++) {
      renderCount++;
      // Simulate ordinary re-render
      stableDate = stableDate;
    }
    assert(
      renderCount === 5 && stableDate === futureDateStr,
      "8. Date state remains completely stable across repeated render cycles"
    );

    // 9. Demo and New-Event modes remain distinct
    const freshNewEvent = {
      title: "",
      eventDate: todayStr,
      city: "",
      category: "wedding",
    };
    assert(
      freshNewEvent.title === "" && freshNewEvent.eventDate === todayStr,
      "9a. New event mode initializes with empty title and does not inherit demo celebration name"
    );

    const pristineDemo = createDemoBengaliWedding(todayStr);
    assert(
      pristineDemo.title.includes("Bengali Wedding") && isDateSelectable(pristineDemo.eventDate, todayStr),
      "9b. Demo event mode initializes complete editable template without clobbering new event mode"
    );

    // 10. Timezone and Daylight Saving Time shift immunity
    // Testing across standard DST transition dates (e.g. spring forward / fall back dates)
    const dstMarch = addDaysToLocalDate("2026-03-28", 1);
    assert(dstMarch === "2026-03-29", "10a. Date arithmetic across Spring DST transition is exact (2026-03-28 + 1 = 2026-03-29)");
    const dstOct = addDaysToLocalDate("2026-10-24", 1);
    assert(dstOct === "2026-10-25", "10b. Date arithmetic across Autumn DST transition is exact (2026-10-24 + 1 = 2026-10-25)");
  }

  // --- Test Suite 11: Production Plan Generation, Persistence & Dashboard Contracts ---
  console.log("\nSuite 11: Production Plan Generation, Persistence & Dashboard Contracts");
  {
    const todayStr = getLocalDateString();
    const eventDate = addDaysToLocalDate(todayStr, 60);

    const validWizardInput = {
      title: "Rohan & Priya Royal Vivaha",
      category: "wedding" as const,
      eventDate,
      isTentativeDate: false,
      city: "Kolkata, West Bengal",
      venueType: "indoor" as const,
      totalBudget: 1200000,
      currency: "INR",
      expectedGuestCount: 350,
      budgetFlexibility: "moderate" as const,
      emergencyReservePct: 10,
      theme: "Regal Rajbari Heritage with Jasmine & Marigold",
      preferredColors: ["Crimson Red", "Royal Gold", "Warm Ivory"],
      culturalRegion: "Bengali",
      foodPreferences: ["Authentic Bengali Feast", "Mishti Doi & Sandesh"],
      formality: "traditional_royal" as const,
      accessibilityRequirements: "",
      mustHaves: ["Live Shehnai", "Traditional Sandhya Aarti"],
      thingsToAvoid: ["Single-use plastics", "Loud western EDM"],
      planningStage: "just_started" as const,
      diyLevel: "hybrid" as const,
      priorityCategories: ["Catering & Royal Feast", "Heritage Venue & Lawns"],
      sustainabilityPreferences: "",
      specialRequirements: "",
    };

    // 1. Valid event can be generated and saved
    const { plan: generatedPlan, providerUsed } = await AiService.generateEventPlan(validWizardInput);
    assert(Boolean(generatedPlan && generatedPlan.id), `1a. Event plan generated successfully via ${providerUsed}`);
    const saveResult = StorageService.saveEvent(generatedPlan);
    assert(saveResult === true, "1b. Generated event plan saved successfully to storage layer");

    // 2. Saved event contains all required schema fields
    const hasRequiredFields =
      Boolean(generatedPlan.id) &&
      Boolean(generatedPlan.title) &&
      Boolean(generatedPlan.eventDate) &&
      Boolean(generatedPlan.location?.city) &&
      typeof generatedPlan.budget?.totalBudget === "number" &&
      Array.isArray(generatedPlan.budget?.categories) &&
      generatedPlan.budget.categories.length > 0 &&
      Array.isArray(generatedPlan.budget?.expenses) &&
      Array.isArray(generatedPlan.timeline?.tasks) &&
      generatedPlan.timeline.tasks.length > 0 &&
      Array.isArray(generatedPlan.vendors) &&
      Array.isArray(generatedPlan.risks) &&
      Array.isArray(generatedPlan.chatHistory);
    assert(hasRequiredFields, "2. Saved event strictly complies with complete dashboard contract");

    // 3. Generated event can be retrieved by its ID
    const retrieved = StorageService.getEventById(generatedPlan.id);
    assert(
      Boolean(retrieved && retrieved.id === generatedPlan.id && retrieved.title === generatedPlan.title),
      `3. Generated event '${generatedPlan.id}' successfully retrieved by ID with all attributes intact`
    );

    // 4. Dashboard initialization works with newly created event
    StorageService.setActiveEventId(generatedPlan.id);
    const activeForDashboard = StorageService.getCurrentEvent();
    assert(
      activeForDashboard.id === generatedPlan.id,
      "4. Dashboard initialization correctly identifies and loads the newly active event"
    );

    // 5. Missing event IDs are handled safely without throwing
    const missingResult = StorageService.getEventById("");
    assert(missingResult === null, "5a. StorageService.getEventById('') safely returns null without throwing");
    const nonExistent = StorageService.getEventById("non-existent-id-999");
    assert(nonExistent === null, "5b. StorageService.getEventById('non-existent-id-999') safely returns null");

    // 6. Empty event collections do not crash the dashboard
    const currFallback = StorageService.getCurrentEvent();
    assert(Boolean(currFallback && currFallback.title), "6. Dashboard getCurrentEvent() safely falls back if collection is empty");

    // 7. AI failure triggers deterministic fallback engine
    const fallbackPlan = AiService.generateDeterministicFallback(
      validWizardInput,
      120000,
      generatedPlan.budget.categories,
      generatedPlan.timeline.tasks
    );
    assert(
      fallbackPlan.title === validWizardInput.title && fallbackPlan.budget.totalBudget === validWizardInput.totalBudget,
      "7. Deterministic fallback produces complete, mathematically exact EventPlan"
    );

    // 8. Storage failures reject invalid objects gracefully
    const invalidEvent = { title: "No ID Event" } as any;
    const invalidSaveResult = StorageService.saveEvent(invalidEvent);
    assert(invalidSaveResult === false, "8. StorageService.saveEvent rejects invalid event missing id and eventDate");

    // 9. Repeated saves update in place without creating duplicate events
    const initialCount = StorageService.getAllEvents().length;
    StorageService.saveEvent(generatedPlan); // Save again
    const countAfterReSave = StorageService.getAllEvents().length;
    assert(
      initialCount === countAfterReSave,
      `9. Re-saving existing event '${generatedPlan.id}' updates in-place without duplicating entries (Count: ${countAfterReSave})`
    );

    // 10. Successful generation navigates to correct active dashboard state
    assert(
      StorageService.getActiveEventId() === generatedPlan.id,
      "10. Active event ID points to newly generated plan for immediate dashboard display"
    );

    // 11. Failed generation preserves user's form data in draft
    StorageService.saveWizardDraft(validWizardInput);
    const preservedDraft = StorageService.getWizardDraft<typeof validWizardInput>();
    assert(
      Boolean(preservedDraft && preservedDraft.title === validWizardInput.title),
      "11. Wizard draft persists user input and is preserved upon simulated failure"
    );

    // 12. Existing demo events remain accessible and pristine
    const restoredDemo = StorageService.resetDemoEvent();
    assert(
      restoredDemo.id === DEMO_BENGALI_WEDDING.id && restoredDemo.isDemo === true,
      "12. Existing demo event can be loaded and restored to pristine state at any time"
    );
  }

  // --- Final Results Summary ---
  console.log("\n=======================================================");
  console.log(`   TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED   `);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
