# Vow & Vibe AI 💍✨
> **Your Vision. Your Budget. Your Perfect Event.**
> Built for PromptWars Virtual — Challenge 5: Celebration & Event Planner

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange?style=flat&logo=google)](https://ai.google.dev/)
[![Tests Passing](https://img.shields.io/badge/Tests-37%2F37_Passed-emerald?style=flat&logo=checkmarx)](file:///d:/Vow%20&%20Vibe%20AI/src/tests/runTests.ts)

---

## 1. Product Overview

**Vow & Vibe AI** is a production-minded, luxury celebration and event-planning web application. Designed to bridge the gap between emotional celebration concepts and pragmatic financial logistics, it helps hosts organize **weddings, milestone birthdays, anniversaries, community festivals, and college celebrations**.

Unlike generic AI wrappers that hallucinate calculations or render static buttons, Vow & Vibe AI couples **deterministic financial arithmetic and milestone algorithms** with the creative, culturally nuanced intelligence of **Google Gemini**.

---

## 2. Key Features

### 🌸 Luxury Design System & Brand Identity
- **Color Palette**: Warm ivory backgrounds (`#FAF8F5`), royal deep plum (`#3B1242`), champagne gold (`#C5A059`), and soft rose accents (`#D95B72`).
- **Typography**: Google Fonts *Playfair Display* for editorial headings and *Plus Jakarta Sans* for readable, high-contrast interface typography.
- **Micro-Interactions**: Glassmorphic navigation, radial progress indicators, subtle card elevations, and toast notifications.

### 📝 5-Step Event Creation Wizard (`/plan`)
- **Step 1: Event Basics**: Title, category, date (or tentative date toggle), city, venue setting (indoor/outdoor/undecided).
- **Step 2: Budget & Attendance**: Interactive INR budget slider, guest headcount, flexibility rating, and configurable emergency reserve (5–20%).
- **Step 3: Atmosphere & Culture**: Custom theme, palette tags, regional traditions (Bengali, South Indian, Punjabi, Pan-Indian, Modern Minimalist), dietary tags, and formality levels.
- **Step 4: Planning Style**: Current planning stage, DIY vs. Pro level, sustainability notes, and family customs.
- **Step 5: Review & Synthesis**: Summary review card, jump-back edit shortcuts, and animated plan generation.
- **Auto-Save Drafts**: Drafts persist in `localStorage` across page refreshes.

### 📊 Deterministic Smart Budget Engine
- **Zero-Rounding-Leak Reconciliations**: Guaranteed exact 100% budget allocation without off-by-one errors.
- **Contingency Buffer Protection**: Automatically earmarks a protected emergency reserve.
- **Spending Trackers**: Tracks **Estimated**, **Committed**, and **Actual Paid** amounts per line item.
- **Over-Budget Guard**: Instant alerts when projected expenses exceed the total budget ceiling.
- **Visual Analytics**: Interactive Recharts Donut allocation charts and Allocated vs. Estimated Bar Charts.
- **Cost-Reduction Levers**: Actionable suggestions tailored to event categories (e.g. live street counters vs heavy appetizers, hybrid silk-fresh florals).

### 🧪 "What If?" Simulation Lab
- Interactive sliders for **Guest Count** and **Budget Ceiling**.
- Category tier toggles: **Venue** (Lawn to Heritage Palace), **Catering** (Economy to Bespoke Live Stalls), **Decor** (Minimalist to Grand Thematic).
- Real-time recalculation of total projected cost, cost variance (+/- ₹), per-guest rates, and line-item shifts.
- One-click **"Apply to Event Plan"** action.

### 📅 Preparation Timeline & Milestone Tasks
- Chronological task sequencing anchored to the target event date.
- Status tracking (`todo`, `in_progress`, `completed`), priority badges (`low`, `medium`, `high`, `critical`), and overdue warnings.
- Real-time completion rate % calculation.
- Modal editor for adding, editing, and deleting custom tasks.

### 🤝 Vendor Intelligence & Comparison Matrix
- Categorized vendor directory (Venues, Caterers, Decorators, Photographers, Entertainment, Transport).
- **Budget Fit Indicators**: Labels vendors as *Within Budget*, *Balanced*, or *Exceeds Target*.
- **Side-by-Side Comparison**: Compare up to 3 vendors simultaneously across pricing, rating, deliverables, pros, and cons.
- Vendor requirement checklists & negotiation strategies.
- Clear distinction between illustrative sample vendors and confirmed bookings.

### 🤖 Contextual AI Planning Assistant
- Dashboard chat interface grounded in the active event's budget, guest headcount, location, expenses, tasks, and cultural traditions.
- One-click prompt suggestions (e.g., *"How can I save ₹30,000 without compromising catering?"*).
- **Safety Protocol**: When proposing plan modifications, shows a preview card requiring explicit user confirmation before applying changes.

### 🛡️ Risk & Contingency Guard
- Pre-populated risk scenarios (monsoon rain on outdoor lawns, guest headcount surges, traffic delays, electrical surges).
- Formulates preventive protocols, backup emergency actions, and contingency budget tallies.
- Add and manage custom event risk scenarios.

### 📤 Export & Sharing
- **CSV Spreadsheets**: Download Budget Breakdown, Task Checklist, and Vendor Comparison CSVs.
- **Printable Dossier**: Printer-optimized PDF view (`window.print()`) with clean typography.
- **Copy Summary**: Formatted markdown text copied directly to the clipboard.

---

## 3. Demo Showcase for Hackathon Judges

To facilitate immediate testing without requiring account setup or API keys:

1. Click **"Inspect Bengali Wedding Demo"** on the landing page or **"Judge Demo"** in the navigation header.
2. Inspect the pre-loaded showcase event:
   - **Event**: A Bengali Wedding Celebration: Sourav & Debolina
   - **Location**: Kolkata, West Bengal
   - **Budget**: ₹8,00,000 (with ₹80,000 emergency reserve)
   - **Expected Guests**: 300
   - **Cultural Nuances**: Gaye Holud, Shubho Drishti, Saat Paake Ghaura, authentic cuisine (Bhetki Paturi, Mutton Kosha, Mishti Doi).
3. Try these interactive workflows:
   - **Budget**: Click *Add Expense*, add an item, and watch the totals recalculate.
   - **What-If Lab**: Slide guests from 300 to 350 and observe the catering surge.
   - **Tasks**: Check off a task and see the completion ring increase.
   - **Vendors**: Click *Compare* on two vendors and inspect the side-by-side comparison modal.
   - **AI Chat**: Ask *"How can I save ₹30,000?"* and click *Apply to Plan*.
   - **Reset**: Click **"Reset Demo Event"** in the header dropdown or Export tab to restore the demo to its original state.

---

## 4. Architecture & Technical Stack

```
d:\Vow & Vibe AI\
├── src/
│   ├── app/
│   │   ├── api/ai/
│   │   │   ├── plan/route.ts       # AI Event Plan synthesis endpoint
│   │   │   ├── chat/route.ts       # Contextual assistant chat endpoint
│   │   │   └── whatif/route.ts     # What-If scenario simulation endpoint
│   │   ├── dashboard/page.tsx      # Comprehensive Event Dashboard (8 tabs)
│   │   ├── plan/page.tsx           # 5-Step Event Creation Wizard
│   │   ├── globals.css             # Luxury design tokens & print styles
│   │   ├── layout.tsx              # Root layout with Playfair & Plus Jakarta Sans
│   │   └── page.tsx                # High-converting Landing Page
│   ├── components/
│   │   ├── dashboard/              # Modular tab views (Overview, Budget, Tasks, Vendors, etc.)
│   │   ├── ui/                     # Reusable UI system (Button, Card, Modal, Badge, Toast, etc.)
│   │   ├── navbar.tsx              # Header with brand identity & event switcher
│   │   └── footer.tsx              # Challenge 5 specifications footer
│   ├── data/
│   │   └── demoEvent.ts            # Kolkata Bengali Wedding showcase data
│   ├── lib/
│   │   └── utils.ts                # INR Indian number formatting (Lakhs/Crores) & cn()
│   ├── services/
│   │   ├── aiService.ts            # Gemini SDK + Zod schema validation + Fallback Engine
│   │   ├── budgetEngine.ts         # Deterministic allocation, reconciliation & what-if math
│   │   ├── timelineEngine.ts       # Dynamic due date offsets & progress metrics
│   │   ├── vendorEngine.ts         # Negotiation tips & budget compatibility scoring
│   │   └── storageService.ts       # LocalStorage persistence & demo reset
│   ├── tests/
│   │   └── runTests.ts             # 37-point automated test suite
│   └── types/
│       └── event.ts                # TypeScript interfaces and Zod schemas
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Components**: Bespoke UI library inspired by shadcn/ui.
- **Icons & Visuals**: Lucide React icons, Recharts for budget data visualization.
- **Validation**: Zod schema validation on client and server.
- **AI Intelligence**: `@google/genai` with fallback to deterministic local rules engine.
- **Storage**: Client-side `localStorage` with multi-event management, ready for Supabase PostgreSQL integration.

---

## 5. Prerequisites & Local Installation

### Prerequisites
- **Node.js**: v18.17+ or v20+ / v24+
- **npm**: v9+ or v11+

### Installation Steps

1. Clone or open the repository:
   ```bash
   cd "d:\Vow & Vibe AI"
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure Environment Variables (Optional):
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key if available:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: The application works with 100% functionality even without an API key using the built-in Local Intelligence Fallback Engine!)*

---

## 6. Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Launch
```bash
npm run build
npm run start
```

---

## 7. Running the Automated Test Suite

A comprehensive 37-point automated test suite is included, verifying:
- Budget exact reconciliation (no rounding leaks across various sums)
- Emergency contingency reserve calculations
- Over-budget warning triggers
- What-If simulator math and guest scaling
- Timeline milestone sequencing (ensuring no pre-event tasks fall after the event)
- Zod schema validation
- AI fallback engine resilience
- Indian currency formatting (`₹8,00,000`, `₹8.00 L`, `₹1.50 Cr`)

Run tests via:
```bash
npm test
```

Expected output:
```
=======================================================
   TEST RESULTS: 37 PASSED, 0 FAILED   
=======================================================
```

---

## 8. Deployment to Vercel

The application is structured for instant zero-configuration deployment on Vercel:

1. Push the code to a GitHub repository.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select the repository.
3. In **Environment Variables**, optionally add:
   - `GEMINI_API_KEY`: Your Gemini API key.
4. Click **Deploy**. Vercel will run `npm run build` and launch the application globally on edge network infrastructure.

---

## 9. Security & Reliability
- **Zero Secret Leaks**: The `GEMINI_API_KEY` is read strictly on the server-side (`src/services/aiService.ts` and Next.js Route Handlers). It is never sent to the browser bundle.
- **Input Sanitization**: User inputs are parsed and validated through Zod before passing to AI prompts.
- **Deterministic Separation**: Financial calculations, totals, percentages, and milestone dates are executed in deterministic TypeScript functions, completely eliminating LLM arithmetic errors.
- **Transparent Labelling**: Sample vendors and fallback generated plans are clearly badged.

---

## 10. Future Roadmap
- [ ] Supabase PostgreSQL synchronization for real-time collaborative planning across families.
- [ ] WhatsApp Cloud API integration for RSVP tracking.
- [ ] Vendor portal for direct quotation uploads.
- [ ] Digital seating arrangement builder.

---

*Vow & Vibe AI — Crafted with elegance and precision for PromptWars Virtual Challenge 5.*
