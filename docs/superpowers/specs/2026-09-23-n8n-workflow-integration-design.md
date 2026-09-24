# Architecture Design Spec: n8n Workflow Integration for ChemLearn AI

**Date:** 2026-09-23  
**Status:** Approved by User  
**Target Focus:** SPM Chemistry Form 4 Chapter 6 (*Acid, Base and Salt*) & Chapter 8 (*Manufactured Substances in Industry*)

---

## 1. Executive Summary

This specification establishes an event-driven background orchestration layer for ChemLearn AI using **n8n**. While ChemLearn AI's Next.js 16 App Router handles low-latency, synchronous user actions (real-time duels, instant OCR marking, live tutor chat), n8n executes long-running asynchronous workflows:
1. **Teacher Remedial Diagnostics & Student Retention:** Automated SPM KSSM diagnostic synthesis when students struggle with Chapter 6 (Salt Qualitative Analysis, Solubility Rules) and Chapter 8 (Alloy Lattice Disruption, Materials Comparison).
2. **Batch SPM Worksheet & Question Pack Generation:** Orchestrating Gemini 1.5 Pro to generate structured, syllabus-grounded Form 4 Chapter 6 & 8 exam questions and writing them securely back to Firestore.
3. **Automated Red-Team & AI Safety Sentinel:** Scheduled nightly adversarial testing pings against `/api/admin/red-team/run`, monitoring for prompt injections or curriculum hallucination with Discord/Slack alerting.

---

## 2. System Architecture & Secure Bridge

```
┌────────────────────────────────────────────────────────┐
│               ChemLearn AI (Next.js 16)                │
│                                                        │
│  [Quiz / Lesson / Admin]                               │
│           │                                            │
│           ▼ (Async / Fire-and-forget)                  │
│   src/lib/n8n/dispatcher.ts                           │
│           │ (HTTP POST with HMAC SHA-256 signature)    │
└───────────┼────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│                   n8n Automation Engine                │
│             (Self-hosted Docker / Cloud)               │
│                                                        │
│  Webhook Trigger ➔ Data Processing ➔ Gemini AI Nodes   │
│                 ➔ Notification / Firestore             │
└───────────┬────────────────────────────────────────────┘
            │
            ▼ (HTTP POST with HMAC SHA-256 signature)
┌────────────────────────────────────────────────────────┐
│  /api/webhooks/n8n/route.ts                            │
│  • Validates `X-ChemLearn-Signature` (HMAC SHA-256)    │
│  • Zod schema validation on inbound payloads           │
│  • Performs privileged updates via Firebase Admin SDK  │
└────────────────────────────────────────────────────────┘
```

### 2.1 Cryptographic Verification Protocol
- **Shared Secret:** `process.env.N8N_WEBHOOK_SECRET`
- **Algorithm:** HMAC-SHA256 over raw request body UTF-8 bytes.
- **Header:** `X-ChemLearn-Signature: sha256=<hex_digest>`
- **Timestamp Validation:** `X-ChemLearn-Timestamp: <unix_epoch_ms>` (rejects requests older than 300 seconds to prevent replay attacks).
- **Constant-Time Comparison:** Enforced using Node.js `crypto.timingSafeEqual`.

### 2.2 Event Registry
| Event Type | Direction | Description |
| :--- | :---: | :--- |
| `quiz.completed` | Outbound (Next.js ➔ n8n) | Sent when quiz score is $< 50\%$ or on teacher request; contains student ID, chapter, subtopics, and wrong answers. |
| `worksheet.generate_requested` | Outbound (Next.js ➔ n8n) | Teacher triggers generation of Form 4 Chapter 6 or Chapter 8 worksheet. |
| `worksheet.publish` | Inbound (n8n ➔ Next.js) | n8n writes vetted SPM structured questions directly to `server_quizzes` collection. |
| `remedial.assign` | Inbound (n8n ➔ Next.js) | n8n writes targeted student remedial practice plan to Firestore. |
| `redteam.scheduled_run` | Inbound (n8n ➔ Next.js) | Nightly cron initiates admin red team evaluation and receives audit report. |

---

## 3. Targeted Curriculum Grounding: Form 4 Chapter 6 & 8

All n8n AI prompts and validation nodes integrate with ChemLearn AI's authoritative KSSM curriculum definitions:

### 3.1 Chapter 6: Acid, Base and Salt (*Asid, Bes dan Garam*)
- **Subtopics:** 6.1 (Acid and Base properties), 6.7 (Neutralisation & Titration $M_a V_a / a = M_b V_b / b$), 6.8 (Solubility & SPA salts), 6.9 (Preparation of soluble/insoluble salts via double decomposition), 6.10 (Effect of heat on salts), 6.11 (Qualitative Analysis of Cations & Anions).
- **Diagnostic Rules:**
  - Detect confusion between amphoteric cations ($Al^{3+}, Pb^{2+}, Zn^{2+}$) dissolving in excess $NaOH$ vs $NH_3$.
  - Identify errors in precipitation methods for insoluble salts (e.g. $PbSO_4, BaSO_4, AgCl$).

### 3.2 Chapter 8: Manufactured Substances in Industry (*Bahan Buatan dalam Industri*)
- **Subtopics:** 8.1 (Alloys: Bronze, Brass, Steel, Stainless Steel, Duralumin, Pewter; atomic layer slip plane disruption), 8.2 (Glass: Fused silica, Soda-lime, Borosilicate, Lead crystal), 8.3 (Ceramics: Traditional kaolin vs Advanced zirconia/alumina), 8.4 (Composite materials: Reinforced concrete, Fibreglass, Optical fibres, Photochromic glass, Superconductors).
- **Diagnostic Rules:**
  - Validate mechanical property explanations (foreign atoms of different size disrupt orderly atomic arrangement, preventing layers from sliding easily).

---

## 4. Components & File Layout

1. **Next.js Core Integration:**
   - `chemlearn-next/src/lib/n8n/dispatcher.ts`: Outbound signed event dispatcher with exponential retry and graceful fallback.
   - `chemlearn-next/src/lib/n8n/types.ts`: TypeScript schemas and interfaces for all n8n event payloads.
   - `chemlearn-next/src/app/api/webhooks/n8n/route.ts`: Hardened inbound webhook endpoint with HMAC validation and Zod verification.
   - `chemlearn-next/src/tests/n8n-webhook.test.ts`: Automated unit/integration tests for authorization, signature validity, and error boundaries.

2. **n8n Orchestration Pack (`n8n/`):**
   - `n8n/docker-compose.yml`: Self-hosted container setup for n8n with SQLite persistence and webhook tunnels.
   - `n8n/.env.example`: Template for environment variables (`N8N_ENCRYPTION_KEY`, `WEBHOOK_URL`, `CHEMLEARN_API_URL`, `N8N_WEBHOOK_SECRET`).
   - `n8n/workflows/teacher-remedial-digest.json`: Importable n8n workflow for Chapter 6 & 8 student diagnostics.
   - `n8n/workflows/batch-spm-worksheet-generator.json`: Importable n8n workflow for Chapter 6 & 8 structured question generation.
   - `n8n/workflows/nightly-red-team-sentinel.json`: Importable n8n workflow for automated nightly red-team security audits.
   - `n8n/README.md`: Step-by-step setup and import guide.

---

## 5. Security & Fail-Safe Architecture

- **Fail-Safe Operation:** If n8n is unavailable, ChemLearn AI continues operating at 100% capacity without degrading the student experience.
- **Timing-Safe Authentication:** Constant-time buffer comparison prevents side-channel timing attacks on webhook tokens.
- **Strict Role Elevation:** The inbound webhook route enforces `role === 'system'` before writing to protected Firestore collections (`server_quizzes`, `feedbacks`).
