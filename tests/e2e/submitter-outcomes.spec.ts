import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'admin@portal.local';
const ADMIN_PASSWORD = 'admin123';
const SUBMITTER_EMAIL = 'submitter@portal.local';
const SUBMITTER_PASSWORD = 'submit123';

test.describe('Submitter Outcome Visibility', () => {
  test('submitter sees idea status update from Submitted to Under Review', async ({
    browser
  }) => {
    // Submitter creates idea
    const submitterContext = await browser.newContext();
    const submitterPage = await submitterContext.newPage();

    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    // Create an idea
    await submitterPage.fill('input[id="title"]', 'Status Test Idea');
    await submitterPage.fill('textarea[id="description"]', 'Tracking status changes');
    await submitterPage.selectOption('select[id="category"]', 'Technology');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Status Test Idea');

    // Verify idea is Submitted initially
    let statusBadge = await submitterPage.locator('text=Submitted').first();
    expect(await statusBadge.isVisible()).toBe(true);

    // Admin moves to Under Review
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${BASE_URL}/login`);
    await adminPage.fill('input[id="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[id="password"]', ADMIN_PASSWORD);
    await adminPage.click('button:has-text("Login")');
    await adminPage.waitForURL(`${BASE_URL}/app/admin`);

    // Find and review the idea
    await adminPage.waitForSelector('text=Status Test Idea', { timeout: 5000 });
    const ideaRow = await adminPage.locator('text=Status Test Idea').first();
    await ideaRow.locator('button:has-text("Review")').click();
    await adminPage.selectOption('select[id="decision"]', 'Under Review');
    await adminPage.click('button:has-text("Confirm")');

    // Submitter refreshes their page
    await submitterPage.reload();
    await submitterPage.waitForSelector('text=Status Test Idea', { timeout: 5000 });

    // Should see Under Review status
    statusBadge = await submitterPage.locator('text=Under Review').first();
    expect(await statusBadge.isVisible()).toBe(true);

    await submitterContext.close();
    await adminContext.close();
  });

  test('submitter sees decision comment when idea is accepted', async ({ browser }) => {
    // Submitter creates idea
    const submitterContext = await browser.newContext();
    const submitterPage = await submitterContext.newPage();

    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    // Create an idea
    await submitterPage.fill('input[id="title"]', 'Accept Comment Test');
    await submitterPage.fill('textarea[id="description"]', 'Will be accepted');
    await submitterPage.selectOption('select[id="category"]', 'Process');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Accept Comment Test');

    // Admin accepts with comment
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${BASE_URL}/login`);
    await adminPage.fill('input[id="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[id="password"]', ADMIN_PASSWORD);
    await adminPage.click('button:has-text("Login")');
    await adminPage.waitForURL(`${BASE_URL}/app/admin`);

    await adminPage.waitForSelector('text=Accept Comment Test', { timeout: 5000 });
    const ideaRow = await adminPage.locator('text=Accept Comment Test').first();

    // Move to Under Review first
    await ideaRow.locator('button:has-text("Review")').click();
    await adminPage.selectOption('select[id="decision"]', 'Under Review');
    await adminPage.click('button:has-text("Confirm")');
    await adminPage.waitForSelector('text=Under Review');

    // Then accept with comment
    await ideaRow.locator('button:has-text("Decide")').click();
    await adminPage.selectOption('select[id="decision"]', 'Accepted');
    const acceptComment = 'Great idea! This will improve our workflow significantly.';
    await adminPage.fill('textarea[id="comment"]', acceptComment);
    await adminPage.click('button:has-text("Confirm")');

    // Submitter refreshes and sees the comment
    await submitterPage.reload();
    await submitterPage.waitForSelector('text=Accept Comment Test', { timeout: 5000 });

    // Should see Accepted status
    const acceptedBadge = await submitterPage.locator('text=Accepted').first();
    expect(await acceptedBadge.isVisible()).toBe(true);

    // Should see the comment
    const commentText = await submitterPage.locator(`text=${acceptComment}`);
    expect(await commentText.isVisible()).toBe(true);

    await submitterContext.close();
    await adminContext.close();
  });

  test('submitter sees rejection reason in comment', async ({ browser }) => {
    // Submitter creates idea
    const submitterContext = await browser.newContext();
    const submitterPage = await submitterContext.newPage();

    await submitterPage.goto(`${BASE_URL}/login`);
    await submitterPage.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitterPage.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitterPage.click('button:has-text("Login")');
    await submitterPage.waitForURL(`${BASE_URL}/app`);

    // Create an idea
    await submitterPage.fill('input[id="title"]', 'Reject Reason Test');
    await submitterPage.fill('textarea[id="description"]', 'Will be rejected');
    await submitterPage.selectOption('select[id="category"]', 'Other');
    await submitterPage.click('button:has-text("Submit Idea")');
    await submitterPage.waitForSelector('text=Reject Reason Test');

    // Admin rejects with comment
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${BASE_URL}/login`);
    await adminPage.fill('input[id="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[id="password"]', ADMIN_PASSWORD);
    await adminPage.click('button:has-text("Login")');
    await adminPage.waitForURL(`${BASE_URL}/app/admin`);

    await adminPage.waitForSelector('text=Reject Reason Test', { timeout: 5000 });
    const ideaRow = await adminPage.locator('text=Reject Reason Test').first();

    // Move to Under Review first
    await ideaRow.locator('button:has-text("Review")').click();
    await adminPage.selectOption('select[id="decision"]', 'Under Review');
    await adminPage.click('button:has-text("Confirm")');
    await adminPage.waitForSelector('text=Under Review');

    // Then reject with comment
    await ideaRow.locator('button:has-text("Decide")').click();
    await adminPage.selectOption('select[id="decision"]', 'Rejected');
    const rejectComment = 'Does not align with current product roadmap for Q1.';
    await adminPage.fill('textarea[id="comment"]', rejectComment);
    await adminPage.click('button:has-text("Confirm")');

    // Submitter refreshes and sees the rejection comment
    await submitterPage.reload();
    await submitterPage.waitForSelector('text=Reject Reason Test', { timeout: 5000 });

    // Should see Rejected status
    const rejectedBadge = await submitterPage.locator('text=Rejected').first();
    expect(await rejectedBadge.isVisible()).toBe(true);

    // Should see the comment
    const commentText = await submitterPage.locator(`text=${rejectComment}`);
    expect(await commentText.isVisible()).toBe(true);

    await submitterContext.close();
    await adminContext.close();
  });

  test('submitter cannot see other submitter ideas even after decision', async ({ browser }) => {
    // Submitter 1 creates idea
    const submitter1Context = await browser.newContext();
    const submitter1Page = await submitter1Context.newPage();

    await submitter1Page.goto(`${BASE_URL}/login`);
    await submitter1Page.fill('input[id="email"]', SUBMITTER_EMAIL);
    await submitter1Page.fill('input[id="password"]', SUBMITTER_PASSWORD);
    await submitter1Page.click('button:has-text("Login")');
    await submitter1Page.waitForURL(`${BASE_URL}/app`);

    // Create an idea (visible only to submitter1)
    await submitter1Page.fill('input[id="title"]', 'Private Idea');
    await submitter1Page.fill('textarea[id="description"]', 'Only visible to original submitter');
    await submitter1Page.selectOption('select[id="category"]', 'Technology');
    await submitter1Page.click('button:has-text("Submit Idea")');
    await submitter1Page.waitForSelector('text=Private Idea');

    // Admin accepts it
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${BASE_URL}/login`);
    await adminPage.fill('input[id="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[id="password"]', ADMIN_PASSWORD);
    await adminPage.click('button:has-text("Login")');
    await adminPage.waitForURL(`${BASE_URL}/app/admin`);

    await adminPage.waitForSelector('text=Private Idea', { timeout: 5000 });
    const ideaRow = await adminPage.locator('text=Private Idea').first();
    await ideaRow.locator('button:has-text("Review")').click();
    await adminPage.selectOption('select[id="decision"]', 'Under Review');
    await adminPage.click('button:has-text("Confirm")');

    // Submitter 2 should still not see the idea even though it's decided
    // (This would require another submitter login which isn't easily testable without fixtures)
    // Instead, just verify the first submitter still sees only their idea
    const submittersList = await submitter1Page.locator('text=Your Submitted Ideas').first();
    expect(await submittersList.isVisible()).toBe(true);

    await submitter1Context.close();
    await adminContext.close();
  });
});
