/**
 * CSV Export — functional download test
 *
 * Drives the full wizard to the EVI Matrix tab, sets an owner + due date on an
 * action item, clicks "Export to ClickUp / Monday", captures the real browser
 * download, and verifies the CSV file actually contains the right columns + data.
 *
 * Run: npx playwright test e2e/csv-export.spec.ts
 */

import { test, expect } from "@playwright/test";
import fs from "fs";

test.describe("Action Sequence — CSV export", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("export button downloads a valid action-plan CSV", async ({ page }) => {
    test.setTimeout(120000);

    // ---- Role step ----
    await page.goto("/analyzer");
    await page.waitForLoadState("networkidle");
    await page.locator("text=Marketing").first().click();
    await page.waitForTimeout(400);
    const managerLevel = page.locator("text=Manager").first();
    if (await managerLevel.isVisible({ timeout: 2000 }).catch(() => false)) {
      await managerLevel.click();
      await page.waitForTimeout(300);
    }
    await page.locator("button:has-text('Continue')").click();
    await page.waitForTimeout(500);

    // ---- Context step ----
    await page.locator("button:has-text('Continue')").click();
    await page.waitForTimeout(500);

    // ---- Log step: tap ≥6 drains, size them with the +/- stepper ----
    await expect(page.getByRole("heading", { name: "Log your waste" })).toBeVisible();
    const chips = page.locator('[data-testid="drain-chip"]');
    const chipCount = await chips.count();
    for (let i = 0; i < Math.min(chipCount, 6); i++) {
      await chips.nth(i).click({ force: true }).catch(() => {});
      await page.waitForTimeout(120);
    }
    const plusBtns = page.locator('button[aria-label^="More time on"]');
    const hourValues = [5, 3, 2, 1.5, 1, 0.5];
    for (let i = 0; i < Math.min(await plusBtns.count(), hourValues.length); i++) {
      const clicks = Math.round(hourValues[i] / 0.5);
      for (let c = 0; c < clicks; c++) {
        await plusBtns.nth(i).click({ force: true }).catch(() => {});
      }
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const computeBtn = page.locator("button:has-text('See what')");
    await expect(computeBtn).toBeEnabled();
    await computeBtn.click();
    await page.waitForTimeout(4500); // dramatic reveal + chart render

    // ---- Focus tool: pick fixes ----
    await page.goto("/focus");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const solutionBtns = page.locator('button[aria-pressed="false"]');
    for (let i = 0; i < Math.min(await solutionBtns.count(), 4); i++) {
      const btn = solutionBtns.nth(0); // list shifts as items get selected
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(250);
      }
    }
    const buildPlanBtn = page.locator("button:has-text('Build your action plan')");
    if (await buildPlanBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await buildPlanBtn.isEnabled()) {
        await buildPlanBtn.click();
        await page.waitForTimeout(800);
      }
    }

    // ---- Action Plan tab: rate a few so the matrix populates ----
    const actionTab = page.locator('role=tab[name*="Action Plan"]');
    if (await actionTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await actionTab.click();
      await page.waitForTimeout(800);
      const effortGroups = page.locator('[aria-label^="Effort rating"]');
      const impactGroups = page.locator('[aria-label^="Impact rating"]');
      const rateN = Math.min(await effortGroups.count(), 3);
      for (let i = 0; i < rateN; i++) {
        await effortGroups.nth(i).locator("button").nth(1).click({ force: true }).catch(() => {});
        await impactGroups.nth(i).locator("button").nth(3).click({ force: true }).catch(() => {});
        await page.waitForTimeout(120);
      }
    }

    // ---- EVI Matrix tab ----
    const eviTab = page.locator('role=tab[name*="EVI"]');
    await expect(eviTab).toBeVisible({ timeout: 4000 });
    await eviTab.click();
    await page.waitForTimeout(1000);

    // Confirm the Action Sequence rendered with at least one card.
    const cards = page.locator('[data-testid="action-card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Set a due date on the first card so the Due Date column is exercised.
    const firstTitle = (await cards.first().locator("span").first().textContent()) || "";
    const dueInput = cards.first().locator('input[type="date"]');
    await dueInput.fill("2026-07-15");
    await page.waitForTimeout(200);

    // ---- Click Export, capture the real download ----
    const exportBtn = page.locator('button:has-text("Export to ClickUp")');
    await expect(exportBtn).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await exportBtn.click();
    const download = await downloadPromise;

    // Filename is what we asked for.
    expect(download.suggestedFilename()).toBe("focuslab-action-plan.csv");

    // Read the actual bytes off disk.
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    const raw = fs.readFileSync(filePath!, "utf8");

    // Has the UTF-8 BOM (so Excel opens it cleanly).
    expect(raw.charCodeAt(0)).toBe(0xfeff);
    const content = raw.replace(/^﻿/, "");
    const lines = content.split("\r\n").filter((l) => l.length > 0);

    // Header row, exact columns.
    expect(lines[0]).toBe(
      '"Priority","Task Name","Owner","Due Date","Status","Notes"',
    );

    // One data row per action card.
    expect(lines.length - 1).toBe(cardCount);

    // The due date we set shows up in the file.
    expect(content).toContain("2026-07-15");

    // A real status from the matrix is present.
    expect(/"(Pearls|Oysters|Low-Hanging Fruit|White Elephants)"/.test(content)).toBe(true);

    // The first card's task title is in the CSV (quote-escaped).
    const titleCore = firstTitle.replace(/"/g, "").trim().slice(0, 12);
    if (titleCore) expect(content).toContain(titleCore);
  });
});
