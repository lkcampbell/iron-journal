import { expect, test } from '@playwright/test';

// Covers the "Insert Move"/"Fix Move Insert in the wrong place" commit series: rolling a
// move outcome must land the correctly formatted note in journal entry 0.
test('rolling a move outcome inserts a formatted note into the journal', async ({ page }) => {
  await page.goto('/');

  // The right drawer (Oracles/Moves/Journal) is open by default on desktop widths.
  await page.getByText('MOVES', { exact: true }).click();

  const move = page.getByTestId('move-Face Danger');
  await move.click();
  await move.getByText('Edge', { exact: true }).click();
  await move.getByTestId('move-roll-btn').click();

  // Weak Hit outcomes require picking a choice before Save is enabled; Strong Hit/Miss don't.
  const choice = move.locator('.q-radio').first();
  if (await choice.isVisible().catch(() => false)) {
    await choice.click();
  }

  const saveBtn = move.getByTestId('move-save-btn');
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();

  const entryContent = page.getByTestId('journal-entry-0').getByTestId('journal-entry-editor').locator('[contenteditable]');
  await expect(entryContent).toContainText('Adventure Moves::Face Danger');
});
