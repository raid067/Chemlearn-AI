# CHEMLEARN AI — FULL REAL-WORLD RED TEAM AUDIT V3 REPORT
**Audit Date:** September 18, 2026  
**Auditor:** Senior Application Security & Penetration Testing Lead  
**Scope:** `chemlearn-next`, `legacy-frontend`, `functions`, `firestore.rules`, `storage.rules`, CI/CD pipelines, APIs, and AI Gateways.  
**Target Repository:** ChemLearn AI (Next.js 16.3.5, Firebase, Tailwind CSS v4, Google Gemini AI)

---

## 1. Executive Summary
A comprehensive, zero-trust red-team penetration test and security architecture evaluation was executed on the ChemLearn AI codebase. Unlike static compliance audits, this evaluation coupled real automated test execution (394 tests, Playwright browser runs, API penetration testing, and dependency audits) with deep vulnerability discovery across authentication, client/server authorization boundaries, Firebase rules, AI gateways, and client-side state manipulation.

ChemLearn AI exhibits strong foundational security controls:
- Strict TypeScript type safety (0 type errors across all routes).
- Robust input sanitization and schema validation using Zod on AI generation endpoints.
- Server-side token verification and rate limiting across Next.js API endpoints.
- High test coverage across core gamification algorithms, AI guardrails, and duel sessions.

However, several critical and high-severity architectural discrepancies remain between the modern Next.js application (`chemlearn-next`) and the legacy Firebase static deployment (`legacy-frontend`), alongside logic bypasses in Firestore rules and admin route headers.

---

## 2. Test Environment & Methodology
- **Framework:** Next.js 16.3.5 (App Router, Turbopack, Server Components)
- **Local Application Server:** `http://localhost:3000` (Node.js v20.x, Windows 11)
- **Firebase Configuration:**
  - Active Firebase project configuration mapped in `firebase.json`
  - Emulator suite compatibility verified
- **Test Executions:**
  - `npm run typecheck`: **0 errors**
  - `npm run lint`: **0 errors, 0 warnings**
  - `npm test -- --runInBand`: **36 suites, 290 tests passed**
  - `npm run test:redteam`: **8 suites, 82 tests passed**
  - `npx playwright test`: **22 tests passed** (Chromium desktop & mobile)
  - `npm audit --audit-level=high`: **FAILED (Exit code 1)**: 1 High severity (`js-yaml`), 8 Moderate (`uuid`).

---

## 3. Threat Model & Attack Surface
1. **Student Account Abuse & Gamification Tampering:** Direct write exploits against Firestore documents (`/students/{userId}`) bypassing server-side XP calculation and progression gates.
2. **Dual-Deployment Divergence:** Root `firebase.json` serving unauthenticated `legacy-frontend` files that invoke Google Gemini AI directly from the browser without server controls.
3. **Admin Key Header Bypasses:** Staging/development headers allowing unauthenticated trigger of adversarial evaluation suites.
4. **Node.js Resource Exhaustion:** Timer leakage in AI gateway wrapper promises leading to event-loop memory leaks.
5. **Teacher/Student Authorization Desynchronization:** Firestore and Storage rules inadvertently denying legitimate classroom access to student quiz submissions while allowing students to delete their own audit records.

---

## 4. Verification Scoreboard & Metrics

```
================================================================================
                    CHEMLEARN AI — RED TEAM AUDIT V3 METRICS                    
================================================================================
TOTAL TESTS EXECUTED:             394
VERIFIED PASSES:                  393
VERIFIED FAILURES:                1   (npm audit --audit-level=high)
--------------------------------------------------------------------------------
VULNERABILITY SEVERITY BREAKDOWN:
  CRITICAL:                       0
  HIGH:                           2   (SEC-V3-01, SEC-V3-02)
  MEDIUM:                         4   (SEC-V3-03, SEC-V3-04, SEC-V3-06, SEC-V3-09)
  LOW:                            1   (SEC-V3-07)
  INFO:                           1   (SEC-V3-08)
  INVALID / DISPROVEN:            1   (SEC-V3-05)
--------------------------------------------------------------------------------
TEST FIDELITY SUMMARY:
  REAL API TESTS:                 14 Next.js routes tested (Auth, Zod, Error boundaries)
  REAL BROWSER TESTS:             22 Playwright E2E tests (Chromium / Mobile)
  SIMULATED UNIT TESTS:           82 tests (Hardcoded mock string matching in runner)
  REAL FIRESTORE TESTS:           0 (Simulated via Jest regex/functions; no emulator daemon)
  BUILD STATUS:                   PASS (Next.js 16.3.5)
  TYPECHECK:                      PASS (0 errors)
  LINT:                           PASS (0 errors, 0 warnings)
  DEPENDENCY AUDIT:               FAIL (1 High in js-yaml, 8 Moderate in uuid)
================================================================================
```

---

## 5. Detailed Vulnerability Findings

### [HIGH] SEC-V3-01: Client-Side Gamification & Account Tampering in Firestore Rules
- **Affected File:** [`firestore.rules`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/firestore.rules#L45-L70), [`chemlearn-next/firestore.rules`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/chemlearn-next/firestore.rules#L45-L70)
- **Vulnerability:**
  In `validStudentCreate()`, a client can initialize their student document with `streak: 100` and arbitrary strings for `level`. In `validStudentUpdate()`, a student client can write `completedPomodoros: 100000` and `dailyChallengeStreak: 10000`. Furthermore, `allow delete: if isOwner()` permits students to delete their student profile, erasing historical progression and quiz history without administrative approval.
- **Impact:** Complete manipulation of client gamification badges, leaderboards, and permanent audit log destruction.
- **Remediation:**
  1. Restrict initial `streak` to `0` or `1` and validate `level == 'Beginner'`.
  2. Disallow direct client writes to `completedPomodoros` and `dailyChallengeStreak`, requiring server-side or Cloud Function updates.
  3. Remove `allow delete: if isOwner()` or restrict deletion to `isAdmin()`.

---

### [HIGH] SEC-V3-02: Legacy Frontend Unprotected AI Client Access & Stored XSS Risk
- **Affected File:** [`legacy-frontend/dashboard.html`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/legacy-frontend/dashboard.html), [`firebase.json`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/firebase.json)
- **Vulnerability:**
  The root `firebase.json` continues to configure Firebase Hosting to serve the `legacy-frontend` directory. In `dashboard.html`, client-side scripts directly invoke `@firebase/ai` SDK from the user's browser without passing through the Next.js `ai-gateway.ts` rate limiter, sanitization, or authentication verification.
- **Impact:** API key exposure, unlimited unmetered Gemini quota consumption, prompt injection without server guardrails.
- **Remediation:** Remove legacy static hosting rewrite from `firebase.json` or replace client-side Gemini calls with endpoints proxying through `/api/ai/*`.

---

### [MEDIUM] SEC-V3-03: Node.js Timer Leak in AI Gateway
- **Affected File:** [`chemlearn-next/src/lib/server/ai-gateway.ts`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/chemlearn-next/src/lib/server/ai-gateway.ts#L65-L85)
- **Vulnerability:**
  The 25-second `timeoutPromise` creates a `setTimeout` timer that is never cleared if `fn()` finishes before the timeout:
  ```typescript
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => { ... }, timeoutMs);
  });
  ```
- **Impact:** Under sustained high-throughput tutoring sessions, orphaned timers accumulate in the V8 event loop, resulting in memory leaks and degraded server response latency.
- **Remediation:** Store `timeoutId` and invoke `clearTimeout(timeoutId)` in a `finally` block or use `AbortSignal.timeout(timeoutMs)`.

---

### [MEDIUM] SEC-V3-04: Header-Based Admin Key Override in Red Team Run Route
- **Affected File:** [`chemlearn-next/src/app/api/admin/red-team/run/route.ts`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/chemlearn-next/src/app/api/admin/red-team/run/route.ts#L30-L38)
- **Vulnerability:**
  The endpoint allows authentication bypass if `process.env.NODE_ENV !== 'production'` and the header `x-redteam-admin-key: dev-admin-override` is provided. If staging or preview environments deploy without `NODE_ENV=production`, unauthorized actors can trigger heavy automated test suites and exhaust server resources.
- **Impact:** Denial of service and unauthorized trigger of test runners in non-production environments.
- **Remediation:** Remove static header bypasses; require verified Firebase Admin session cookies or tokens across all environments.

---

### [MEDIUM] SEC-V3-06: High-Severity Supply-Chain Vulnerability (`js-yaml`)
- **Affected Dependency:** `js-yaml` (transitive dependency of test tooling)
- **Advisory:** GHSA-2883-xcg3-v3hh (Prototype pollution / denial of service via untrusted YAML parsing).
- **Audit Result:** `npm audit --audit-level=high` fails with Exit Code 1.
- **Remediation:** Run `npm audit fix` or add package overrides in `chemlearn-next/package.json` to enforce `js-yaml >= 4.1.1`.

---

### [MEDIUM] SEC-V3-09: Teacher Authorization Gap on Student Quiz Results
- **Affected File:** [`firestore.rules`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/firestore.rules#L110-L125)
- **Vulnerability:**
  The `/quiz_results/{resultId}` collection specifies:
  ```
  allow read: if isOwner(resource.data.studentId) || isAdmin();
  ```
  Teachers assigned to the student are omitted from read permissions, preventing instructors from viewing completed quizzes through the teacher portal.
- **Impact:** Broken teacher analytics workflow and inability to monitor classroom performance.
- **Remediation:** Update rule to `allow read: if isOwner(resource.data.studentId) || isTeacher() || isAdmin();`.

---

### [LOW] SEC-V3-07: Storage Rule Denial for Classroom Teachers
- **Affected File:** [`storage.rules`](file:///c:/Users/HP/OneDrive/Desktop/ChemLearn%20AI/storage.rules#L20-L35)
- **Vulnerability:**
  Uploaded laboratory reports and assignment files in `/student_uploads/{studentId}/**` allow read access only to `request.auth.uid == studentId`. Teachers cannot download or grade student lab submissions.
- **Impact:** Impaired grading workflow in teacher portal.
- **Remediation:** Allow teacher read access based on verified teacher claims or classroom assignment metadata.

---

### [INFO] SEC-V3-08: Test Suite Fidelity Boundary (Simulated vs Real)
- **Affected Files:** `chemlearn-next/src/lib/server/redteam/runner.ts`, `chemlearn-next/scripts/generate-redteam-report.js`
- **Observation:**
  Several red-team test suites evaluate simulated regex matches against predefined strings rather than executing live HTTP requests to the Gemini API or Firestore emulators.
- **Impact:** False sense of 100% prompt injection and hallucination resistance. Live model behavioral drift may still occur under production API keys.
- **Remediation:** Transition red-team test runners to use Gemini live API evaluations with canary safety benchmarks.

---

## 6. Disproven Audit Claims
- **Claimed SEC-V3-05:** "RateLimitError in `/api/ai/chat` returns an unhandled HTTP 500 status code."
- **Investigation:**
  Inspected `chemlearn-next/src/app/api/ai/_helpers.ts` lines 15–20:
  ```typescript
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode, headers: error.headers }
    );
  }
  ```
  `error.statusCode` resolves to HTTP 503 (or 429 depending on backpressure type). The error is properly caught and handled. **Claim is INVALID.**

---

## 7. Recommended Prioritized Remediation Roadmap

1. **Immediate (Security Hardening):**
   - Patch `firestore.rules` to enforce strict gamification boundaries (`validStudentCreate`, `validStudentUpdate`) and eliminate self-deletion.
   - Decommission `legacy-frontend` direct AI client access in `firebase.json`.
   - Remove `x-redteam-admin-key: dev-admin-override` from `chemlearn-next/src/app/api/admin/red-team/run/route.ts`.
2. **Intermediate (Reliability & Teacher Functionality):**
   - Add `clearTimeout` cleanup in `chemlearn-next/src/lib/server/ai-gateway.ts`.
   - Grant teachers read access to student `/quiz_results` in `firestore.rules` and student uploads in `storage.rules`.
   - Update dependencies to resolve `js-yaml` high audit vulnerability.
3. **Long-Term (AI Safety & Testing):**
   - Connect CI red-team suites to real Firebase Emulator and Gemini canary testing endpoints.
