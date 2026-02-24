import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'admin@portal.local';
const ADMIN_PASSWORD = 'admin123';
const SUBMITTER_EMAIL = 'submitter@portal.local';
const SUBMITTER_PASSWORD = 'submit123';

test.describe('Auth - Login and Logout Flow', () => {
  test('submitter can login and access protected area', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    expect(page).toHaveURL(`${BASE_URL}/login`);

    // Fill login form
    await page.fill('input[id="email"]', SUBMITTER_EMAIL);
    await page.fill('input[id="password"]', SUBMITTER_PASSWORD);

    // Submit login
    await page.click('button:has-text("Login")');

    // Should redirect to /app and show My Ideas
    await page.waitForURL(`${BASE_URL}/app`);
    expect(page).toHaveURL(`${BASE_URL}/app`);
    await expect(page.locator('h1:has-text("InnovatEPAM Portal")')).toBeVisible();
    await expect(page.locator('text=My Ideas')).toBeVisible();
    await expect(page.locator(`text=Signed in as.*${SUBMITTER_EMAIL}`)).toBeVisible();
  });

  test('admin can login and see admin link', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);

    // Fill login form with admin credentials
    await page.fill('input[id="email"]', ADMIN_EMAIL);
    await page.fill('input[id="password"]', ADMIN_PASSWORD);

    // Submit login
    await page.click('button:has-text("Login")');

    // Should redirect to /app and show admin link (admins have access to admin area)
    await page.waitForURL(`${BASE_URL}/app`);
    await expect(page.locator('a:has-text("Admin")')).toBeVisible();
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[id="email"]', SUBMITTER_EMAIL);
    await page.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await page.click('button:has-text("Login")');

    // Wait for protected area to load
    await page.waitForURL(`${BASE_URL}/app`);
    await expect(page.locator('text=My Ideas')).toBeVisible();

    // Click logout button
    await page.click('button:has-text("Logout")');

    // Should redirect to login page
    await page.waitForURL(`${BASE_URL}/login`);
    expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('accessing protected route without login redirects to login', async ({ page }) => {
    // Try to access /app directly without login
    await page.goto(`${BASE_URL}/app`);

    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`);
    expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('invalid credentials show error message', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);

    // Fill login form with invalid credentials
    await page.fill('input[id="email"]', 'wrong@portal.local');
    await page.fill('input[id="password"]', 'wrongpassword');

    // Submit login
    await page.click('button:has-text("Login")');

    // Should show error message and stay on login page
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('login session persists across page reload', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[id="email"]', SUBMITTER_EMAIL);
    await page.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/app`);

    // Reload page
    await page.reload();

    // Should still be in protected area and logged in
    expect(page).toHaveURL(`${BASE_URL}/app`);
    await expect(page.locator(`text=Signed in as.*${SUBMITTER_EMAIL}`)).toBeVisible();
  });
});
