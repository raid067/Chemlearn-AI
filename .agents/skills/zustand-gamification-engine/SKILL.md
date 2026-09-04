---
name: zustand-gamification-engine
description: Architecture standard for building centralized Gamification logic (XP, Streaks, Levels, Badges) using Zustand in Next.js.
---

# Zustand Gamification Engine

This skill outlines the architectural standard for implementing Gamification (XP, Levels, Badges, Streaks) synchronously across a React/Next.js application using Zustand.

## 1. Context & Use Case
Use this skill whenever you need to:
- Award XP to a user after completing a Quiz, Lesson, or Experiment.
- Track daily streaks and Pomodoro sessions.
- Calculate Level thresholds dynamically based on total XP.
- Sync Gamification state locally and persist it to Firebase Firestore.

## 2. Core Architecture Rules

### Single Source of Truth
Do not hold local component state for gamification logic. The Zustand store (`useGamificationStore`) must be the absolute source of truth.

### Store Interface Design
The store must encapsulate both the raw data and the methods to mutate it.
```typescript
interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  
  // Actions
  addXP: (amount: number, reason: string) => void;
  incrementStreak: () => void;
  unlockBadge: (badgeId: string) => void;
  syncWithFirebase: (uid: string) => Promise<void>;
}
```

## 3. The Gamification Loop Workflow

1. **Trigger:** A user completes an action (e.g., finishes an experiment).
2. **Mutation:** The component calls `addXP(50)`.
3. **Internal Calculation:** The Zustand action automatically calculates if the new XP crosses a level threshold.
4. **Side Effect (Animation):** If a level-up occurs, Zustand updates a `levelUpModalTrigger` boolean, which a globally mounted `<LevelUpOverlay />` component listens to and plays a Framer Motion animation.
5. **Persistence:** The store triggers a debounced sync to Firebase Firestore to save the new XP/Level state.

## 4. Derived State (Selectors)
Never store derived data (like the Title of a level or the progress percentage to the next level) in the store. Calculate it dynamically.
```typescript
// Example: Dynamically calculate progress
const progressToNextLevel = (currentXP / getNextLevelThreshold(currentLevel)) * 100;
```

## 5. Security & Validation
- **Client Trust:** The Zustand store lives on the client. For sensitive applications, Firebase Security Rules or Server Actions must validate the XP payload before writing to the database (e.g., verifying that a user can't send `addXP(999999)`).
