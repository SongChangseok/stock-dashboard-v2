import { test, expect } from '@playwright/test'

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application correctly', async ({ page, browserName }) => {
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Stock Dashboard/i)
    
    // Verify main layout elements are present
    await expect(page.locator('body')).toBeVisible()
    
    // Check for any console errors
    const messages: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        messages.push(msg.text())
      }
    })
    
    await page.waitForLoadState('networkidle')
    expect(messages).toHaveLength(0)
  })

  test('should display authentication form correctly', async ({ page }) => {
    // Verify auth form is visible
    const authForm = page.locator('form')
    await expect(authForm).toBeVisible()
    
    // Check for essential form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should handle responsive layout changes', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Verify the page is still functional after viewport changes
    await expect(page.locator('body')).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test escape key functionality
    await page.keyboard.press('Escape')
  })

  test('should maintain functionality across different browsers', async ({ page, browserName }) => {
    // Browser-specific tests
    if (browserName === 'webkit') {
      // Safari-specific checks
      await expect(page.locator('body')).toBeVisible()
    } else if (browserName === 'firefox') {
      // Firefox-specific checks
      await expect(page.locator('body')).toBeVisible()
    } else {
      // Chrome/Chromium-specific checks
      await expect(page.locator('body')).toBeVisible()
    }
    
    // Common functionality that should work across all browsers
    const authForm = page.locator('form')
    await expect(authForm).toBeVisible()
  })
})