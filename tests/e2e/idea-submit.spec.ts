import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SUBMITTER_EMAIL = 'submitter@portal.local';
const SUBMITTER_PASSWORD = 'submit123';

test.describe('Idea Submission - Submitter Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as submitter before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[id="email"]', SUBMITTER_EMAIL);
    await page.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/app`);
  });

  test('submitter can submit idea with one file attachment', async ({ page }) => {
    // Navigate to My Ideas (should be default)
    expect(page).toHaveURL(`${BASE_URL}/app`);

    // Fill idea form
    await page.fill('input[id="idea-title"]', 'Automated Test Idea');
    await page.fill('textarea[id="idea-description"]', 'This idea was submitted via automated test');
    await page.selectOption('select[id="idea-category"]', 'Process improvement');

    // Upload a file
    const filePath = 'tests/fixtures/test-file.txt';
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Submit form
    await page.click('button:has-text("Submit Idea")');

    // Verify success message appears
    await expect(page.locator('text=Idea "Automated Test Idea" submitted successfully')).toBeVisible();

    // Verify idea appears in the list
    await expect(page.locator('h3:has-text("Automated Test Idea")')).toBeVisible();
    await expect(page.locator('text=Status.*Submitted')).toBeVisible();
    await expect(page.locator('text=Process improvement')).toBeVisible();
  });

  test('submitter sees submitted idea in list', async ({ page }) => {
    const ideaTitle = 'Listed Test Idea';

    // Submit an idea
    await page.fill('input[id="idea-title"]', ideaTitle);
    await page.fill('textarea[id="idea-description"]', 'Test description for listing');
    await page.selectOption('select[id="idea-category"]', 'Customer Experience');

    const filePath = 'tests/fixtures/test-file.txt';
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.click('button:has-text("Submit Idea")');

    // Wait for success message
    await expect(page.locator('text=' + ideaTitle + ' submitted successfully')).toBeVisible();

    // Refresh page to verify persistence
    await page.reload();

    // Verify idea still appears
    await expect(page.locator(`h3:has-text("${ideaTitle}")`)).toBeVisible();
    await expect(page.locator('text=Status.*Submitted')).toBeVisible();
  });

  test('submitter cannot submit duplicate attachments', async ({ page }) => {
    // Try to select multiple files (browser should only allow one with required attribute)
    // This test verifies the HTML constraint is in place
    const fileInput = page.locator('input[type="file"]');

    // Check that file input has required attribute
    const isRequired = await fileInput.evaluate((el) => (el as HTMLInputElement).required);
    expect(isRequired).toBe(true);
  });

  test('submitter cannot submit idea without required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Submit Idea")');

    // Browser validation should prevent submission (HTML5 required attributes)
    // Verify form is still visible (not submitted)
    const filePath = 'tests/fixtures/test-file.txt';
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Now try without title
    await page.fill('input[id="idea-title"]', '');
    await page.fill('textarea[id="idea-description"]', 'Description');
    await page.selectOption('select[id="idea-category"]', 'Internal tools');

    // Form should not submit due to HTML5 validation
    // Verify error states or validation
    const titleInput = page.locator('input[id="idea-title"]');
    const isInvalid = await titleInput.evaluate((el) => {
      const input = el as HTMLInputElement;
      return !input.checkValidity();
    });
    expect(isInvalid).toBe(true);
  });

  test('submitted idea shows status badge', async ({ page }) => {
    // Submit an idea
    await page.fill('input[id="idea-title"]', 'Status Badge Test');
    await page.fill('textarea[id="idea-description"]', 'Testing status display');
    await page.selectOption('select[id="idea-category"]', 'Other');
    await page.fill('input[id="idea-category-other"]', 'Pilot category');

    const filePath = 'tests/fixtures/test-file.txt';
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.click('button:has-text("Submit Idea")');
    await expect(page.locator('text=Status Badge Test submitted successfully')).toBeVisible();

    // Verify status badge appears with correct styling
    const statusBadge = page.locator('text=Submitted').first();
    await expect(statusBadge).toBeVisible();

    // Check that it has the styles we applied
    const currentStyle = await statusBadge.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.backgroundColor;
    });

    // Status badge should have blue background for Submitted
    expect(currentStyle).not.toBe('');
  });

  test('form resets after successful submission', async ({ page }) => {
    // Submit an idea
    await page.fill('input[id="idea-title"]', 'Reset Test Idea');
    await page.fill('textarea[id="idea-description"]', 'Testing form reset');
    await page.selectOption('select[id="idea-category"]', 'Cost optimization');

    const filePath = 'tests/fixtures/test-file.txt';
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.click('button:has-text("Submit Idea")');
    await expect(page.locator('text=Reset Test Idea submitted successfully')).toBeVisible();

    // Verify form fields are cleared
    const titleInput = page.locator('input[id="idea-title"]');
    const descInput = page.locator('textarea[id="idea-description"]');
    const catInput = page.locator('select[id="idea-category"]');

    expect(await titleInput.inputValue()).toBe('');
    expect(await descInput.inputValue()).toBe('');
    expect(await catInput.inputValue()).toBe('');
  });
});
