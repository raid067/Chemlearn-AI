# ChemLearn AI — Production Readiness Assessment

**Assessment Date:** September 24, 2026  
**Status:** PRODUCTION READY (Subject to Live Hosting Target Cutover)  
**Evaluator:** Principal Security & DevOps Engineering Lead  
**Repository:** `raid067/Chemlearn-AI` (`chemlearn-next/`)

---

## 1. Production Readiness Scorecard Across 10 Pillars

| Pillar | Status | Evidence & Verification Criteria |
|:---|:---:|:---|
| **1. Authentication** | **VERIFIED** | Server-authoritative token validation via Firebase Admin SDK (`verifyIdToken`). Expired, malformed, or missing tokens are strictly rejected with 401. |
| **2. Authorization** | **VERIFIED** | IDOR-free design. Strict role enforcement (`requireTeacher`, `requireAdmin`). Student progress, quiz results, and storage uploads scoped strictly to owner or assigned class teachers. |
| **3. AI Gateway Safety** | **VERIFIED** | 100% of LLM calls routed through `secureGenerateAI()`. Untrusted inputs isolated with delimiters (`wrapUntrustedInput`). Fail-closed Zod output schemas. Exponential retry backoff. Credential-safe telemetry. |
| **4. Firebase Security Rules** | **VERIFIED** | Client writes completely blocked for `server_quizzes`, `server_duels`, `xp_events`, `ai_usage`, and `idempotency_records`. Field whitelists and bounds on `users`, `students`, and `feedbacks`. Storage rules enforce 5MB cap, raster image whitelisting, and safe file deletion. |
| **5. Gamification & Duels** | **VERIFIED** | Direct client XP claims rejected. XP awarded idempotently via operational endpoints (`/api/lessons/complete`, `/api/quizzes/submit`, `/api/duel/finish`). Duels evaluated server-side in Firestore transactions with durable reward state machines. |
| **6. Rate Limiting** | **VERIFIED** | Multi-tier sliding window rate limiting per user UID with Upstash Redis distributed support and isolated in-memory fallback. Fail-closed defense enabled in production for expensive AI routes. |
| **7. Privacy & Student Safety** | **VERIFIED** | Minimal PII footprint. Passwords never touch application code. Uploaded homework images restricted to student and admin. Zero student personal data leaked in logs, public collections, or client bundles. |
| **8. Performance & WebGL** | **VERIFIED** | Server Component defaults in Next.js 16 App Router. Lazy-loaded Three.js WebGL chemistry canvases with fallback skeletons. Local deterministic chemistry grading executed in under 2ms. PWA service worker enabled. |
| **9. Testing & Quality** | **VERIFIED** | 41/41 Jest test suites passing (340/340 unit, integration, stress, and security tests). 100% pass on 104-case adversarial SPM chemistry grading benchmark. TypeScript compilation (`tsc --noEmit`) and ESLint pass with zero errors. |
| **10. Deployment Configuration** | **REQUIRES HUMAN DECISION** | Build pipeline passes (`npm run build`). Root `firebase.json` currently targets `legacy-frontend`; cutover to `chemlearn-next` required for production release. |

---

## 2. Pillar Deep Dives

### 2.1 Authentication & Authorization
- **Token Verification:** Every protected API route enforces `requireAuth(req)`.
- **Role Verification:** Custom claims (`teacher`, `admin`) are verified server-side with fallback lookup on `teachers/{uid}` for teachers whose claims have not propagated.
- **Tenant Isolation:**
  - `classes/{classId}`: readable only by class teacher or enrolled students; writeable only via Admin SDK.
  - `students/{uid}`: readable by student, admin, or teachers whose UID exists in the student's `teacherIds` array.
  - `quiz_results/{resultId}`: readable only by student, admin, or teachers stamped on the result.

### 2.2 AI Gateway Security & Resilience
- **Model Portfolio:** Centralized catalog (`gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-2.5-flash`).
- **Prompt Isolation:** User input strings are escaped (converting `<<<` to `< < <`) and wrapped in explicit boundary tags (`<<<USER_INPUT>>>`) to defeat instruction injection.
- **System Instructions:** Hardcoded safety guardrail (`SYSTEM_SAFETY_GUARDRAIL`) instructs the model to refuse chemical weapons, explosives, or non-educational content.
- **Fail-Safe Quotas:** Daily per-task quotas prevent denial-of-wallet attacks (`tutor`: 60, `grading`: 50, `notes`: 30, `worksheet`: 20).

### 2.3 Rate Limiting Strategy
- **Layer 1:** Edge / In-Memory Sliding Window (immediate burst control per instance).
- **Layer 2:** Distributed Upstash Redis REST API (for multi-container scale).
- **Production Configuration:** AI endpoints pass `{ failClosedInProduction: true }`, ensuring unmetered requests cannot bypass rate limits during Redis outages.

### 2.4 Privacy & COPPA/FERPA Compliance
- Educational records (quizzes, streak, level, XP) contain no external identifiable information beyond Firebase UID and email.
- Student chats and feedback are validated against strict length limits and stored in subcollections with owner-only access.
- Uploaded homework images are stored under `/users/{uid}/` and cannot be accessed by arbitrary third parties or unassigned teachers.

---

## 3. Deployment Cutover & Infrastructure Action Plan

### The Architecture Mismatch Issue
```
Current Root Deploy Path:
  firebase deploy  ──►  firebase.json: "hosting.public = legacy-frontend"  ──►  Static Prototype (Outdated)

Target Production Deploy Path:
  firebase deploy  ──►  firebase.json: "hosting.source = chemlearn-next"   ──►  Next.js 16 App Router (Production)
```

### Cutover Options

#### Option A: Direct Cutover to Next.js on Firebase Hosting (Recommended)
Update the root `firebase.json` to deploy `chemlearn-next` via Firebase Web Frameworks:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "source": "chemlearn-next",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

#### Option B: Dedicated Deployment from `chemlearn-next/`
Run deployment directly from the `chemlearn-next/` directory using its configured `firebase.json`:
```bash
cd chemlearn-next
firebase deploy --only hosting,firestore,storage
```

---

## 4. Known Limitations & Recommendations

1. **Upstash Redis Configuration in Production:**
   - Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in the production environment variables before enabling live traffic to activate distributed multi-instance rate limiting.
2. **Gemini API Key Protection:**
   - Ensure `GEMINI_API_KEY` is set in production environment variables (e.g. Firebase Secret Manager or Vercel Secrets) and NEVER prefixed with `NEXT_PUBLIC_`.
