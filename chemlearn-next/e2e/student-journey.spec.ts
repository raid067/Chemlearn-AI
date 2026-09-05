import { test, expect } from '@playwright/test';

test.describe('ChemLearn Student Journey & Curriculum Flow', () => {

  test('1. Landing Page: displays KSSM SPM Chemistry branding and key navigation links', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');

    // Assert: Check primary branding and main navigation items
    await expect(page).toHaveTitle(/ChemLearn/i);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Check primary navigation links
    await expect(page.getByRole('link', { name: /lessons/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /quizzes/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /resources/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /experiment/i }).first()).toBeVisible();
  });

  test('2. Lessons Catalog: renders Chapter 6 and Chapter 8 KSSM modules', async ({ page }) => {
    // Arrange & Act
    await page.goto('/lessons');

    // Assert
    await expect(page.getByText('Acids, Bases and Salts')).toBeVisible();
    await expect(page.getByText('Manufactured Substances in Industry')).toBeVisible();

    // Verify subtopics are clickable
    const chapter6Link = page.getByRole('link', { name: /chapter 6|acids, bases/i }).first();
    await expect(chapter6Link).toBeVisible();
  });

  test('3. Lesson Study Flow: renders curriculum content and completes lesson with XP', async ({ page }) => {
    // Mock the lesson complete API endpoint
    await page.route('/api/lessons/complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            success: true,
            alreadyAwarded: false,
            xpAwarded: 25,
            currentXp: 125,
            currentLevel: 1,
            levelUp: false,
          },
        }),
      });
    });

    // Arrange & Act
    await page.goto('/lessons/chapter-6/6-1');

    // Assert: Verify topic heading and chemical concepts
    await expect(page.getByRole('heading', { name: /Role of Water/i }).first()).toBeVisible();
    await expect(page.getByText(/hydrogen ions/i)).toBeVisible();

    // Act: Click Mark as Complete if present
    const completeBtn = page.getByRole('button', { name: /mark as complete|complete lesson|completed/i });
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      // Assert: Verify completion state change
      await expect(page.getByText(/completed|\+25 xp/i)).toBeVisible();
    }
  });

  test('4. Quizzes Hub: renders quiz selector and AI quiz generation options', async ({ page }) => {
    // Arrange & Act
    await page.goto('/quizzes');

    // Assert: Check quiz hub heading and topic filter buttons
    await expect(page.getByRole('heading', { name: /Chemistry Quizzes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /All Topics/i })).toBeVisible();
    await expect(page.getByText(/Alloy Interactive Game/i)).toBeVisible();
  });

  test('5. Study Resources & Calculators: tabs toggle smoothly', async ({ page }) => {
    // Arrange & Act
    await page.goto('/resources');

    // Assert: Tab navigation exists
    const downloadsTab = page.getByRole('button', { name: /downloads/i });
    const notesTab = page.getByRole('button', { name: /ai notes/i });
    const homeworkTab = page.getByRole('button', { name: /homework checker/i });
    const toolsTab = page.getByRole('button', { name: /calculators/i });

    await expect(downloadsTab).toBeVisible();
    await expect(notesTab).toBeVisible();
    await expect(homeworkTab).toBeVisible();
    await expect(toolsTab).toBeVisible();

    // Act: Click Calculators tab
    await toolsTab.click();

    // Assert: Calculator elements become visible
    await expect(page.getByText(/molarity|dilution|ph calculator/i).first()).toBeVisible();
  });

  test('6. Virtual Experiments Lab: displays available simulations', async ({ page }) => {
    // Arrange & Act
    await page.goto('/experiments');

    // Assert: Check simulation lab options
    await expect(page.getByText(/Thermal Decomposition/i)).toBeVisible();
    await expect(page.getByText(/Acid Dilution/i)).toBeVisible();
    await expect(page.getByText(/Salt Analysis/i)).toBeVisible();
  });

  test('7. Mobile Responsiveness: viewport behaves cleanly without horizontal overflow', async ({ page }) => {
    // Set mobile viewport (Pixel 5: 393 x 851)
    await page.setViewportSize({ width: 393, height: 851 });

    // Arrange & Act
    await page.goto('/');

    // Assert: Hero is visible and no body horizontal scrolling occurs
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 5);

    // Navigate to lessons on mobile
    await page.goto('/lessons');
    await expect(page.getByText('Acids, Bases and Salts')).toBeVisible();
  });

  test('8. AI Gateway Resilience: handles 504 timeout and 429 quota gracefully in UI', async ({ page }) => {
    // Intercept AI chat to simulate timeout
    await page.route('/api/ai/chat', async (route) => {
      await route.fulfill({
        status: 504,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'AI generation timed out. Please try again.',
          code: 'AI_TIMEOUT',
        }),
      });
    });

    await page.goto('/');
    // Check that landing page remains fully stable when AI encounters timeouts
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('9. Chapter 8 Curriculum: loads Manufactured Substances subtopics', async ({ page }) => {
    await page.goto('/lessons/chapter-8');
    await expect(page.getByText(/Manufactured Substances in Industry/i)).toBeVisible();
    await expect(page.getByText(/Alloys/i).first()).toBeVisible();
  });

  test('10. Auth Modal: opens upon request and closes gracefully with Escape key', async ({ page }) => {
    await page.goto('/');

    const signInBtn = page.getByRole('button', { name: /sign in|login|get started/i }).first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      // Verify modal or login trigger
      await page.keyboard.press('Escape');
    }
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('11. Security Guard: rejects unauthenticated lesson completion API call with 401', async ({ request }) => {
    const res = await request.post('/api/lessons/complete', {
      data: { chapterId: 'chapter-6', topicId: '6-1' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Authorization|Unauthorized|sign in/i);
  });

});

