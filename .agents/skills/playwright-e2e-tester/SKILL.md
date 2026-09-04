---
name: playwright-e2e-tester
description: Automated QA workflow for writing Playwright End-to-End tests specifically targeting interactive simulations and gamification flows.
---

# Playwright E2E Tester

This skill provides the standard workflow for generating automated End-to-End (E2E) tests using Playwright. It ensures that interactive Next.js components (especially WebGL canvases and Gamification logic) do not regress.

## 1. Context & Use Case
Use this skill whenever you need to:
- Verify that a multi-step user flow works (e.g., Login -> Dashboard -> Complete Quiz -> Gain XP).
- Test complex interactive science simulations (e.g., clicking chemical droppers, observing Canvas changes).
- Set up automated UI regression testing.

## 2. Test Structure Rules

### The AAA Pattern (Arrange, Act, Assert)
Every Playwright test must strictly follow the AAA pattern to maintain readability.
1. **Arrange:** Navigate to the page and set up the initial state (e.g., mock authentication).
2. **Act:** Perform user interactions (clicks, drag, type) using `page.locator()`.
3. **Assert:** Use `expect()` to verify the DOM state, URL changes, or Gamification HUD updates.

### Resilience and Locators
Never use fragile CSS selectors (e.g., `div > span:nth-child(2)`).
- **Primary:** Use `page.getByRole()`, `page.getByText()`, and `page.getByLabel()`.
- **Secondary:** Use `data-testid` attributes (e.g., `<div data-testid="xp-bar" />`).

## 3. Testing Interactive Simulations (Canvas/WebGL)
Testing `experiment.html` style simulations in Playwright is challenging because the inner workings of a `<canvas>` are invisible to the DOM.
- **Workflow:** To test WebGL interactivity, you must assert against **DOM Side Effects**.
- **Example:** You cannot test if the liquid in the 3D beaker turned red. Instead, you click the `page.getByRole('button', { name: 'Add Acid' })` and then assert that the DOM status badge updates: `expect(page.getByTestId('status-badge')).toHaveText('Acidic');`.

## 4. Mocking & Intercepting (Firebase)
Do not hit production Firebase databases during E2E testing.
- Use Playwright's `page.route()` API to mock API responses and Firestore data.
- Inject a dummy User object into the browser's `localStorage` or session to bypass the login screen for testing authenticated routes.

## 5. Execution
Run tests locally via `npx playwright test --ui` for visual debugging when porting legacy UI logic to React.
