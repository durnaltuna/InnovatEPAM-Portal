import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'admin@portal.local';
const ADMIN_PASSWORD = 'admin123';
const SUBMITTER_EMAIL = 'submitter@portal.local';
const SUBMITTER_PASSWORD = 'submit123';

test.describe('Admin Decision Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[id="email"]', ADMIN_EMAIL);
    await page.fill('input[id="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/app/admin`);
  });

  test('admin can move idea from Submitted to Under Review', async ({ page, context }) => {
    // First, create an idea as a submitter
    const submitterPage = await context.newPage();
    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    // Submit an idea
    await submitterPage.fill('input[id="title"]', 'Review Me Idea');
    await submitterPage.fill('textarea[id="description"]', 'Please review this idea');
    await submitterPage.selectOption('select[id="category"]', 'Technology');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Review Me Idea');
    await submitterPage.close();

    // Admin views the idea in the review table
    await page.reload();
    await page.waitForSelector('text=Review Me Idea', { timeout: 5000 });

    // Click the action button for the idea
    const ideaRow = page.locator('text=Review Me Idea').first();
    await ideaRow.locator('button:has-text("Review")').click();

    // Select Under Review action
    await page.selectOption('select[id="decision"]', 'Under Review');
    await page.click('button:has-text("Confirm")');

    // Verify the idea status updated
    await page.waitForSelector('text=Under Review', { timeout: 5000 });
    expect(await page.locator('text=Under Review').isVisible()).toBe(true);
  });

  test('admin can accept idea from Under Review with required comment', async ({ page, context }) => {
    // Setup: create and move idea to Under Review
    const submitterPage = await context.newPage();
    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    await submitterPage.fill('input[id="title"]', 'Accept Me Idea');
    await submitterPage.fill('textarea[id="description"]', 'Please accept this');
    await submitterPage.selectOption('select[id="category"]', 'Process');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Accept Me Idea');
    await submitterPage.close();

    // Admin reviews and accepts
    await page.reload();
    await page.waitForSelector('text=Accept Me Idea', { timeout: 5000 });

    const ideaRow = page.locator('text=Accept Me Idea').first();
    await ideaRow.locator('button:has-text("Review")').click();
    await page.selectOption('select[id="decision"]', 'Under Review');
    await page.click('button:has-text("Confirm")');
    await page.waitForSelector('text=Under Review');

    // Now accept from Under Review
    await ideaRow.locator('button:has-text("Decide")').click();
    await page.selectOption('select[id="decision"]', 'Accepted');
    await page.fill('textarea[id="comment"]', 'Excellent innovation! Approved for implementation.');
    await page.click('button:has-text("Confirm")');

    // Verify accepted status
    await page.waitForSelector('text=Accepted', { timeout: 5000 });
    expect(await page.locator('text=Accepted').isVisible()).toBe(true);
  });

  test('admin can reject idea from Under Review with required comment', async ({ page, context }) => {
    // Setup: create and move idea to Under Review
    const submitterPage = await context.newPage();
    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    await submitterPage.fill('input[id="title"]', 'Reject Me Idea');
    await submitterPage.fill('textarea[id="description"]', 'This might be rejected');
    await submitterPage.selectOption('select[id="category"]', 'Other');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Reject Me Idea');
    await submitterPage.close();

    // Admin reviews
    await page.reload();
    await page.waitForSelector('text=Reject Me Idea', { timeout: 5000 });

    const ideaRow = page.locator('text=Reject Me Idea').first();
    await ideaRow.locator('button:has-text("Review")').click();
    await page.selectOption('select[id="decision"]', 'Under Review');
    await page.click('button:has-text("Confirm")');
    await page.waitForSelector('text=Under Review');

    // Now reject from Under Review
    await ideaRow.locator('button:has-text("Decide")').click();
    await page.selectOption('select[id="decision"]', 'Rejected');
    await page.fill('textarea[id="comment"]', 'Does not align with current strategy.');
    await page.click('button:has-text("Confirm")');

    // Verify rejected status
    await page.waitForSelector('text=Rejected', { timeout: 5000 });
    expect(await page.locator('text=Rejected').isVisible()).toBe(true);
  });

  test('admin cannot skip Under Review when accepting from Submitted', async ({
    page,
    context
  }) => {
    // Setup: create idea
    const submitterPage = await context.newPage();
    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    await submitterPage.fill('input[id="title"]', 'Cannot Skip Review');
    await submitterPage.fill('textarea[id="description"]', 'Must go through review');
    await submitterPage.selectOption('select[id="category"]', 'Technology');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Cannot Skip Review');
    await submitterPage.close();

    // Admin tries to accept directly
    await page.reload();
    await page.waitForSelector('text=Cannot Skip Review', { timeout: 5000 });

    const ideaRow = page.locator('text=Cannot Skip Review').first();
    await ideaRow.locator('button:has-text("Review")').click();

    // Verify only Under Review is available option
    const decisionSelect = page.locator('select[id="decision"]');
    const options = await decisionSelect.locator('option').allTextContents();
    expect(options).toContain('Under Review');
    expect(options).not.toContain('Accepted');
    expect(options).not.toContain('Rejected');
  });

  test('admin must provide comment when accepting or rejecting', async ({ page, context }) => {
    // Setup
    const submitterPage = await context.newPage();
    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    await submitterPage.fill('input[id="title"]', 'Comment Required');
    await submitterPage.fill('textarea[id="description"]', 'Need a comment');
    await submitterPage.selectOption('select[id="category"]', 'Technology');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Comment Required');
    await submitterPage.close();

    // Admin reviews and moves to Under Review
    await page.reload();
    await page.waitForSelector('text=Comment Required', { timeout: 5000 });

    const ideaRow = page.locator('text=Comment Required').first();
    await ideaRow.locator('button:has-text("Review")').click();
    await page.selectOption('select[id="decision"]', 'Under Review');
    await page.click('button:has-text("Confirm")');
    await page.waitForSelector('text=Under Review');

    // Try to accept without comment
    await ideaRow.locator('button:has-text("Decide")').click();
    await page.selectOption('select[id="decision"]', 'Accepted');

    const submitButton = page.locator('button:has-text("Confirm")');
    // Button should be disabled or action should fail
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      // Should fail with error message
      await page.waitForSelector('text=comment.*required', { timeout: 5000 });
    }
  });
});
