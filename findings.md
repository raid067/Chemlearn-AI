# Project Northstar & Discovery (B.L.A.S.T. Protocol)

## 1. Northstar
The exact desired end-user outcome is a fully functional, production-ready Next.js (App Router) version of ChemLearn AI that replaces the legacy vanilla HTML/JS application. The system must feature robust gamification, AI-generated quizzes, 3D WebGL chemistry scenes (React Three Fiber), and secure authentication without browser-crashing performance leaks.

## 2. Integrations
- **Google Gemini API**: For dynamic generation of structured quiz questions and AI chatbot responses.
- **Firebase Auth**: For secure student login/signup.
- **Firebase Firestore**: For tracking user progression, XP, streaks, and quiz scores.

## 3. Source of Truth
- The primary source of truth for user state and gamification logic is **Zustand** on the client (`useAuthStore`, `useUIStore`, `useLabStore`).
- The persistent source of truth is **Firebase Firestore** (`students` collection).

## 4. Delivery Payload
- **Tech Stack**: Next.js 14+ (App Router), React Server Components, Tailwind CSS v4, React Three Fiber, Zustand.
- **Output Format**: A highly polished, mobile-responsive web application with smooth Page Transitions (Framer Motion) and 3D scenes loaded asynchronously.

## 5. Behavioral Rules
- Strictly adhere to Next.js App Router paradigms (use Server Components where possible; use `'use client'` strictly at the component leaves).
- 3D Canvases (`@react-three/fiber`) must never be rendered on the server (use Next.js `dynamic` with `ssr: false`).
- Do not utilize legacy DOM manipulation (`document.getElementById`). Rely exclusively on React state.
- Ensure API keys are never exposed on the client unless explicitly required (e.g., `NEXT_PUBLIC_` for Firebase Client SDK). Gemini calls must remain server-side.
