# ChemLearn AI — Production Hardening Audit (Phase 0)

**Date:** 2026-09-05  
**Current HEAD Commit:** `d04e5e4df05a97cc87139905bb34fcda8c411eec`  
**Target Quality Level:** Verified 9.8+/10 Production Grade  

---

## 1. Architectural Overview & Component Inspection

### 1.1 Source Code Hierarchy (`chemlearn-next/src`)
- **App Router Structure:**
  - 31 statically compiled/dynamic pages and routes.
  - Core student routes: `/lessons`, `/lessons/[chapterId]`, `/lessons/[chapterId]/[topicId]`, `/quizzes`, `/experiments`, `/experiments/chapter-8`, `/duel/[matchId]`, `/dashboard`, `/resources`, `/teacher`.
  - API Endpoints (18 total):
    - AI Gateway consumers (10): `/api/ai/chat`, `/api/ai/quiz`, `/api/ai/challenge`, `/api/ai/duel`, `/api/ai/flashcards`, `/api/ai/grade`, `/api/ai/insights`, `/api/ai/mark`, `/api/ai/notes`, `/api/ai/worksheet`.
    - Authoritative Gamification & Quiz submission (4): `/api/lessons/complete`, `/api/quizzes/submit`, `/api/challenges/submit`, `/api/gamification/sync`.
    - Real-time Multiplayer Duels (2): `/api/duel/answer`, `/api/duel/finish`.
    - Classroom management (2): `/api/classes/create`, `/api/classes/join`.
- **Server Libraries (`src/lib/server/`):**
  - `ai-gateway.ts`: Central entry point for all AI calls. Enforces daily quotas, sliding-window idempotency cache, boundary delimiter neutralization, task configs, and Zod output validation.
  - `gemini.ts`: Sole Google Generative AI (`@google/generative-ai`) wrapper. Configured with `gemini-3.8-flash`, `gemini-3.5-flash-lite`, and `gemini-2.5-flash` with retry backoff and 404 model switching.
  - `quizzes.ts`: Deterministic 6-layer chemistry grading engine with unit normalizations, permutation equations, scientific notation ($\le 2\%$ tolerance), strict chemical formula matching, and structured rubric sub-marks (`M1`, `M2`).
  - `curriculum-validator.ts`: Authoritative Malaysian Form 4 KSSM syllabus hierarchy for Chapter 6 (Acid, Base and Salt, 11 topics) and Chapter 8 (Manufactured Substances in Industry, 4 topics).
  - `duels.ts`: Server-authoritative match resolution, scoring, 15-minute expiration checks, and idempotent winner reward disbursement.
  - `gamification.ts`: Server-authoritative XP management with bounds checking ($1 \le \text{XP} \le 200$), level thresholds, and deduplicated event logging.
  - `auth.ts`: Firebase Admin token verification with role extraction (`student`, `teacher`, `admin`).

### 1.2 Three.js / React Three Fiber Inspection
- `src/components/experiments/VirtualLab.tsx`: Correctly implements dynamic client-only loading with `ssr: false` (`const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false })`), complying with `GEMINI.md` directives against blind SSR execution.
- `src/components/3d/ChemistryScene.tsx` & `VRUI.tsx`: OrbitControls and environment maps properly dispose of geometries and textures.

### 1.3 PWA & Security Headers
- `next.config.ts`: Configured with `@ducanh2912/next-pwa`, output tracing root, and strict HTTP response headers:
  - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
  - `X-Frame-Options`: `DENY`
  - `X-Content-Type-Options`: `nosniff`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Permissions-Policy`: restrictive device feature disablement
  - `Content-Security-Policy`: script-src and connect-src strictly locked to Google/Firebase domains.

---

## 2. Vulnerability & Weakness Search Matrix

| Inspection Item | Audit Result | Evidence / Details | Action Required in Plan |
|---|---|---|---|
| **Direct Gemini SDK calls** | Clean | Only instantiated in `gemini.ts:4` (`GoogleGenerativeAI`). All calls route through `ai-gateway.ts`. | Centralize model capabilities configuration (Phase 1). |
| **Client-side privileged operations** | Clean | No client XP or duel score writes. All client submissions route to authoritative `/api/` endpoints. | Maintain strict server boundaries. |
| **Exposed API keys / Secrets** | Clean | 0 hardcoded Google/Firebase keys found. Git history clean; `.env*` correctly gitignored. | Keep zero-exposure stance. |
| **Unsafe Firestore writes** | Verified | `firestore.rules` enforces immutable server collections (`server_quizzes`, `server_duels`, `xp_events`, `ai_usage`) and strips privileged fields on client update. | Add `idempotency_records` to server-only list (Phase 3, Phase 6). |
| **Duplicated quota logic** | Clean | Centralized exclusively in `ai-gateway.ts` (`TASK_QUOTAS`). | Add distributed concurrency testing (Phase 4). |
| **Duplicated AI calls** | Found Gap | In-memory `Map` used for idempotency (`ai-gateway.ts:128`). In multi-instance or serverless cold starts, duplicate requests can bypass cache. | Build distributed Firestore-based atomic idempotency store (Phase 3). |
| **`@ts-ignore` / `@ts-expect-error`** | Clean | **0 occurrences** across all files in `chemlearn-next/`. | None. |
| **Unsafe casts (`as any`)** | Clean in `src/` | **0 occurrences** in `src/`. Only isolated occurrences in test files for negative test harnesses. | Maintain type safety (Phase 19). |
| **Unbounded Firestore queries** | Clean | Every query in `src/lib/server/` uses `.doc(id)`. Join query in `classes/join` has `.limit(1)`. | Add Firestore emulator tests (Phase 6). |
| **Excessive listeners** | Clean | Client duel listener in `duel.ts` uses `onSnapshot` with error handler and returns unsubscribe function. | Ensure clean teardown. |
| **TODO/FIXME items** | Found Gap | `src/lib/rate-limit.ts:10`: `TODO(production-readiness): Replace this in-memory sliding window limiter with a distributed store`. | Address rate-limit resilience. |
| **GitHub Actions Pipeline** | Found Gap | `.github/workflows/ci.yml` runs build and Jest, but lacks Playwright E2E and uses `npx tsc --noEmit` without memory flag. | Upgrade CI pipeline to run complete test suite including Playwright (Phase 8, Phase 23). |

---

## 3. Detailed Gap Analysis & Hardening Road Map

### Gap 1: Model Capabilities Architecture (Phase 1)
- Currently `GEMINI_MODELS` lists model names, but different models support different parameters (e.g. some models do not support `topK` or have different token context windows).
- **Target:** Formalize `MODEL_CAPABILITIES` object defining supported parameters per model (`supportsTemperature`, `supportsTopP`, `supportsTopK`, `supportsJson`, `supportsVision`), with runtime validation so parameters are conditionally passed.

### Gap 2: Real Gemini Integration Test (Phase 2)
- Need a dedicated test file `tests/integration/gemini.integration.test.ts` that runs against a live API key if `process.env.GEMINI_API_KEY` is present, but cleanly marks skipped/mocked if absent, testing text generation, JSON generation, timeout handling, and fallback behavior without exposing secrets.

### Gap 3: Distributed Idempotency (Phase 3)
- Replace/supplement the in-memory Map in `ai-gateway.ts` with a Firestore-backed atomic distributed idempotency collection (`idempotency_records`).
- Implement atomic claim semantics: when request arrives, attempt transaction or set with timestamp. If in-flight, return lock status; if completed, return cached response. If expired (> 45s), allow re-claim. Ensure UID isolation so no cross-user data leakage can ever occur.

### Gap 4: Quota Concurrency Stress (Phase 4)
- Write an automated concurrent stress test simulating 10, 50, 100, 200 simultaneous requests from a single UID to prove that transaction-based quota counter cannot overshoot or allow negative/unauthorized usage.

### Gap 5: Chemistry Grading M1/M2 Criteria & Real-Time Telemetry (Phase 5, 11, 12)
- Validate 104-case adversarial benchmark and expand test cases for edge conditions (Malay/English terms, significant figures, ionic notation).
- Ensure structured server telemetry tracks latency, tokens, and errors with zero student credential exposure.

### Gap 6: GitHub Actions Playwright Integration (Phase 8, Phase 23)
- Update `.github/workflows/ci.yml` to install Playwright browser dependencies and run Playwright desktop and mobile tests on the production build output.
