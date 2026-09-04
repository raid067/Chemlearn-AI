---
name: vanilla-to-tailwind-extractor
description: Expert workflow for migrating legacy Vanilla CSS files and inline styles into strict Tailwind CSS configuration and utility classes for Next.js.
---

# Vanilla CSS to Tailwind Extractor

This skill governs the systematic extraction of legacy CSS into a modern Tailwind-first Next.js architecture. 

## 1. Context & Use Case
Use this skill whenever you need to:
- Port Vanilla HTML files with `<style>` blocks into Next.js React components.
- Standardize arbitrary hex colors, font sizes, and layout parameters into `tailwind.config.ts`.
- Replace manual DOM class toggling (e.g., `element.classList.add('active')`) with React state-driven Tailwind classes.

## 2. Extraction Workflow

### Phase 1: The Token Harvest (Design System Translation)
Before writing any React code, scan the legacy CSS for recurring values (colors, fonts, box-shadows, animations) and extract them.
1. **Identify Colors:** Convert arbitrary colors (e.g., `#6d28d9`, `var(--accent-purple)`) into semantic Tailwind extensions.
2. **Identify Animations:** Extract `@keyframes` and map them to Tailwind `theme.extend.keyframes`.
3. **Update `tailwind.config.ts`:** Write all harvested tokens into the global Tailwind configuration BEFORE porting components.

### Phase 2: Class Mapping (HTML to JSX)
When converting HTML elements to JSX:
- **Do not blindly copy/paste class names.** Translate them.
- Example Legacy: `<div class="hero-section">` with CSS `.hero-section { text-align: center; padding: 60px 24px; }`
- Example New: `<div className="text-center py-15 px-6">`
- Complex components that reuse the exact same styles heavily (like buttons) can be abstracted into reusable React components rather than using `@apply` in CSS.

### Phase 3: State-Driven Styling
Vanilla JS often uses `classList.toggle('active')`. In React, handle this dynamically using template literals or `clsx`/`tailwind-merge`.
```tsx
// Correct
<button className={`px-4 py-2 rounded-full ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
```

## 3. Strict Rules
- **No Global CSS Clutter:** `global.css` should ONLY contain `@tailwind base; @tailwind components; @tailwind utilities;` and essential root resets. Do not copy legacy CSS blocks here.
- **No Inline Styles:** Convert `style={{ margin-bottom: '10px' }}` to `className="mb-2.5"`.
- **Arbitrary Values:** Only use arbitrary values (e.g., `w-[1100px]`) for one-off layouts. If it is reused, add it to `tailwind.config.ts`.
