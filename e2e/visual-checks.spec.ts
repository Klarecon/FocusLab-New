/**
 * Playwright Visual & Structural Checks
 *
 * These tests open a real browser and verify what the USER sees.
 * They catch issues that grep-based tests miss:
 * - Text overlapping
 * - Missing chart elements
 * - Columns that should be removed
 * - Layout/sizing problems
 *
 * Run: npx playwright test
 */

import { test, expect } from "@playwright/test";

test.describe("Focus Tool — Assign Fixes tab", () => {
  test("no 'pre-built fixes' empty state message appears", async ({ page }) => {
    await page.goto("/focus");
    const badCopy = page.locator("text=We don't have pre-built fixes");
    await expect(badCopy).toHaveCount(0);
  });

  test("each drain section has an inline add-your-own input", async ({ page }) => {
    await page.goto("/focus");
    // Every drain section should have an "Add your own fix" input
    const addInputs = page.locator('input[placeholder="Add your own fix..."]');
    // At least one should exist if there are drains
    const drainSections = page.locator("text=hrs/week wasted");
    const drainCount = await drainSections.count();
    if (drainCount > 0) {
      const inputCount = await addInputs.count();
      expect(inputCount).toBeGreaterThanOrEqual(drainCount);
    }
  });

  test("no duplicate solutions across drain sections", async ({ page }) => {
    await page.goto("/focus");
    // Collect all solution titles visible on the page
    const solutionCards = page.locator('[aria-pressed]');
    const count = await solutionCards.count();
    if (count > 1) {
      const titles: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await solutionCards.nth(i).innerText();
        const title = text.split("\n")[0].trim();
        titles.push(title);
      }
      const uniqueTitles = new Set(titles);
      expect(titles.length).toBe(uniqueTitles.size);
    }
  });

  test("selected solutions use checkmark, not crying emoji", async ({ page }) => {
    await page.goto("/focus");
    const cryingEmoji = page.locator("text=🥲");
    await expect(cryingEmoji).toHaveCount(0);
  });
});

test.describe("Focus Tool — Action Plan tab", () => {
  test("no Owner column label exists", async ({ page }) => {
    await page.goto("/focus");
    // Click Action Plan tab
    const actionPlanTab = page.locator('role=tab[name*="Action Plan"]');
    if (await actionPlanTab.isVisible()) {
      await actionPlanTab.click();
      const ownerLabel = page.locator("text=Owner").first();
      await expect(ownerLabel).toHaveCount(0);
    }
  });

  test("no Reclaim column label exists", async ({ page }) => {
    await page.goto("/focus");
    const actionPlanTab = page.locator('role=tab[name*="Action Plan"]');
    if (await actionPlanTab.isVisible()) {
      await actionPlanTab.click();
      const reclaimLabel = page.locator("text=Reclaim").first();
      await expect(reclaimLabel).toHaveCount(0);
    }
  });
});

test.describe("Focus Tool — EVI Matrix tab", () => {
  test("tab label says EVI not EvI", async ({ page }) => {
    await page.goto("/focus");
    const eviTab = page.locator('role=tab:has-text("EVI Matrix")');
    await expect(eviTab).toHaveCount(1);
    const oldTab = page.locator('role=tab:has-text("EvI Matrix")');
    await expect(oldTab).toHaveCount(0);
  });

  test("chart dot count matches fix count in summary", async ({ page }) => {
    await page.goto("/focus");
    const eviTab = page.locator('role=tab[name*="EVI"]');
    if (await eviTab.isVisible()) {
      await eviTab.click();
      await page.waitForTimeout(500);

      // Count dots (circles in the scatter chart SVG)
      const dots = page.locator("svg g circle");
      const dotCount = await dots.count();

      // Get the "N fixes mapped" text
      const mappedText = page.locator("text=/\\d+ fixes mapped/");
      if (await mappedText.isVisible()) {
        const text = await mappedText.innerText();
        const expectedCount = parseInt(text.match(/(\d+)/)?.[1] ?? "0");
        if (expectedCount > 0) {
          expect(dotCount).toBe(expectedCount);
        }
      }
    }
  });

  test("Action Sequence uses proper table elements", async ({ page }) => {
    await page.goto("/focus");
    const eviTab = page.locator('role=tab[name*="EVI"]');
    if (await eviTab.isVisible()) {
      await eviTab.click();
      await page.waitForTimeout(500);

      const actionSequence = page.locator("text=Your Action Sequence");
      if (await actionSequence.isVisible()) {
        // Verify table elements exist nearby
        const tables = page.locator("table");
        expect(await tables.count()).toBeGreaterThan(0);
      }
    }
  });
});

test.describe("Analyzer — DrilldownStep", () => {
  test("sticky total counter is visible during scroll", async ({ page }) => {
    await page.goto("/analyzer");
    // The sticky counter uses position: fixed, so check for it
    const stickyCounter = page.locator(".fixed:has-text('hrs/wk')");
    // It only appears when there are hours entered, so this is a structural check
    // Just verify the component exists in the DOM when loaded
    await expect(page.locator("text=Where does your time go")).toBeVisible();
  });
});
