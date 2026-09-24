# n8n Workflow Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate n8n into ChemLearn AI as an asynchronous automation engine for teacher remedial diagnostics, batch SPM worksheet generation (targeting Form 4 Chapters 6 & 8), and automated nightly red-team security audits.

**Architecture:** ChemLearn AI dispatches signed HMAC-SHA256 events to an n8n webhook instance. n8n executes Gemini 1.5 workflows and posts vetted results back to ChemLearn via `/api/webhooks/n8n`. A self-hosted Docker Compose template and 3 ready-to-import workflow JSON blueprints provide out-of-the-box operation.

**Tech Stack:** Next.js 16, TypeScript, Node.js `crypto`, Zod, Firebase Admin SDK, n8n, Docker Compose, Google Gemini 1.5 API.

**Spec:** `docs/superpowers/specs/2026-09-23-n8n-workflow-integration-design.md`

## Global Constraints
- Target Curriculum Focus: Form 4 Chapter 6 (*Acid, Base and Salt*) & Chapter 8 (*Manufactured Substances in Industry*).
- Authentication: HMAC-SHA256 over raw JSON payload with 300s timestamp replay defense and `crypto.timingSafeEqual`.
- Resiliency: Outbound event dispatch must fail-open so student/teacher UI latency is unaffected if n8n is offline.
- Server-authoritative writes: Inbound updates write to protected collections via Firebase Admin SDK only.

---

### Task 1: Type Definitions and Cryptographic Security Module

**Files:**
- Create: `chemlearn-next/src/lib/n8n/types.ts`
- Create: `chemlearn-next/src/lib/n8n/security.ts`
- Test: `chemlearn-next/src/tests/n8n-security.test.ts`

**Interfaces:**
- Produces:
  - `generateSignature(payload: string, secret: string): string`
  - `verifySignature(payload: string, signature: string, secret: string): boolean`
  - `verifyTimestamp(timestampHeader: string | null, maxAgeMs?: number): boolean`
  - Zod schemas: `N8nInboundPayloadSchema`, `N8nOutboundEventSchema`

- [ ] **Step 1: Write unit tests for cryptographic signer and verifier**
- [ ] **Step 2: Run test to ensure it fails**
- [ ] **Step 3: Implement `security.ts` and `types.ts` with timingSafeEqual**
- [ ] **Step 4: Run test to ensure all tests pass**

---

### Task 2: Outbound Event Dispatcher

**Files:**
- Create: `chemlearn-next/src/lib/n8n/dispatcher.ts`
- Test: `chemlearn-next/src/tests/n8n-dispatcher.test.ts`

**Interfaces:**
- Consumes: `security.ts`, `types.ts`
- Produces:
  - `dispatchN8nEvent<T>(event: N8nEventType, data: T): Promise<boolean>`

- [ ] **Step 1: Write unit tests with mocked fetch verifying headers and fail-open behavior**
- [ ] **Step 2: Run test to ensure it fails**
- [ ] **Step 3: Implement `dispatcher.ts` with non-blocking async execution and retry logic**
- [ ] **Step 4: Run test to ensure all tests pass**

---

### Task 3: Inbound Webhook Endpoint in Next.js

**Files:**
- Create: `chemlearn-next/src/app/api/webhooks/n8n/route.ts`
- Test: `chemlearn-next/src/tests/n8n-webhook.test.ts`

**Interfaces:**
- Consumes: `security.ts`, `types.ts`, `firebase-admin`
- Produces:
  - `POST /api/webhooks/n8n` handling `worksheet.publish`, `remedial.assign`, `health.ping`

- [ ] **Step 1: Write integration tests for invalid signatures, expired timestamps, and valid payloads**
- [ ] **Step 2: Run test to ensure it fails**
- [ ] **Step 3: Implement `route.ts` with signature verification and handlers**
- [ ] **Step 4: Run test to ensure all tests pass**

---

### Task 4: n8n Self-Hosted Scaffolding

**Files:**
- Create: `n8n/docker-compose.yml`
- Create: `n8n/.env.example`
- Create: `n8n/README.md`

- [ ] **Step 1: Create `n8n/docker-compose.yml` with SQLite persistence and webhook tunnel config**
- [ ] **Step 2: Create `n8n/.env.example` with documented secret definitions**
- [ ] **Step 3: Create `n8n/README.md` with step-by-step instructions for importing workflows**

---

### Task 5: 3 Production n8n Workflows Grounded in Chapter 6 & 8

**Files:**
- Create: `n8n/workflows/teacher-remedial-digest.json`
- Create: `n8n/workflows/batch-spm-worksheet-generator.json`
- Create: `n8n/workflows/nightly-red-team-sentinel.json`

- [ ] **Step 1: Build `teacher-remedial-digest.json` targeting Form 4 Ch 6 & 8 diagnostic evaluation**
- [ ] **Step 2: Build `batch-spm-worksheet-generator.json` with KSSM DLP SPM structured question prompts**
- [ ] **Step 3: Build `nightly-red-team-sentinel.json` with automated alerting**

---

### Task 6: Verification & Full Regression Test

- [ ] **Step 1: Run all n8n Jest test suites**
- [ ] **Step 2: Run Next.js production build (`npm run build`)**
