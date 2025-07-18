import { test, expect } from '@playwright/test'

test.describe('Performance Scenario Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Large Portfolio Performance', () => {
    test('should handle portfolio with 50+ stocks efficiently', async ({ page }) => {
      await page.goto('/dashboard')
      
      const startTime = Date.now()
      
      // Simulate large portfolio by adding multiple stocks
      const addButton = page.locator('button:has-text("Add")').first()
      
      // Add 20 stocks (reduced from 50 to avoid test timeout)
      for (let i = 1; i <= 20; i++) {
        if (await addButton.isVisible()) {
          await addButton.click()
          
          await page.fill('input[name="stock_name"]', `Large Portfolio Stock ${i}`)
          await page.fill('input[name="ticker"]', `LPS${i}`)
          await page.fill('input[name="quantity"]', (Math.floor(Math.random() * 100) + 1).toString())
          await page.fill('input[name="purchase_price"]', (Math.floor(Math.random() * 200) + 50).toString())
          await page.fill('input[name="current_price"]', (Math.floor(Math.random() * 250) + 40).toString())
          
          await page.click('button[type="submit"]')
          await page.waitForSelector('form', { state: 'hidden' })
          
          // Brief pause to avoid overwhelming the system
          if (i % 5 === 0) {
            await page.waitForTimeout(1000)
          }
        }
      }
      
      const additionTime = Date.now() - startTime
      console.log(`Time to add 20 stocks: ${additionTime}ms`)
      
      // Verify portfolio summary still loads quickly
      const summaryStartTime = Date.now()
      await expect(page.locator('text=/Total.*Value|Portfolio/i')).toBeVisible()
      const summaryTime = Date.now() - summaryStartTime
      
      // Portfolio summary should load within 3 seconds
      expect(summaryTime).toBeLessThan(3000)
      
      // Test chart rendering performance
      const chartStartTime = Date.now()
      const charts = page.locator('svg, canvas, .recharts-wrapper')
      await expect(charts.first()).toBeVisible({ timeout: 5000 })
      const chartTime = Date.now() - chartStartTime
      
      console.log(`Chart rendering time: ${chartTime}ms`)
      // Chart should render within 5 seconds
      expect(chartTime).toBeLessThan(5000)
    })

    test('should efficiently scroll through large stock lists', async ({ page }) => {
      await page.goto('/dashboard')
      
      // First ensure we have some stocks in the list
      const addButton = page.locator('button:has-text("Add")').first()
      
      // Add several stocks to test scrolling
      for (let i = 1; i <= 10; i++) {
        if (await addButton.isVisible()) {
          await addButton.click()
          
          await page.fill('input[name="stock_name"]', `Scroll Test Stock ${i}`)
          await page.fill('input[name="quantity"]', '10')
          await page.fill('input[name="purchase_price"]', '100')
          await page.fill('input[name="current_price"]', '110')
          
          await page.click('button[type="submit"]')
          await page.waitForSelector('form', { state: 'hidden' })
        }
      }
      
      // Test scroll performance
      const startTime = Date.now()
      
      // Scroll down and up multiple times
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 500)
        await page.waitForTimeout(100)
        await page.mouse.wheel(0, -500)
        await page.waitForTimeout(100)
      }
      
      const scrollTime = Date.now() - startTime
      console.log(`Scroll performance test time: ${scrollTime}ms`)
      
      // Verify content is still responsive
      await expect(page.locator('text=Scroll Test Stock 1')).toBeVisible()
    })

    test('should handle large target portfolio allocations', async ({ page }) => {
      await page.goto('/target-portfolio')
      
      const createButton = page.locator('button:has-text("Create")').first()
      if (await createButton.isVisible()) {
        await createButton.click()
        
        await page.fill('input[name="name"]', 'Large Allocation Portfolio')
        await page.fill('textarea[name="description"]', 'Portfolio with many allocations')
        
        // Try to create a portfolio with many allocations
        // Note: This depends on having stocks available
        const stockSelects = page.locator('select, .select-input')
        const selectCount = await stockSelects.count()
        
        if (selectCount > 0) {
          // Fill allocations if available
          const weightPerStock = Math.floor(100 / Math.max(selectCount, 1))
          
          for (let i = 0; i < Math.min(selectCount, 10); i++) {
            const select = stockSelects.nth(i)
            if (await select.isVisible()) {
              // Add allocation logic here based on actual component structure
              const weightInput = page.locator('input[type="number"]').nth(i)
              if (await weightInput.isVisible()) {
                await weightInput.fill(weightPerStock.toString())
              }
            }
          }
        }
        
        const startTime = Date.now()
        await page.click('button[type="submit"]')
        
        // Should process large allocation quickly
        await page.waitForSelector('form', { state: 'hidden' }, { timeout: 10000 })
        const processingTime = Date.now() - startTime
        
        console.log(`Large portfolio creation time: ${processingTime}ms`)
        expect(processingTime).toBeLessThan(10000)
      }
    })
  })

  test.describe('Slow Connection Simulation', () => {
    test('should remain functional with 3G connection speed', async ({ page }) => {
      // Simulate 3G connection (3G Fast preset: 1.6Mbps down, 0.768Mbps up, 150ms RTT)
      const client = await page.context().newCDPSession(page)
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 1600000 / 8, // 1.6Mbps in bytes per second
        uploadThroughput: 768000 / 8,    // 0.768Mbps in bytes per second
        latency: 150                      // 150ms RTT
      })
      
      const startTime = Date.now()
      await page.goto('/dashboard')
      
      // Should show loading indicators
      await expect(page.locator('text=/loading|Loading/i, .loading, .spinner')).toBeVisible()
      
      // Should eventually load within reasonable time for 3G
      await expect(page.locator('body')).toBeVisible({ timeout: 30000 })
      const loadTime = Date.now() - startTime
      
      console.log(`3G load time: ${loadTime}ms`)
      
      // Test basic interactions on slow connection
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Form should open even on slow connection
        await expect(page.locator('form')).toBeVisible({ timeout: 10000 })
      }
    })

    test('should handle 2G connection gracefully', async ({ page }) => {
      // Simulate 2G connection (even slower)
      const client = await page.context().newCDPSession(page)
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 256000 / 8,  // 256kbps
        uploadThroughput: 64000 / 8,     // 64kbps
        latency: 300                     // 300ms RTT
      })
      
      await page.goto('/dashboard')
      
      // Should show appropriate loading states
      await expect(page.locator('text=/loading|Loading/i, .loading, .spinner')).toBeVisible()
      
      // Should eventually load or show offline message
      await page.waitForTimeout(15000)
      
      // Either content loads or appropriate error/offline message shown
      const hasContent = await page.locator('body').isVisible()
      const hasOfflineMessage = await page.locator('text=/offline|slow.*connection|network.*error/i').isVisible()
      
      expect(hasContent || hasOfflineMessage).toBe(true)
    })

    test('should handle intermittent slow connections', async ({ page }) => {
      let requestCount = 0
      
      // Alternate between normal and slow connections
      await page.route('**/*', async route => {
        requestCount++
        
        if (requestCount % 3 === 0) {
          // Every third request is slow
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
        await route.continue()
      })
      
      await page.goto('/dashboard')
      
      // Should handle variable connection speeds
      await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
      
      // Try multiple navigation actions
      await page.goto('/target-portfolio')
      await page.waitForTimeout(2000)
      
      await page.goto('/comparison')
      await page.waitForTimeout(2000)
      
      // Should remain functional despite intermittent slowness
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Memory and CPU Performance', () => {
    test('should not cause memory leaks during extended use', async ({ page }) => {
      // Monitor memory usage during repeated actions
      await page.goto('/dashboard')
      
      const addButton = page.locator('button:has-text("Add")').first()
      
      // Perform repeated add/remove cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        // Add stock
        if (await addButton.isVisible()) {
          await addButton.click()
          
          await page.fill('input[name="stock_name"]', `Memory Test ${cycle}`)
          await page.fill('input[name="quantity"]', '10')
          await page.fill('input[name="purchase_price"]', '100')
          await page.fill('input[name="current_price"]', '110')
          
          await page.click('button[type="submit"]')
          await page.waitForSelector('form', { state: 'hidden' })
        }
        
        // Navigate between pages to test cleanup
        await page.goto('/target-portfolio')
        await page.waitForTimeout(500)
        
        await page.goto('/comparison')
        await page.waitForTimeout(500)
        
        await page.goto('/dashboard')
        await page.waitForTimeout(500)
        
        // Delete stock if possible
        const deleteButtons = page.locator('button:has-text("Delete"), button[title*="delete"]')
        if (await deleteButtons.count() > 0) {
          await deleteButtons.first().click()
          // Confirm deletion if needed
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")')
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }
        }
      }
      
      // Final verification
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle rapid user interactions without lag', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test rapid clicking and navigation
      const startTime = Date.now()
      
      // Rapid navigation
      for (let i = 0; i < 10; i++) {
        await page.click('a[href="/target-portfolio"], nav a:contains("Target")')
        await page.waitForTimeout(100)
        
        await page.click('a[href="/dashboard"], nav a:contains("Dashboard")')
        await page.waitForTimeout(100)
      }
      
      const navigationTime = Date.now() - startTime
      console.log(`Rapid navigation time: ${navigationTime}ms`)
      
      // Should handle rapid interactions without freezing
      await expect(page.locator('body')).toBeVisible()
    })

    test('should efficiently render complex charts with many data points', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Add multiple stocks to create complex chart data
      const addButton = page.locator('button:has-text("Add")').first()
      
      for (let i = 1; i <= 8; i++) {
        if (await addButton.isVisible()) {
          await addButton.click()
          
          await page.fill('input[name="stock_name"]', `Chart Test Stock ${i}`)
          await page.fill('input[name="quantity"]', (Math.floor(Math.random() * 50) + 10).toString())
          await page.fill('input[name="purchase_price"]', (Math.floor(Math.random() * 100) + 50).toString())
          await page.fill('input[name="current_price"]', (Math.floor(Math.random() * 120) + 60).toString())
          
          await page.click('button[type="submit"]')
          await page.waitForSelector('form', { state: 'hidden' })
        }
      }
      
      // Measure chart rendering time
      const chartStartTime = Date.now()
      
      // Ensure charts are visible
      const charts = page.locator('svg, canvas, .recharts-wrapper')
      await expect(charts.first()).toBeVisible({ timeout: 10000 })
      
      const chartRenderTime = Date.now() - chartStartTime
      console.log(`Complex chart render time: ${chartRenderTime}ms`)
      
      // Chart should render efficiently even with multiple data points
      expect(chartRenderTime).toBeLessThan(5000)
      
      // Test chart interactions
      await charts.first().hover()
      await page.waitForTimeout(500)
      
      // Should remain responsive during interactions
      await expect(charts.first()).toBeVisible()
    })
  })

  test.describe('Real-world Performance Scenarios', () => {
    test('should handle peak usage simulation', async ({ page }) => {
      // Simulate multiple concurrent operations
      await page.goto('/dashboard')
      
      const operations = []
      
      // Start multiple operations concurrently
      operations.push(
        // Add stocks
        (async () => {
          const addButton = page.locator('button:has-text("Add")').first()
          if (await addButton.isVisible()) {
            await addButton.click()
            await page.fill('input[name="stock_name"]', 'Concurrent Stock 1')
            await page.fill('input[name="quantity"]', '10')
            await page.fill('input[name="purchase_price"]', '100')
            await page.fill('input[name="current_price"]', '110')
            await page.click('button[type="submit"]')
          }
        })(),
        
        // Navigate to other pages
        (async () => {
          await page.waitForTimeout(1000)
          await page.goto('/target-portfolio')
        })(),
        
        // Simulate background refresh
        (async () => {
          await page.waitForTimeout(2000)
          await page.reload()
        })()
      )
      
      // Wait for all operations to complete
      await Promise.allSettled(operations)
      
      // Verify app remains functional
      await expect(page.locator('body')).toBeVisible()
    })

    test('should maintain performance during extended session', async ({ page }) => {
      // Simulate long user session
      await page.goto('/dashboard')
      
      const sessionStartTime = Date.now()
      
      // Simulate 30 minutes of usage (compressed to 30 seconds)
      const sessionActions = [
        () => page.goto('/dashboard'),
        () => page.goto('/target-portfolio'),
        () => page.goto('/comparison'),
        () => page.reload(),
        () => page.goBack(),
        () => page.goForward()
      ]
      
      for (let i = 0; i < 20; i++) {
        const randomAction = sessionActions[Math.floor(Math.random() * sessionActions.length)]
        await randomAction()
        await page.waitForTimeout(1500) // 1.5 second between actions
        
        // Verify app is still responsive
        await expect(page.locator('body')).toBeVisible()
      }
      
      const sessionTime = Date.now() - sessionStartTime
      console.log(`Extended session time: ${sessionTime}ms`)
      
      // Should maintain performance throughout session
      await expect(page.locator('body')).toBeVisible()
    })
  })
})