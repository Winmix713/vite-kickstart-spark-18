# WinMix TipsterHub – Integrated Intelligence Platform (Phases 3–9)

WinMix TipsterHub is an end-to-end football analytics and prediction platform that now consolidates every capability delivered across phases 3 through 9 into a single cohesive system. The application blends automated data ingestion, model evaluation, cross-league intelligence, monitoring, and self-improving market collaboration features on top of a modern React + Supabase stack.

---

## 🏗️ Platform Architecture

| Layer | Technologies | Responsibilities |
| --- | --- | --- |
| **Frontend** | React (Vite), TypeScript, Tailwind, shadcn-ui, TanStack Query, React Router | SPA experience with feature-specific dashboards (jobs, analytics, models, cross-league, monitoring, phase 9). Manages routing, state, visualizations, real-time feedback, and user interactions. |
| **Integrations** | Supabase SDK, Supabase Edge Functions | Secure data operations (auth, tables) and custom Edge Functions for jobs, analytics, and phase 9 services. Edge Functions expose REST-like endpoints that the client consumes via the `supabase.functions.invoke` calls. |
| **Domain Logic** | `/src/integrations`, `/src/lib`, `/src/types` | Encapsulates domain-specific contracts (job definitions, model metrics, monitoring KPIs, phase 9 intelligence) and shared utilities that standardize payloads across features. |
| **Analytics & Automation** | Supabase tables, background jobs | Phase 3 cron scheduling, Phase 4 feedback loop aggregation, Champion/Challenger orchestration, temporal decay, and collaborative market learning pipelines. |

Key data flow:
1. **Scheduled Jobs (Phase 3)** wake via Supabase Edge Functions and emit job state/log updates that the frontend consumes via TanStack Query.
2. **Feedback Loop (Phase 4)** pushes prediction outcomes back into Supabase tables, feeding analytics, model comparisons, and dashboards.
3. **Champion / Challenger Framework (Phase 6)** monitors model families, triggering promotions, demotions, and retraining requests.
4. **Cross-League Intelligence (Phase 7)** unifies league feeds to produce correlation heatmaps, radar differentials, and strategic insights.
5. **Monitoring & Visualization (Phase 8)** exposes system health, data freshness, compute loads, and anomaly detection dashboards.
6. **Collaborative Market Intelligence (Phase 9)** layers temporal decay weighting, self-improvement loops, and market blending to enhance predictive precision.

---

## 🚀 Feature Overview by Phase

### Phase 3 – Scheduled Jobs & Automation
- Jobs list, status controls, manual triggers, log viewers (`/jobs`).
- Supabase Edge Functions: `jobs-list`, `jobs-logs`, `jobs-toggle`, `jobs-trigger`.
- UI components: `JobStatusCard`, `JobLogsDialog`, adaptive skeleton loaders.

### Phase 4 – Feedback Loop & Model Evaluation
- Analytics workspace (`/analytics`) with model performance charts, feedback forms, and post-match evaluation flows.
- Integrations for performance snapshots, calibration metrics, automated retraining flags.
- Supabase-driven feedback loop that closes the model refinement process.

### Phase 6 – Champion / Challenger Framework
- Model management hub (`/models`) for champion/challenger insights, promotions, audit history, and feature experiments.
- Domain types under `src/types/models.ts` and service helpers in `src/integrations/models/service.ts`.

### Phase 7 – Cross-League Intelligence
- Cross-league dashboard (`/crossleague`) with correlation heatmaps, league comparison radar charts, and meta-pattern surfacing.
- Smart refetching, league filters, and storyline highlights for analysts.

### Phase 8 – Monitoring & Visualization
- Real-time monitoring center (`/monitoring`) showing compute loads, system health cards, anomaly watchlists, and SLA tracking.
- Visual components under `src/components/monitoring`.

### Phase 9 – Advanced Collaborative Market Intelligence
- Holistic intelligence suite (`/phase9`) combining collaborative analysis, market integration, temporal decay, and self-improving loops.
- Modular components in `src/components/phase9` and API layer in `src/lib/phase9-api.ts`.
- Automated tests in `src/test/phase9.test.ts` covering core behaviors.

---

## 🧭 Navigation & Key Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing experience with quick access to prediction workflows. |
| `/predictions/new` | 8-match wizard for generating fresh predictions. |
| `/predictions` | Review existing predictions, confidence scores, and feedback actions. |
| `/dashboard` | Executive summary of KPIs, win rates, and operational status. |
| `/analytics` | Phase 4 analytics & feedback loop cockpit. |
| `/jobs` | Phase 3 scheduler control plane. |
| `/models` | Phase 6 model governance. |
| `/crossleague` | Phase 7 intelligence dashboard. |
| `/monitoring` | Phase 8 observability portal. |
| `/phase9` | Phase 9 collaborative market intelligence hub. |
| `/teams`, `/matches`, `/leagues` | Core domain exploration views. |

The sidebar (`src/components/Sidebar.tsx`) provides quick access to all major workspaces and reflects the expanded navigation after integration.

---

## 📂 Project Structure Highlights

```
src/
  components/         # Feature-specific component suites (jobs, models, monitoring, phase9, etc.)
  integrations/       # Supabase clients, model services, and domain adapters
  lib/                # Shared utilities (phase 9 API client, helpers)
  pages/              # Route-level pages mapped in App.tsx
  types/              # TypeScript domains for jobs, models, monitoring, phase9
  hooks/              # Shared hooks (e.g., useRealtimeSubscription)
supabase/functions/   # Edge Functions powering jobs and analytics orchestration
```

Supplementary documentation:
- `WinMix_TipsterHub_Phase_3-9_Components_EN.md` – deep dive into components per phase.
- `PHASE9_IMPLEMENTATION.md` – architectural notes on the advanced collaborative intelligence layer.

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or bun
- Supabase project (or Supabase CLI) configured with the matching schema & Edge Functions.

### Setup
```bash
npm install
npm run dev
```
- Create a `.env` using the provided example values for Supabase keys.
- Start the Vite dev server at `http://localhost:5173`.
- Ensure Supabase Edge Functions (`supabase/functions/*`) are deployed or running via `supabase functions serve` when testing job and analytics features locally.

### Testing
Run targeted tests (e.g., Phase 9 suite):
```bash
npm test -- Phase9
```
(Full CI will execute linting, type-checks, and all feature tests.)

---

## 📣 Integration Notes
- All feature branches (Phases 3 → 9) have been merged sequentially into `integration/merge-phases-3-4-6-7-8-9` with navigation, routes, and domain types normalized to avoid duplication.
- Shared UI elements (e.g., `Sidebar`, `App.tsx`) have consolidated imports and route registrations to surface every phase feature consistently.
- Documentation now reflects the unified system so reviewers and stakeholders can evaluate the entire product surface area from a single reference.

---

## 🤝 Contributing
1. Create feature branches off the integration branch (`integration/merge-phases-3-4-6-7-8-9`).
2. Follow the established folder conventions (`components/<feature>`, `pages/<Feature>.tsx`).
3. Use TanStack Query for data synchronization and Supabase Edge Functions for server-side orchestration.
4. Update documentation when introducing new domain concepts or workflows.

By keeping these guidelines in mind, the integrated TipsterHub platform remains maintainable, observable, and ready for further enhancements.
