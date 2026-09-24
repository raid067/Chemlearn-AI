# ChemLearn AI - n8n Automation Engine

This directory provides self-hosted container scaffolding and ready-to-import n8n workflows for ChemLearn AI background processing.

## Quick Start

1. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   Fill in `N8N_ENCRYPTION_KEY`, `N8N_WEBHOOK_SECRET`, and `GEMINI_API_KEY`.
   > Ensure `N8N_WEBHOOK_SECRET` matches the `N8N_WEBHOOK_SECRET` set in `chemlearn-next/.env.local`.

2. **Start Container:**
   ```bash
   docker compose up -d
   ```
   Open `http://localhost:5678` in your browser to complete owner setup.

3. **Import Pre-Built Workflows:**
   In n8n UI, click **Workflows** ➔ **Import from File...** and select from `n8n/workflows/`:
   - `teacher-remedial-digest.json`: Analyzes student errors in Form 4 Chapter 6 (*Acid, Base and Salt*) & Chapter 8 (*Manufactured Substances in Industry*) and posts remedial plans.
   - `batch-spm-worksheet-generator.json`: Generates KSSM DLP SPM structured questions via Gemini 1.5 and publishes directly to `server_quizzes`.
   - `nightly-red-team-sentinel.json`: Cron schedule triggering adversarial safety scans and alerting on failures.

## Security Architecture

- **HMAC-SHA256 Signatures:** All webhook exchanges between ChemLearn AI and n8n are authenticated via `X-ChemLearn-Signature: sha256=<hex>` and 300s timestamp freshness headers.
- **Fail-Open Dispatch:** ChemLearn AI dispatches outbound events without blocking client UI latency.
