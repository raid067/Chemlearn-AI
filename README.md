# 🧪 ChemLearn AI — Intelligent SPM Chemistry Learning Ecosystem

<div align="center">

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_1.5_Pro_%2F_Flash-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

**An enterprise-grade, gamified AI learning ecosystem tailored for the Malaysian SPM Chemistry curriculum (Form 4 & Form 5 KSSM DLP — Dual-Language Programme).**

[🚀 Live Preview](https://chemlearn-67.web.app) • [✨ Key Features](#-key-features) • [🔬 Virtual Labs](#-interactive-virtual-labs) • [🏗️ Architecture](#️-system-architecture) • [⚡ Quick Start](#-quick-start) • [🛡️ Security](#-security--authorization)

</div>

---

## 🌟 Overview

**ChemLearn AI** bridges the gap between abstract chemical theories and intuitive mastery. Combining multimodal Large Language Models (**Google Gemini 1.5 Pro & Flash**), high-performance **HTML5 Canvas & Chart.js simulations**, **real-time multiplayer duels**, and a **Zustand-powered gamification engine**, ChemLearn AI provides Malaysian secondary students and educators with a modern, interactive learning environment.

```
                  ┌──────────────────────────────────────────────────┐
                  │                 ChemLearn AI                     │
                  │   Form 4 & Form 5 KSSM Chemistry Curriculum      │
                  └─────────────────────────┬────────────────────────┘
                                            │
        ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
        ▼                   ▼                               ▼                   ▼
 🤖 Multimodal AI   ⚔️ Real-Time Duels              🔬 Interactive Labs  👩‍🏫 Teacher Portal
 • Bilingual Tutor  • Live 1v1 Battles              • Salt Analysis Sim • Class Rosters
 • Homework OCR     • Anti-Tamper Security Rules    • Titration Engine  • Invite Codes
 • Structured Marks • Real-Time Firestore Sync      • Alloy Lattice Sim • Remediation
```

---

## ✨ Key Features

<details open>
<summary><b>🤖 1. Multimodal AI Chemistry Tutor (Gemini 1.5 Pro & Flash)</b></summary>
<br>

- **Adaptive Bilingual Understanding:** Automatically detects English or Bahasa Melayu queries (e.g., *"Apakah formula garam terlarutkan?"*) and responds using official KSSM SPM Chemistry terminology.
- **Vision-Powered Homework Grading:** Upload photos of handwritten homework or exam papers; Gemini 1.5 Pro evaluates molecular diagrams, stoichiometry steps, and chemical formulas.
- **Structured Question Marker:** Automatically scores structured questions out of 3 marks according to the SPM marking scheme with granular feedback.
- **AI Quiz & Note Generator:** Dynamically creates targeted MCQs and comprehensive study notes across Form 4 & Form 5 syllabus chapters.

</details>

<details>
<summary><b>⚔️ 2. Real-Time Multiplayer Chemistry Duels</b></summary>
<br>

- **Live Head-to-Head Matches:** Compete with peers in real-time quiz battles synchronized through Firestore listeners.
- **Anti-Tampering Security:** Firestore security rules enforce strict field isolation — Player 1 cannot write to Player 2 data, preventing client-side score tampering.
- **Dynamic Question Timer & Leaderboards:** Rapid-fire answering with instant result calculation and gamified rewards.

</details>

<details>
<summary><b>🎮 3. Gamification & Progression Engine</b></summary>
<br>

- **Server-Authoritative XP:** XP is securely verified and persisted server-side via atomic transactions to prevent spoofing.
- **Actions Rewarded:**
  - 📖 Complete Lesson: `+25 XP`
  - ⚔️ Win Duel: `+20 XP`
  - 📝 Complete Quiz: `+15 XP`
  - 🎯 Daily Challenge: `+10 XP`
- **Levels & Streaks:** Automated daily streak tracking with milestone badges and instant visual toast alerts.

</details>

<details>
<summary><b>🗂️ 4. Spaced Repetition (SRS) Flashcard Engine</b></summary>
<br>

- **SuperMemo SM-2 Algorithm:** Calculates optimal review intervals based on user response quality (`0: Blackout`, `3: Hard`, `4: Good`, `5: Easy`).
- **Offline First:** Stores cards and progress locally in native **IndexedDB**, with background bidirectional synchronization to Firebase when online.
- **Curated Decks:** 40+ comprehensive SPM Form 4 Chapter 8 flashcards covering Manufactured Substances in Industry.

</details>

<details>
<summary><b>👩‍🏫 5. Teacher Management & Analytics Portal</b></summary>
<br>

- **Class Creation & Join Codes:** Teachers generate unique 6-character invite codes for student enrollment.
- **Multi-Tenant Privacy:** Row-level Firestore security ensures teachers can only view students enrolled in their assigned rosters.
- **Pedagogical AI Advisor:** Generates class performance insights, identifies weak topics, and exports targeted remediation worksheets.

</details>

---

## 🔬 Interactive Virtual Labs

ChemLearn AI includes interactive standalone simulations designed to make complex SPM chemistry concepts tangible:

| Simulation | Chapter | Highlights |
| :--- | :--- | :--- |
| **🧪 Qualitative Salt Analysis** | SPM Form 4 Ch 6 | Complete 8-cation × 4-anion chemical logic matrix. Visualizes precipitate formation, color changes, and effervescence in an animated SVG test tube. |
| **📈 Acid-Base Titration Engine** | SPM Form 4 Ch 7/8 | Mathematical pH curve calculator based on Henderson-Hasselbalch equations with dynamic indicator color transitions (Phenolphthalein & Methyl Orange). |
| **⚙️ Alloy Lattice Shear Stress** | SPM Form 4 Ch 8.1 | HTML5 Canvas 2D physics engine showing atomic layer slippage in pure metals vs. pinning and fracture in interstitial/substitutional alloys. |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js 16 & PWA)"]
        UI["Tailwind CSS v4 + Framer Motion"]
        Zustand["Zustand Global Stores\n(Gamification, Quiz, UI)"]
        Labs["HTML5 Canvas 2D / Chart.js Labs"]
        IDB["IndexedDB (Offline SRS Flashcards)"]
    end

    subgraph API ["Next.js App Router (Server-Side)"]
        Zod["Zod v4 Validation Schemas"]
        RateLimit["Sliding Window Rate Limiter"]
        Routes["API Endpoints\n(/api/ai/*, /api/gamification/*, /api/classes/*)"]
    end

    subgraph External ["Cloud Infrastructure"]
        Gemini["Google Gemini 1.5 Pro & Flash AI"]
        Firestore["Cloud Firestore (Secure Multi-Tenant Rules)"]
        Auth["Firebase Authentication"]
    end

    UI --> Zustand
    Zustand --> Routes
    UI --> Labs
    UI --> IDB
    Routes --> Zod
    Zod --> RateLimit
    RateLimit --> Gemini
    RateLimit --> Firestore
    UI --> Auth
    Firestore <--> IDB
```

---

## 🛡️ Security & Authorization

- **Multi-Tenant Class Rosters:** Students stamp authorized `teacherIds` onto their profile during class join, enforced at the database level via Firestore security rules.
- **Segregated Duel Anti-Cheat:** Match participants can only mutate their own respective score and status fields.
- **Strict Zod Input Validation:** All API endpoints validate request payloads with strict Zod v4 schemas, blocking malformed or malicious inputs.
- **Server-Side Token Verification:** Sensitive endpoints verify Firebase Auth Bearer tokens via `firebase-admin` SDK.

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- `npm`, `pnpm`, or `yarn`

### 1. Clone the repository
```bash
git clone https://github.com/raid067/Chemlearn-AI.git
cd Chemlearn-AI
```

### 2. Install dependencies
```bash
# Install Next.js app dependencies
cd chemlearn-next
npm install
```

### 3. Configure environment variables
Create a `.env.local` file inside `chemlearn-next/`:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production build check
```bash
npm run build
```

---

## 📁 Repository Structure

```text
ChemLearn AI/
├── chemlearn-next/           # Modern Next.js 16 App Router application
│   ├── src/
│   │   ├── app/              # App Router pages & API routes
│   │   │   ├── api/ai/       # Gemini AI routes (chat, duel, grade, mark, quiz...)
│   │   │   ├── api/classes/  # Teacher classroom creation & join endpoints
│   │   │   ├── api/gamification/ # Server-authoritative XP sync
│   │   │   ├── dashboard/    # Student dashboard
│   │   │   ├── duel/         # Real-time multiplayer match room
│   │   │   ├── experiments/  # Virtual interactive labs
│   │   │   ├── lessons/      # Syllabus chapters & topic viewer
│   │   │   ├── quizzes/      # AI & standard quiz hub
│   │   │   └── teacher/      # Teacher roster & analytics portal
│   │   ├── components/       # Reusable UI & modal components
│   │   ├── lib/              # Firebase client/admin, Zod validations, rate limit
│   │   ├── stores/           # Zustand state management (gamification, quiz, ui)
│   │   └── types/            # TypeScript interfaces & definitions
│   └── firestore.rules       # Next.js local Firestore security rules
├── legacy-frontend/          # Standalone static HTML5 simulators & labs
│   └── experiments/          # Standalone simulation modules (salt, titration, alloy, SRS)
├── functions/                # Firebase Cloud Functions (backend triggers)
├── firestore.rules           # Production Firebase security rules
└── firebase.json             # Firebase deployment configuration
```

---

## 🗺️ Roadmap

- [x] Next.js 16 App Router with Server Components & Tailwind CSS v4
- [x] Google Gemini 1.5 Multimodal AI Tutor & Handwritten Homework Grader
- [x] Real-time Multiplayer Duels with anti-cheat Firestore rules
- [x] Spaced Repetition (SRS) Flashcards with IndexedDB + Cloud Sync
- [x] Interactive Salt Analysis, Titration & Alloy Shear Stress Simulators
- [x] Teacher Classroom Portal with invite codes & roster isolation
- [ ] Port legacy Admin, Privacy Policy & Terms of Service pages to Next.js App Router
- [ ] Upgrade in-memory rate limiter to Upstash Redis for distributed multi-region scaling
- [ ] Native iOS & Android packaging via Capacitor / React Native wrapper

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built with ❤️ for Malaysian STEM Education</b><br>
  <sub>Empowering students to master chemistry through AI, visual physics, and gamification.</sub>
</div>
