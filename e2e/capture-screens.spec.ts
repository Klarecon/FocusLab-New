/**
 * Screenshot Capture — Visual Verification Pipeline
 *
 * Navigates through the full FocusLab wizard and captures screenshots
 * at every key state. Claude reviews these visually (multimodal) to
 * verify feedback items BEFORE declaring "done."
 *
 * Run: npx playwright test e2e/capture-screens.spec.ts
 * Screenshots saved to: e2e/screenshots/
 */

import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

async function snap(page: import("@playwright/test").Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function snapViewport(page: import("@playwright/test").Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  });
}

test.describe("Screenshot Capture — Full Wizard Flow", () => {
  // Set viewport so Recharts can measure container dimensions
  test.use({ viewport: { width: 1280, height: 900 } });

  test("capture all screens with realistic data", async ({ page }) => {
    test.setTimeout(120000);

    // ===== 1. LANDING PAGE =====
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await snap(page, "01-landing");
    // Hero viewport after animations settle (ring count-up + CTA).
    await page.waitForTimeout(2200);
    await snapViewport(page, "01b-hero-viewport");

    // ===== 2. ANALYZER — ROLE STEP =====
    await page.goto("/analyzer");
    await page.waitForLoadState("networkidle");
    await snap(page, "02-role-step-empty");

    // Select Marketing role
    const marketingCard = page.locator("text=Marketing").first();
    await marketingCard.click();
    await page.waitForTimeout(400);

    // Select level — "Manager / Team Lead"
    const managerLevel = page.locator("text=Manager").first();
    if (await managerLevel.isVisible({ timeout: 2000 }).catch(() => false)) {
      await managerLevel.click();
      await page.waitForTimeout(300);
    }
    await snap(page, "03-role-selected");

    // Click Continue
    await page.locator("button:has-text('Continue')").click();
    await page.waitForTimeout(500);

    // ===== 3. CONTEXT STEP =====
    await snap(page, "04-context-step");
    await page.locator("button:has-text('Continue')").click();
    await page.waitForTimeout(500);

    // ===== 4. INTAKE STEP =====
    await snap(page, "05-intake-empty");
    await expect(page.locator("text=Where does your time go")).toBeVisible();

    // Fill category estimates — need at least 3 (MIN_CATEGORIES=3)
    const categoryInputs = page.locator('input[type="number"]');
    const catCount = await categoryInputs.count();
    const catValues = [6, 4, 3, 2, 1.5, 1, 0.5];
    for (let i = 0; i < Math.min(catCount, catValues.length); i++) {
      const input = categoryInputs.nth(i);
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(String(catValues[i]));
        await page.waitForTimeout(150);
      }
    }
    await snap(page, "06-intake-filled");

    // Verify single sticky counter while scrolling
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(400);
    await snapViewport(page, "07-intake-sticky-counter");

    // Click "See what's eating your week"
    const seeWeekBtn = page.locator("button:has-text('See what')");
    if (await seeWeekBtn.isEnabled({ timeout: 2000 })) {
      await seeWeekBtn.click();
      await page.waitForTimeout(800);
    }

    // ===== 5. DRILLDOWN STEP =====
    await snap(page, "08-drilldown-empty");

    // Groups are now collapsible — expand every group header first.
    const headers = page.locator('button[aria-expanded]');
    const headerCount = await headers.count();
    for (let i = 0; i < headerCount; i++) {
      const h = headers.nth(i);
      if ((await h.getAttribute("aria-expanded")) === "false") {
        await h.click({ force: true }).catch(() => {});
        await page.waitForTimeout(120);
      }
    }

    // Select drains by clicking their rows (the checkbox is now sr-only).
    const drainRows = page.locator('label:has(input[type="checkbox"])');
    const cbCount = await drainRows.count();
    for (let i = 0; i < Math.min(cbCount, 5); i++) {
      await drainRows.nth(i).click({ force: true }).catch(() => {});
      await page.waitForTimeout(150);
    }

    const hourInputs = page.locator('input[aria-label*="Hours per week"]');
    const hourCount = await hourInputs.count();
    const hourValues = [2, 1.5, 1, 0.75, 0.5];
    for (let i = 0; i < Math.min(hourCount, hourValues.length); i++) {
      const input = hourInputs.nth(i);
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(String(hourValues[i]));
        await page.waitForTimeout(150);
      }
    }
    await snap(page, "09-drilldown-filled");

    // Verify single sticky counter
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(400);
    await snapViewport(page, "10-drilldown-sticky-counter");

    // Test overflow: set a value that exceeds category estimate
    const firstHourInput = hourInputs.first();
    if (await firstHourInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await firstHourInput.fill("25");
      await page.waitForTimeout(500);
      await snap(page, "11-drilldown-overflow-warning");

      // Scroll to bottom to show disabled button
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await snapViewport(page, "12-drilldown-overflow-button");

      // Reset to valid value
      await firstHourInput.fill("2");
      await page.waitForTimeout(300);
    }

    // Click "Show me the damage"
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const damageBtn = page.locator("button:has-text('Show me the damage')");
    if (await damageBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      if (await damageBtn.isEnabled()) {
        await damageBtn.click();
        await page.waitForTimeout(2000); // Extra time for chart to render
      }
    }

    // ===== 6. RESULTS VIEW =====
    await snap(page, "13-results-top");
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await snapViewport(page, "14-results-chart-area");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await snap(page, "15-results-bottom");

    // ===== 7. FOCUS TOOL =====
    await page.goto("/focus");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // SolutionPicker — Assign Fixes tab
    await snap(page, "16-focus-assign-fixes-top");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await snap(page, "17-focus-assign-fixes-bottom");

    // Select solutions using aria-pressed buttons
    const solutionBtns = page.locator('button[aria-pressed="false"]');
    const solCount = await solutionBtns.count();
    for (let i = 0; i < Math.min(solCount, 4); i++) {
      const btn = solutionBtns.nth(0); // Always click first unselected (list shifts)
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await snap(page, "18-focus-solutions-selected");

    // "Add your own fix" inline input — scroll to find one
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    await snapViewport(page, "19-focus-add-your-own-fix");

    // Build action plan button
    const buildPlanBtn = page.locator("button:has-text('Build your action plan')");
    if (await buildPlanBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await buildPlanBtn.isEnabled()) {
        await buildPlanBtn.click();
        await page.waitForTimeout(800);
      }
    }

    // Action Plan tab
    const actionTab = page.locator('role=tab[name*="Action Plan"]');
    if (await actionTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await actionTab.click();
      await page.waitForTimeout(800);

      // Dots start blank — rate the first few fixes (effort 2 / impact 4) so the
      // payoff computes and the surfaced reclaim numbers actually render.
      const effortGroups = page.locator('[aria-label^="Effort rating"]');
      const impactGroups = page.locator('[aria-label^="Impact rating"]');
      const rateN = Math.min(await effortGroups.count(), 3);
      for (let i = 0; i < rateN; i++) {
        await effortGroups.nth(i).locator("button").nth(1).click({ force: true }).catch(() => {});
        await impactGroups.nth(i).locator("button").nth(3).click({ force: true }).catch(() => {});
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await snap(page, "20-focus-action-plan");
    }

    // EVI Matrix tab
    const eviTab = page.locator('role=tab[name*="EVI"]');
    if (await eviTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await eviTab.click();
      await page.waitForTimeout(1000);
      await snap(page, "21-focus-evi-matrix");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await snap(page, "22-focus-evi-action-sequence");
    }

    // Payoff tab
    const payoffTab = page.locator('role=tab[name*="Payoff"], role=tab[name*="Impact"]');
    if (await payoffTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await payoffTab.click();
      await page.waitForTimeout(800);
      await snap(page, "23-focus-payoff-top");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await snap(page, "24-focus-payoff-bottom");
    }

    expect(true).toBe(true);
  });
});
