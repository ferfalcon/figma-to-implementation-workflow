import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('navigation connects both pages and identifies the current page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/A small start\.\s*An open horizon\./);
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await navigation.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(navigation.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'Back to home' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('dialog supports opening, Escape, focus restoration, and its close button', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open a note' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Start with one good idea.' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close note' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: 'Close note' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('pages load local assets, avoid horizontal overflow, and pass automated accessibility checks', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/about/']) {
    await page.goto(route);
    await expect(page.getByRole('main')).toBeVisible();
    const measurements = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      images: [...document.images].map(image => ({
        loaded: image.complete && image.naturalWidth > 0,
        local: new URL(image.src).origin === location.origin,
      })),
    }));
    expect(measurements.content).toBeLessThanOrEqual(measurements.viewport);
    expect(measurements.images.every(image => image.loaded && image.local)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('keyboard users can skip to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});
