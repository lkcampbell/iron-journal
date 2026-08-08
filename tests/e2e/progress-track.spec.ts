import { expect, test } from '@playwright/test';

// Covers the progress-track box-marking work: clicking a box advances its state and the
// change survives a reload (autosaves to IndexedDB on a 1s debounce - see src/App.vue).
test('marking a progress track box persists after reload', async ({ page }) => {
  await page.goto('/');

  const firstBox = page.getByTestId('bonds-track').getByTestId('track-box').first();
  const icon = firstBox.locator('i');
  await expect(icon).toHaveClass(/mdi-checkbox-blank-outline/);

  await firstBox.click();
  await expect(icon).toHaveClass(/mdi-slash-forward/);

  // Let the debounced autosave (1000ms) flush before reloading.
  await page.waitForTimeout(1500);
  await page.reload();

  await expect(page.getByTestId('bonds-track').getByTestId('track-box').first().locator('i')).toHaveClass(
    /mdi-slash-forward/
  );
});
