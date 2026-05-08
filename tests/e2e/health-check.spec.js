import { test, expect } from '@playwright/test';

/**
 * Basic Health Check Tests
 * Verify Playwright and application setup are working correctly
 */

test.describe('Health Check Tests', () => {
  test('should have Playwright running', async ({ page }) => {
    // This test simply verifies that Playwright can navigate to the app
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      expect(page).toBeDefined();
    } catch (error) {
      // If this fails, check if the app is running
      console.error('Failed to reach localhost:3000. Make sure frontend is running: npm run start:frontend');
      throw error;
    }
  });

  test('should verify backend API is running', async ({ page }) => {
    // Make direct request to backend health endpoint
    try {
      const response = await page.request.get('http://localhost:3030/');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('ok');
    } catch (error) {
      console.error('Failed to reach localhost:3030. Make sure backend is running: npm run start:backend');
      throw error;
    }
  });
});
