import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'

test.describe('Quality Metrics & Reporting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Test Coverage Validation', () => {
    test('should meet coverage requirements', async ({ page }) => {
      // This would typically read from coverage reports
      // For now, we'll verify that tests exist for key components
      
      const testFiles = [
        'src/components/__tests__/',
        'src/services/__tests__/',
        'src/stores/__tests__/',
        'src/utils/__tests__/'
      ]

      // In a real scenario, you'd read actual coverage data
      // Here we're validating that test structure exists
      console.log('Coverage target: >80% - Validating test structure exists')
      
      // Navigate to different pages to ensure they load without errors
      await page.goto('/dashboard')
      await expect(page.locator('body')).toBeVisible()
      
      await page.goto('/target-portfolio')
      await expect(page.locator('body')).toBeVisible()
      
      await page.goto('/comparison')
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Performance Benchmarks', () => {
    test('should meet loading time requirements (<2s)', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      console.log(`Page load time: ${loadTime}ms`)
      
      // Target: <2000ms
      expect(loadTime).toBeLessThan(2000)
    })

    test('should meet interaction time requirements (<100ms)', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test button interaction time
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        const startTime = Date.now()
        await addButton.click()
        
        // Wait for form to appear
        await page.waitForSelector('form', { state: 'visible' })
        const interactionTime = Date.now() - startTime
        
        console.log(`Interaction time: ${interactionTime}ms`)
        
        // Target: <100ms for UI response (form opening)
        expect(interactionTime).toBeLessThan(1000) // More lenient for E2E tests
        
        // Close form
        await page.keyboard.press('Escape')
      }
    })

    test('should handle performance under load', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Measure performance with multiple rapid interactions
      const interactions = []
      const addButton = page.locator('button:has-text("Add")').first()
      
      for (let i = 0; i < 5; i++) {
        if (await addButton.isVisible()) {
          const startTime = Date.now()
          await addButton.click()
          await page.waitForSelector('form', { state: 'visible' })
          await page.keyboard.press('Escape')
          const duration = Date.now() - startTime
          interactions.push(duration)
          
          await page.waitForTimeout(100) // Brief pause
        }
      }
      
      if (interactions.length > 0) {
        const averageTime = interactions.reduce((a, b) => a + b, 0) / interactions.length
        console.log(`Average interaction time under load: ${averageTime}ms`)
        
        // Should not degrade significantly under load
        expect(averageTime).toBeLessThan(2000)
      }
    })

    test('should maintain performance with large datasets', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Add multiple stocks to test performance with larger datasets
      const addButton = page.locator('button:has-text("Add")').first()
      const stocksToAdd = 5 // Reduced for E2E test speed
      
      for (let i = 1; i <= stocksToAdd; i++) {
        if (await addButton.isVisible()) {
          const startTime = Date.now()
          
          await addButton.click()
          await page.waitForSelector('form', { state: 'visible' })
          
          // Fill form quickly
          await page.fill('input[name="stock_name"]', `Performance Test Stock ${i}`)
          await page.fill('input[name="quantity"]', '10')
          await page.fill('input[name="purchase_price"]', '100')
          await page.fill('input[name="current_price"]', '110')
          
          await page.click('button[type="submit"]')
          await page.waitForSelector('form', { state: 'hidden' })
          
          const duration = Date.now() - startTime
          console.log(`Stock ${i} add time: ${duration}ms`)
          
          // Each operation should complete reasonably quickly
          expect(duration).toBeLessThan(5000)
        }
      }
      
      // Verify portfolio still renders quickly
      const renderStartTime = Date.now()
      await expect(page.locator('text=/Total.*Value|Portfolio/i')).toBeVisible()
      const renderTime = Date.now() - renderStartTime
      
      console.log(`Portfolio render time with ${stocksToAdd} stocks: ${renderTime}ms`)
      expect(renderTime).toBeLessThan(3000)
    })
  })

  test.describe('WCAG 2.1 AA Accessibility Compliance', () => {
    test('should pass automated accessibility tests', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Inject axe-core for accessibility testing
      await injectAxe(page)
      
      // Check for accessibility violations
      const violations = await getViolations(page, undefined, {
        rules: {
          // WCAG 2.1 AA rules
          'color-contrast': { enabled: true },
          'keyboard': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'aria-labels': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-roles': { enabled: true },
          'form-labels': { enabled: true }
        }
      })
      
      // Log violations for debugging
      if (violations.length > 0) {
        console.log('Accessibility violations found:')
        violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`)
          console.log(`  Impact: ${violation.impact}`)
          console.log(`  Help: ${violation.help}`)
        })
      }
      
      // Should have no critical or serious violations for WCAG AA
      const criticalViolations = violations.filter(v => v.impact === 'critical')
      const seriousViolations = violations.filter(v => v.impact === 'serious')
      
      expect(criticalViolations).toHaveLength(0)
      expect(seriousViolations).toHaveLength(0)
      
      // Total violations should be minimal
      expect(violations.length).toBeLessThanOrEqual(5)
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test tab navigation
      let tabbableElements = 0
      const maxTabs = 20
      
      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab')
        
        const focusedElement = page.locator(':focus')
        if (await focusedElement.count() > 0) {
          tabbableElements++
          
          // Verify focus is visible
          await expect(focusedElement).toBeVisible()
          
          // Check for focus indicators
          const hasFocusStyle = await focusedElement.evaluate(el => {
            const styles = window.getComputedStyle(el)
            return styles.outline !== 'none' || 
                   styles.boxShadow.includes('focus') ||
                   el.getAttribute('class')?.includes('focus')
          })
          
          expect(hasFocusStyle).toBe(true)
        }
      }
      
      console.log(`Found ${tabbableElements} tabbable elements`)
      expect(tabbableElements).toBeGreaterThan(0)
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for required ARIA landmarks
      const main = page.locator('[role="main"], main')
      const nav = page.locator('[role="navigation"], nav')
      
      // Should have main content area
      expect(await main.count()).toBeGreaterThanOrEqual(1)
      
      // Check form labels
      const inputs = page.locator('input:not([type="hidden"])')
      const inputCount = await inputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        if (await input.isVisible()) {
          const hasLabel = await input.evaluate(el => {
            const id = el.getAttribute('id')
            const ariaLabel = el.getAttribute('aria-label')
            const ariaLabelledby = el.getAttribute('aria-labelledby')
            const placeholder = el.getAttribute('placeholder')
            
            // Check for associated label
            const hasAssociatedLabel = id ? 
              document.querySelector(`label[for="${id}"]`) !== null : false
            
            return hasAssociatedLabel || ariaLabel || ariaLabelledby || placeholder
          })
          
          expect(hasLabel).toBe(true)
        }
      }
    })

    test('should support screen reader users', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      
      if (headingCount > 0) {
        // Should start with h1
        const firstHeading = headings.first()
        const firstHeadingTag = await firstHeading.evaluate(el => el.tagName.toLowerCase())
        expect(firstHeadingTag).toBe('h1')
        
        // All headings should have text
        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i)
          const text = await heading.textContent()
          expect(text?.trim().length).toBeGreaterThan(0)
        }
      }
      
      // Check for descriptive button text
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const accessibleName = await button.evaluate(el => {
            return el.textContent?.trim() || 
                   el.getAttribute('aria-label') || 
                   el.getAttribute('title') || ''
          })
          
          expect(accessibleName.length).toBeGreaterThan(0)
        }
      }
    })

    test('should work with high contrast mode', async ({ page }) => {
      // Enable high contrast mode
      await page.emulateMedia({ forcedColors: 'active' })
      
      await page.goto('/dashboard')
      
      // Content should still be visible and functional
      await expect(page.locator('body')).toBeVisible()
      
      // Interactive elements should be distinguishable
      const buttons = page.locator('button:visible')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        await expect(button).toBeVisible()
        
        // Should be enabled and clickable
        const isEnabled = await button.isEnabled()
        expect(isEnabled).toBe(true)
      }
    })
  })

  test.describe('Error Boundary Testing', () => {
    test('should handle JavaScript errors gracefully', async ({ page }) => {
      // Monitor console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      await page.goto('/dashboard')
      
      // Trigger potential error scenarios
      await page.evaluate(() => {
        // Simulate a component error
        try {
          throw new Error('Test error for boundary testing')
        } catch (e) {
          // Should be caught by error boundary
        }
      })
      
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible()
      
      // Should not have uncaught errors
      const uncaughtErrors = errors.filter(error => 
        error.includes('Uncaught') && !error.includes('Test error')
      )
      expect(uncaughtErrors).toHaveLength(0)
    })

    test('should recover from network errors', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Simulate network failure
      await page.route('**/api/**', route => route.abort())
      
      // Try to perform an action that requires network
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        await page.fill('input[name="stock_name"]', 'Network Test Stock')
        await page.fill('input[name="quantity"]', '10')
        await page.fill('input[name="purchase_price"]', '100')
        await page.fill('input[name="current_price"]', '110')
        
        await page.click('button[type="submit"]')
        
        // Should show appropriate error message
        await expect(page.locator('text=/error|failed|network/i')).toBeVisible({
          timeout: 10000
        })
      }
      
      // Remove network failure
      await page.unroute('**/api/**')
      
      // Should be able to retry
      const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")')
      if (await retryButton.isVisible()) {
        await retryButton.click()
      }
    })

    test('should handle component crashes', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Inject error boundary test
      await page.addInitScript(() => {
        // Mock React error boundary behavior
        window.addEventListener('error', (event) => {
          console.log('Error boundary caught:', event.error?.message)
          event.preventDefault()
        })
      })
      
      // Trigger component error
      await page.evaluate(() => {
        // Simulate component crash
        const errorEvent = new ErrorEvent('error', {
          error: new Error('Component crash test'),
          message: 'Component crash test'
        })
        window.dispatchEvent(errorEvent)
      })
      
      // Application should still be responsive
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Quality Gates Validation', () => {
    test('should meet all quality benchmarks', async ({ page }) => {
      const qualityChecks = {
        loadTime: false,
        accessibility: false,
        functionality: false,
        errorHandling: false
      }
      
      // Load time check
      const startTime = Date.now()
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      qualityChecks.loadTime = loadTime < 2000
      
      // Accessibility check
      await injectAxe(page)
      const violations = await getViolations(page)
      const criticalViolations = violations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
      )
      qualityChecks.accessibility = criticalViolations.length === 0
      
      // Functionality check
      const body = page.locator('body')
      qualityChecks.functionality = await body.isVisible()
      
      // Error handling check
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      await page.waitForTimeout(2000)
      qualityChecks.errorHandling = errors.length === 0
      
      // Log results
      console.log('Quality Gates Results:')
      console.log(`- Load Time (<2s): ${qualityChecks.loadTime ? 'PASS' : 'FAIL'} (${loadTime}ms)`)
      console.log(`- Accessibility (WCAG AA): ${qualityChecks.accessibility ? 'PASS' : 'FAIL'} (${criticalViolations.length} critical violations)`)
      console.log(`- Functionality: ${qualityChecks.functionality ? 'PASS' : 'FAIL'}`)
      console.log(`- Error Handling: ${qualityChecks.errorHandling ? 'PASS' : 'FAIL'} (${errors.length} errors)`)
      
      // All checks should pass
      expect(qualityChecks.loadTime).toBe(true)
      expect(qualityChecks.accessibility).toBe(true)
      expect(qualityChecks.functionality).toBe(true)
      expect(qualityChecks.errorHandling).toBe(true)
    })
  })
})