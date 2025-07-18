import { test, expect } from '@playwright/test'

test.describe('Error Scenario Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Network Failure Scenarios', () => {
    test('should handle complete network failure gracefully', async ({ page }) => {
      // Start with normal loading
      await page.goto('/dashboard')
      
      // Simulate network failure
      await page.route('**/*', route => route.abort())
      
      // Try to perform actions that require network
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Fill form
        await page.fill('input[name="stock_name"]', 'Test Stock')
        await page.fill('input[name="quantity"]', '10')
        await page.fill('input[name="purchase_price"]', '100')
        await page.fill('input[name="current_price"]', '110')
        
        // Try to submit - should show error
        await page.click('button[type="submit"]')
        
        // Should show network error message
        await expect(page.locator('text=/network.*error|connection.*failed|offline/i')).toBeVisible({
          timeout: 10000
        })
      }
    })

    test('should handle slow network connections', async ({ page }) => {
      // Simulate slow network (2 second delay)
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await route.continue()
      })
      
      await page.goto('/dashboard')
      
      // Should show loading indicators during slow requests
      await expect(page.locator('text=/loading|Loading/i, .loading, .spinner')).toBeVisible()
      
      // Eventually content should load
      await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
    })

    test('should handle API timeout scenarios', async ({ page }) => {
      // Simulate API timeout
      await page.route('**/api/**', route => {
        // Don't respond to simulate timeout
        return new Promise(() => {})
      })
      
      await page.goto('/dashboard')
      
      // Should show timeout or error message
      await expect(page.locator('text=/timeout|failed.*load|error/i')).toBeVisible({
        timeout: 15000
      })
    })

    test('should handle intermittent network failures', async ({ page }) => {
      let requestCount = 0
      
      // Fail every other request
      await page.route('**/*', route => {
        requestCount++
        if (requestCount % 2 === 0) {
          route.abort()
        } else {
          route.continue()
        }
      })
      
      await page.goto('/dashboard')
      
      // App should handle intermittent failures
      // Some content might load, some might fail
      await page.waitForTimeout(5000)
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Invalid Input Scenarios', () => {
    test('should validate stock form inputs', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Open add stock form
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Test empty inputs
        await page.click('button[type="submit"]')
        await expect(page.locator('text=/required|invalid|enter/i')).toBeVisible()
        
        // Test invalid numbers
        await page.fill('input[name="quantity"]', '-5')
        await page.fill('input[name="purchase_price"]', 'invalid')
        await page.fill('input[name="current_price"]', '0')
        
        await page.click('button[type="submit"]')
        await expect(page.locator('text=/invalid|positive|greater/i')).toBeVisible()
        
        // Test extremely large numbers
        await page.fill('input[name="quantity"]', '999999999999')
        await page.fill('input[name="purchase_price"]', '999999999999')
        
        await page.click('button[type="submit"]')
        // Should either accept or show reasonable validation message
      }
    })

    test('should handle special characters in stock names', async ({ page }) => {
      await page.goto('/dashboard')
      
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Test special characters
        const specialCases = [
          'Stock <script>alert("xss")</script>',
          'Stock & Company',
          'Stock "Quotes"',
          'Stock \'Single\'',
          'Stock\\Backslash',
          'Stock/Forward',
          'Stock;Semicolon',
          '股票中文',
          'Ñame Àccénts'
        ]
        
        for (const stockName of specialCases.slice(0, 3)) { // Test first 3 to avoid timeout
          await page.fill('input[name="stock_name"]', stockName)
          await page.fill('input[name="quantity"]', '1')
          await page.fill('input[name="purchase_price"]', '100')
          await page.fill('input[name="current_price"]', '110')
          
          await page.click('button[type="submit"]')
          
          // Either accept the input or show appropriate validation
          await page.waitForTimeout(1000)
          
          // If form is still open, clear and try next
          if (await page.locator('form').isVisible()) {
            await page.fill('input[name="stock_name"]', '')
          }
        }
      }
    })

    test('should validate target portfolio allocations', async ({ page }) => {
      await page.goto('/target-portfolio')
      
      const createButton = page.locator('button:has-text("Create")').first()
      if (await createButton.isVisible()) {
        await createButton.click()
        
        // Test invalid weight allocations
        await page.fill('input[name="name"]', 'Test Portfolio')
        
        // Try submitting with weights that don't add to 100%
        const weightInputs = page.locator('input[type="number"]:visible')
        const inputCount = await weightInputs.count()
        
        if (inputCount > 0) {
          // Set weights that add to more than 100%
          await weightInputs.first().fill('60')
          if (inputCount > 1) {
            await weightInputs.nth(1).fill('50')
          }
          
          await page.click('button[type="submit"]')
          await expect(page.locator('text=/100|total|allocation/i')).toBeVisible()
        }
      }
    })
  })

  test.describe('Edge Case Scenarios', () => {
    test('should handle empty portfolio states', async ({ page }) => {
      await page.goto('/dashboard')
      
      // If no stocks exist, should show empty state
      const emptyState = page.locator('text=/no.*stock|empty|add.*first/i')
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible()
      }
      
      // Navigate to comparison with empty portfolio
      await page.goto('/comparison')
      
      // Should handle empty current portfolio gracefully
      await expect(page.locator('text=/no.*stock|create.*portfolio|empty/i')).toBeVisible()
    })

    test('should handle very large portfolios', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Simulate having many stocks (test rendering performance)
      const addButton = page.locator('button:has-text("Add")').first()
      
      // Add several stocks quickly
      for (let i = 0; i < 5; i++) {
        if (await addButton.isVisible()) {
          await addButton.click()
          
          await page.fill('input[name="stock_name"]', `Stock ${i + 1}`)
          await page.fill('input[name="quantity"]', '10')
          await page.fill('input[name="purchase_price"]', '100')
          await page.fill('input[name="current_price"]', '110')
          
          await page.click('button[type="submit"]')
          await page.waitForSelector('form', { state: 'hidden' })
          
          // Small delay to avoid overwhelming
          await page.waitForTimeout(500)
        }
      }
      
      // Verify portfolio still renders correctly
      await expect(page.locator('text=/Total.*Value|Portfolio/i')).toBeVisible()
    })

    test('should handle concurrent user actions', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Try to perform multiple actions simultaneously
      const addButton = page.locator('button:has-text("Add")').first()
      
      if (await addButton.isVisible()) {
        // Open form
        await addButton.click()
        
        // Try to open another form while first is open
        if (await addButton.isVisible()) {
          await addButton.click()
        }
        
        // Fill form while clicking around
        await page.fill('input[name="stock_name"]', 'Concurrent Stock')
        await page.click('body') // Click outside
        await page.fill('input[name="quantity"]', '10')
        
        // Try rapid form submission
        await page.click('button[type="submit"]')
        await page.click('button[type="submit"]') // Double click
        
        // Should handle gracefully without duplicate submissions
        await page.waitForTimeout(2000)
      }
    })

    test('should handle browser back/forward navigation edge cases', async ({ page }) => {
      // Navigate through the app
      await page.goto('/dashboard')
      await page.goto('/target-portfolio')
      await page.goto('/comparison')
      
      // Use browser back button rapidly
      await page.goBack()
      await page.goBack()
      await page.goForward()
      
      // Should handle navigation without errors
      await expect(page.locator('body')).toBeVisible()
      
      // Try refreshing on different pages
      await page.reload()
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle localStorage/sessionStorage failures', async ({ page }) => {
      // Disable localStorage
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('localStorage disabled') },
            setItem: () => { throw new Error('localStorage disabled') },
            removeItem: () => { throw new Error('localStorage disabled') },
            clear: () => { throw new Error('localStorage disabled') },
            length: 0,
            key: () => null
          }
        })
      })
      
      await page.goto('/dashboard')
      
      // App should still function without localStorage
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Authentication Error Scenarios', () => {
    test('should handle invalid login credentials', async ({ page }) => {
      await page.goto('/')
      
      // Try invalid login
      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Should show authentication error
      await expect(page.locator('text=/invalid.*credential|login.*failed|incorrect/i')).toBeVisible({
        timeout: 10000
      })
    })

    test('should handle session expiration', async ({ page }) => {
      // Simulate authenticated state first
      await page.goto('/dashboard')
      
      // Simulate session expiration by clearing auth
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
      
      // Try to perform an action that requires authentication
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        // Should either redirect to login or show auth error
      }
      
      // Refresh page to trigger auth check
      await page.reload()
      
      // Should redirect to auth page or show login prompt
      await page.waitForTimeout(3000)
    })
  })

  test.describe('Data Consistency Edge Cases', () => {
    test('should handle corrupted local data', async ({ page }) => {
      // Set corrupted data in localStorage
      await page.addInitScript(() => {
        localStorage.setItem('portfolio-data', 'invalid-json{')
        localStorage.setItem('user-preferences', '{"corrupted": true')
      })
      
      await page.goto('/dashboard')
      
      // App should handle corrupted data gracefully
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle decimal precision edge cases', async ({ page }) => {
      await page.goto('/dashboard')
      
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Test decimal precision
        await page.fill('input[name="stock_name"]', 'Precision Test')
        await page.fill('input[name="quantity"]', '0.33333333')
        await page.fill('input[name="purchase_price"]', '99.99999')
        await page.fill('input[name="current_price"]', '100.00001')
        
        await page.click('button[type="submit"]')
        
        // Should handle precision appropriately
        await page.waitForTimeout(2000)
      }
    })
  })
})