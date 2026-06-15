import { test, expect } from '@playwright/test';

test.describe('DineFlow Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=DineFlow').first()).toBeVisible({ timeout: 10000 });
  });

  test('login page shows form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('register page shows role selector', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('button:has-text("Customer")')).toBeVisible();
    await expect(page.locator('button:has-text("Staff")')).toBeVisible();
    await expect(page.locator('button:has-text("Owner")')).toBeVisible();
  });

  test('redirects to login when accessing protected route', async ({ page }) => {
    await page.goto('/customer');
    await page.waitForURL('/login');
  });

  test('redirects to login when accessing staff route', async ({ page }) => {
    await page.goto('/staff');
    await page.waitForURL('/login');
  });
});
