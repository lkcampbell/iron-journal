import { expect, test } from '@playwright/test';

// Covers the "Journal insertion update"/"Add insert into journal functionality" commits:
// creating an entry, retitling it, and typing into its editor.
test('creating a journal entry allows setting a title and typing content', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('journal-add-btn').click();

  // New entries are unshifted to index 0 and auto-expanded.
  const entry = page.getByTestId('journal-entry-0');
  const title = entry.getByTestId('journal-entry-title');
  await expect(title).toHaveValue('New journal entry');

  await title.fill('E2E Test Entry');
  await expect(title).toHaveValue('E2E Test Entry');

  const content = entry.getByTestId('journal-entry-editor').locator('[contenteditable]');
  await content.click();
  await page.keyboard.type('Hello from Playwright');
  await expect(content).toContainText('Hello from Playwright');
});
