# ChemLearn AI — Baseline Audit Report (Phase 0)

**Timestamp:** 2026-09-05T22:04:00+08:00  
**Repository:** `raid067/Chemlearn-AI`  
**Current Git Commit:** `156805a` (`feat(arch): complete gemini centralization, 6-layer grading engine, duel security & playwright e2e`)  
**Branch:** `main` (Clean working tree)

---

## 1. Baseline Verification Results

| Verification Dimension | Command Executed | Exit Code | Result Summary |
|---|---|:---:|---|
| **Jest Unit & Integration Tests** | `npm test` | `0` | **18/18 suites passed (125/125 tests passed)** in 28.3s |
| **TypeScript Validation** | `npx tsc --noEmit` | `0` | **0 errors** across all application code |
| **ESLint Static Analysis** | `npm run lint` | `0` | **0 errors, 0 warnings** |
| **Next.js Production Build** | `npm run build` | `0` | **31/31 routes compiled & optimized** (33.5s compile, 31.3s TS, 2.2s SSG) |
| **Playwright Desktop E2E** | `npx playwright test --project=chromium-desktop` | `0` | **7/7 tests passed** |
| **Playwright Mobile E2E** | `npx playwright test --project=mobile-chrome` | `0` | **7/7 tests passed** |
| **Security Vulnerability Audit** | `npm audit --audit-level=high` | `0` | **0 high or critical vulnerabilities** (8 moderate in transitive deps) |
| **Firestore Rules Unit Tests** | `npm test -- firestore-rules.test.ts` | `0` | **15/15 tests passed** |

---

## 2. Current Gemini & AI Architecture

- **AI Provider:** Google Gemini API (`@google/generative-ai` version `^0.24.1`).
- **Legacy Backend Status:** Cleanly eliminated (no Express server, no `gpt-4o-mini`, no unencrypted `.env`).
- **Gateway Centralization:** `src/lib/server/ai-gateway.ts` intercepts all AI generation routes with `AI_CONFIG`.
- **Current Model Mapping in `AI_CONFIG`:**
  - `tutor`: `gemini-1.5-flash`
  - `tutorVision`: `gemini-1.5-pro`
  - `grading`: `gemini-1.5-flash`
  - `questionGeneration`: `gemini-1.5-flash`
  - `flashcards`: `gemini-1.5-flash`
  - `duelGeneration`: `gemini-1.5-flash`
  - `notes`: `gemini-1.5-flash`
  - `insights`: `gemini-1.5-flash`
  - `worksheet`: `gemini-1.5-flash`
- **Fail-Safe Mechanism:** `assertGeminiConfigured()` returns HTTP 503 (`GEMINI_NOT_CONFIGURED`) when API keys are absent in production.

---

## 3. Known Warnings & Architectural Observations

1. **Next.js Lockfile Root Warning:**
   - Warning: `Next.js inferred your workspace root, but it may not be correct... selected C:\Users\HP\package-lock.json`.
   - Resolution: Configure `outputFileTracingRoot` in `next.config.ts` or `next.config.mjs` pointing to the project root.
2. **Gemini Model Lineup Upgrade Opportunity:**
   - Current configuration uses legacy `gemini-1.5-flash` and `gemini-1.5-pro`.
   - Google's modern lineup (e.g. `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.5-pro`, or latest supported production models) provides lower latency, higher accuracy on scientific rubrics, and enhanced multimodal comprehension.
3. **Resilience & Exponential Backoff:**
   - AI Gateway does not currently have automated retry with exponential backoff on transient errors (`503 UNAVAILABLE`, `429 RESOURCE_EXHAUSTED`).
   - Need client/server retry guards that distinguish transient errors from permanent validation errors (400, schema mismatch).
4. **Idempotency Keys:**
   - Duplicate submissions on expensive AI operations (AI grading, quiz generation, duel generation) lack an idempotency cache/key guard.
5. **Tiered AI Quotas:**
   - The current daily quota in `ai-gateway.ts` uses a flat 50 requests/day per user. Quotas should be task-aware (e.g. higher quota for flashcards/insights, controlled quota for full quiz generation and vision).
6. **Mark-Scheme Criteria Engine (M1, M2):**
   - The current grading engine evaluates overall concepts and keywords, but needs explicit multi-criteria breakdown (`criteria: [{ id: 'M1', concept, marks }]`) preventing double-counting.
7. **Adversarial Chemistry Dataset:**
   - Need a 100-sample benchmark dataset covering spelling variants, scientific notation, unit variations, equation permutations, misconceptions, and prompt injections to measure and ensure $\ge 95\%$ deterministic accuracy.

---

## 4. Target Goals for 9.8+/10 Milestone

- **Phase 1-4:** Modernize Gemini models, verify SDK parameter compatibility, implement exponential retry backoff and circuit resilience.
- **Phase 5-7:** Idempotency guards, task-aware tiered quotas, cost controls (deterministic-first).
- **Phase 8-9:** Adversarial prompt injection defenses, strict output validation with schema enforcement.
- **Phase 10-12:** Advanced multi-criteria mark-scheme engine with a 100-item adversarial chemistry dataset benchmark.
- **Phase 13-17:** KSSM curriculum validator, generated question validators, duel concurrency and gamification tamper tests.
- **Phase 18-24:** Extended Playwright coverage, mobile performance checks, Three.js cleanup, a11y audit, PWA offline checks.
- **Phase 25-36:** Security headers, secret scanning, structured logging, database query audit, type safety cleanup.
- **Phase 37-40:** Execution of all tests, attack simulations, and final comprehensive 9.8+/10 audit scorecard.
