# Form 4 Chapter 8 (*Manufactured Substances in Industry*) Deep-Dive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Form 4 Chapter 8 (*Manufactured Substances in Industry / Bahan Buatan dalam Industri*) into an interactive, high-retention learning module featuring atomic lattice shear simulations, virtual KSSM laboratory drop and corrosion tests, glass/ceramics property comparisons, and comprehensive SPM Paper 2/Paper 3 exam question banks.

**Architecture:** Interactive Client Components built with Next.js 16, Tailwind CSS v4, Framer Motion, and HTML5 Canvas / SVG (avoiding heavy WebGL bundle penalties while ensuring high frame rates on student mobile devices). State is managed via local React state and synchronized with `@/stores/useUserStore` for XP rewards upon experiment completion.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion, Jest, React Testing Library.

**Spec / Grounding:** Malaysian KSSM Chemistry Form 4 Syllabus, Chapter 8.

---

## Global Constraints

- **Curriculum Alignment:** 100% compliant with SPM KSSM Chemistry syllabus for Form 4 Chapter 8.1 (Alloys), 8.2 (Glass), 8.3 (Ceramics), and 8.4 (Composite Materials).
- **Dual Language Support (DLP):** Technical terminology rendered in both English and Bahasa Melayu (e.g. *kekerasan aloi*, *lapisan atom menggelongsor*, *kaca borosilikat*, *bahan komposit*).
- **Mobile Performance:** Zero-lag 60fps animations on mobile browsers; SVG and Framer Motion spring physics with HTML canvas fallbacks.
- **TDD Requirement:** Every interactive component and utility must have dedicated unit and accessibility test coverage.
- **Workflow Mandate:** After every response, deploy and commit to GitHub repository.

---

### Task 1: Microscopic Atomic Lattice Shear Simulator (Subtopic 8.1)

**Files:**
- Create: `chemlearn-next/src/components/experiments/chapter-8/AtomicLatticeSimulator.tsx`
- Create: `chemlearn-next/__tests__/chapter-8-lattice.test.tsx`

**Interfaces:**
- Produces: `<AtomicLatticeSimulator mode="pure" | "alloy" onShearComplete?: (displacement: number) => void />`
- Visualizes:
  - **Pure Metal (Copper):** Identical orange circles arranged in neat, orderly rows. Dragging a force slider slides the top layers effortlessly with low shear resistance.
  - **Alloy (Bronze/Brass):** Mixed lattice with larger foreign tin/zinc atoms disrupting the orderly rows. Applying force causes atom pin-locking and resistance to slip planes.

- [ ] **Step 1: Write failing unit test for lattice simulation state and shear calculations**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `AtomicLatticeSimulator.tsx` with interactive force slider and displacement physics**
- [ ] **Step 4: Verify test passes with 100%**
- [ ] **Step 5: Commit and deploy**

---

### Task 2: Virtual Hardness Drop Test & Rust Race Lab (Subtopics 8.1 & Experiments 8.1A/8.1B)

**Files:**
- Create: `chemlearn-next/src/components/experiments/chapter-8/HardnessDropTest.tsx`
- Create: `chemlearn-next/src/components/experiments/chapter-8/RustRaceTest.tsx`
- Create: `chemlearn-next/__tests__/chapter-8-virtual-lab.test.tsx`
- Modify: `chemlearn-next/src/app/experiments/chapter-8/page.tsx`

**Interfaces:**
- `HardnessDropTest`: Interactive retort stand dropping a 1kg weight onto steel ball bearing over copper vs bronze blocks; dynamic calliper measurement showing smaller dent on bronze.
- `RustRaceTest`: Accelerated time-lapse simulation of Iron nail vs Steel nail vs Stainless steel nail in jelly/agar with potassium hexacyanoferrate(III) indicator (Prussian blue spots $Fe^{2+}$ test).

- [ ] **Step 1: Write failing test for virtual lab state transitions (dropping weight, time-lapse corrosion)**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `HardnessDropTest.tsx` and `RustRaceTest.tsx`**
- [ ] **Step 4: Replace placeholder in `chemlearn-next/src/app/experiments/chapter-8/page.tsx`**
- [ ] **Step 5: Run test to verify all tests pass**
- [ ] **Step 6: Commit and deploy**

---

### Task 3: Interactive Glass & Ceramics Property Matrix (Subtopics 8.2 & 8.3)

**Files:**
- Create: `chemlearn-next/src/components/experiments/chapter-8/GlassCeramicsMatrix.tsx`
- Create: `chemlearn-next/__tests__/chapter-8-materials.test.tsx`

**Interfaces:**
- Produces: `<GlassCeramicsMatrix />`
- Covers:
  - Fused silica vs Soda-lime vs Borosilicate vs Lead crystal glass comparison (thermal shock resistance, chemical durability, composition, applications).
  - Traditional ceramics (Kaolin clay) vs Advanced ceramics (Alumina, Silicon carbide, Zirconia) in aerospace and medical implants.

- [ ] **Step 1: Write failing test verifying material filtering, properties, and quiz triggers**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `GlassCeramicsMatrix.tsx` with interactive comparison sliders and radar charts**
- [ ] **Step 4: Run test to verify passes**
- [ ] **Step 5: Commit and deploy**

---

### Task 4: Composite Materials Phase Inspector (Subtopic 8.4)

**Files:**
- Create: `chemlearn-next/src/components/experiments/chapter-8/CompositeInspector.tsx`
- Create: `chemlearn-next/__tests__/chapter-8-composites.test.tsx`

**Interfaces:**
- Produces: `<CompositeInspector />`
- Interactively breaks down the **Matrix Phase** + **Reinforcement Phase** for:
  1. Reinforced Concrete (Concrete + Steel rods)
  2. Fiberglass (Plastic + Glass fibres)
  3. Optical Fibres (Glass core $n_1$ + Cladding $n_2$)
  4. Photochromic Glass (Glass matrix + $AgCl$ / $CuCl$ UV light darkening simulation)
  5. Superconductors (Zero electrical resistance below critical temperature $T_c$)

- [ ] **Step 1: Write failing test for composite breakdown calculations**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `CompositeInspector.tsx` with UV light slider and microscopic phase toggle**
- [ ] **Step 4: Run test to verify passes**
- [ ] **Step 5: Commit and deploy**

---

### Task 5: Chapter 8 SPM Paper 2 & 3 Question Bank & Interactive Drills

**Files:**
- Create: `chemlearn-next/src/content/quizzes/chapter8-spm.ts`
- Create: `chemlearn-next/__tests__/chapter-8-spm-quizzes.test.ts`
- Modify: `chemlearn-next/src/content/chapter8.ts`

**Interfaces:**
- Produces: 15 comprehensive SPM-format structured & essay questions with exact KSSM marking schemes (marking criteria, common student pitfalls, bilingual keywords).

- [ ] **Step 1: Write failing test asserting all 15 questions adhere to SPM KSSM syllabus schema**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement questions and marking schemes in `chapter8-spm.ts`**
- [ ] **Step 4: Run test to verify passes**
- [ ] **Step 5: Run full test suite (`npm test`) and typecheck (`npm run typecheck`)**
- [ ] **Step 6: Final commit and cloud deployment**

---

## Verification Plan

### Automated Tests
```bash
npm test __tests__/chapter-8-*.test.tsx __tests__/chapter-8-*.test.ts
npm test
npm run typecheck
```

### Manual Verification
1. Open `/experiments/chapter-8` in browser.
2. Drag the force slider in the **Atomic Lattice Shear Simulator** and observe pure copper layers slide smoothly while bronze lattice locks up.
3. Trigger the **Hardness Drop Test** and inspect the digital vernier calliper reading (e.g. Copper: 5.2 mm dent vs Bronze: 2.8 mm dent).
4. Run the **Rust Race** time-lapse and verify the blue potassium hexacyanoferrate(III) precipitate on iron nail vs zero rust on stainless steel.
5. Inspect the **Photochromic Glass** UV slider to verify the darkening effect ($Ag^+ + e^- \to Ag$).
