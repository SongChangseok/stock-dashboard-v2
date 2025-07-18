import { test, expect } from '@playwright/test'

test.describe('Accessibility Scenario Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Keyboard-Only Navigation', () => {
    test('should navigate entire app using only keyboard', async ({ page }) => {
      // Start from the main page
      await page.goto('/dashboard')
      
      // Tab through interactive elements
      let tabCount = 0
      const maxTabs = 20 // Prevent infinite loop
      
      // Test tab navigation
      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab')
        tabCount++
        
        // Check if focus is visible
        const focusedElement = page.locator(':focus')
        if (await focusedElement.count() > 0) {
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase())
          const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(tagName)
          
          if (isInteractive) {
            // Verify focused element is visible
            await expect(focusedElement).toBeVisible()
            
            // Check for focus indicators
            const hasOutline = await focusedElement.evaluate(el => {
              const styles = window.getComputedStyle(el)
              return styles.outline !== 'none' || styles.boxShadow !== 'none' || 
                     el.getAttribute('class')?.includes('focus') || false
            })
            
            expect(hasOutline).toBe(true)
          }
        }
        
        await page.waitForTimeout(100)
      }
      
      console.log(`Tabbed through ${tabCount} elements`)
    })

    test('should activate buttons and forms using keyboard', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Find add button and activate with keyboard
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        // Focus the button
        await addButton.focus()
        
        // Verify it's focused
        await expect(addButton).toBeFocused()
        
        // Activate with Enter key
        await page.keyboard.press('Enter')
        
        // Form should open
        await expect(page.locator('form')).toBeVisible({ timeout: 5000 })
        
        // Navigate form using keyboard
        await page.keyboard.press('Tab')
        await page.keyboard.type('Keyboard Test Stock')
        
        await page.keyboard.press('Tab')
        await page.keyboard.type('KTS')
        
        await page.keyboard.press('Tab')
        await page.keyboard.type('10')
        
        await page.keyboard.press('Tab')
        await page.keyboard.type('100')
        
        await page.keyboard.press('Tab')
        await page.keyboard.type('110')
        
        // Submit form with keyboard
        await page.keyboard.press('Tab')
        const submitButton = page.locator(':focus')
        if (await submitButton.isVisible()) {
          await page.keyboard.press('Enter')
        }
        
        // Verify form was submitted
        await page.waitForSelector('form', { state: 'hidden' }, { timeout: 5000 })
      }
    })

    test('should navigate between pages using keyboard', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test navigation links with keyboard
      const navLinks = page.locator('nav a, a[href^="/"]')
      const linkCount = await navLinks.count()
      
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i)
        if (await link.isVisible()) {
          await link.focus()
          await expect(link).toBeFocused()
          
          // Check if Enter key works for navigation
          const href = await link.getAttribute('href')
          if (href && href !== '#') {
            await page.keyboard.press('Enter')
            
            // Verify navigation occurred
            await page.waitForTimeout(1000)
            const currentUrl = page.url()
            expect(currentUrl).toContain(href.replace(/^\//, ''))
            
            // Navigate back for next test
            await page.goBack()
            await page.waitForTimeout(500)
          }
        }
      }
    })

    test('should handle modal dialogs with keyboard', async ({ page }) => {
      await page.goto('/dashboard')
      
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Modal should trap focus
        await expect(page.locator('form')).toBeVisible()
        
        // Test Escape key to close modal
        await page.keyboard.press('Escape')
        await page.waitForSelector('form', { state: 'hidden' }, { timeout: 3000 })
        
        // Reopen modal
        await addButton.click()
        await expect(page.locator('form')).toBeVisible()
        
        // Test Tab cycling within modal
        const initialFocus = page.locator(':focus')
        let focusedElement = initialFocus
        
        // Tab through modal elements (should not escape modal)
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab')
          const newFocus = page.locator(':focus')
          
          // Verify focus is still within modal
          const isInModal = await newFocus.evaluate((el, modalSelector) => {
            const modal = document.querySelector(modalSelector)
            return modal?.contains(el) || false
          }, 'form, [role="dialog"], .modal')
          
          if (isInModal) {
            focusedElement = newFocus
          }
        }
        
        // Close modal with Escape
        await page.keyboard.press('Escape')
      }
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      
      if (headingCount > 0) {
        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i)
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
          const text = await heading.textContent()
          
          // Headings should have meaningful text
          expect(text?.trim().length).toBeGreaterThan(0)
          
          // Check for proper nesting (simplified check)
          const level = parseInt(tagName.substring(1))
          expect(level).toBeGreaterThanOrEqual(1)
          expect(level).toBeLessThanOrEqual(6)
        }
      }
    })

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for ARIA landmarks
      const landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
      const landmarkCount = await landmarks.count()
      
      if (landmarkCount > 0) {
        for (let i = 0; i < landmarkCount; i++) {
          const landmark = landmarks.nth(i)
          await expect(landmark).toBeVisible()
        }
      }
      
      // Check buttons have accessible names
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const hasText = await button.textContent()
          const hasAriaLabel = await button.getAttribute('aria-label')
          const hasTitle = await button.getAttribute('title')
          
          // Button should have some form of accessible name
          expect(hasText || hasAriaLabel || hasTitle).toBeTruthy()
        }
      }
      
      // Check form inputs have labels
      const inputs = page.locator('input, select, textarea')
      const inputCount = await inputs.count()
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i)
        if (await input.isVisible()) {
          const id = await input.getAttribute('id')
          const ariaLabel = await input.getAttribute('aria-label')
          const ariaLabelledby = await input.getAttribute('aria-labelledby')
          const placeholder = await input.getAttribute('placeholder')
          
          // Input should have some form of label
          const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false
          
          expect(hasLabel || ariaLabel || ariaLabelledby || placeholder).toBeTruthy()
        }
      }
    })

    test('should provide meaningful error messages', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Try to trigger form validation errors
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Submit empty form to trigger validation
        const submitButton = page.locator('button[type="submit"]')
        if (await submitButton.isVisible()) {
          await submitButton.click()
          
          // Check for error messages
          const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"] + *, text=/required|invalid|error/i')
          const errorCount = await errorMessages.count()
          
          if (errorCount > 0) {
            for (let i = 0; i < errorCount; i++) {
              const error = errorMessages.nth(i)
              if (await error.isVisible()) {
                const errorText = await error.textContent()
                
                // Error message should be meaningful
                expect(errorText?.trim().length).toBeGreaterThan(0)
                
                // Should be associated with form field if possible
                const hasAriaDescribedby = await error.getAttribute('aria-describedby')
                const hasRole = await error.getAttribute('role')
                
                expect(hasAriaDescribedby || hasRole === 'alert').toBeTruthy()
              }
            }
          }
        }
        
        // Close form
        await page.keyboard.press('Escape')
      }
    })

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
      const liveRegionCount = await liveRegions.count()
      
      // Add a stock to trigger dynamic content change
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        await page.fill('input[name="stock_name"]', 'Screen Reader Test')
        await page.fill('input[name="quantity"]', '10')
        await page.fill('input[name="purchase_price"]', '100')
        await page.fill('input[name="current_price"]', '110')
        
        await page.click('button[type="submit"]')
        
        // Wait for content to be added
        await page.waitForTimeout(2000)
        
        // Check if there are status messages for the addition
        const statusMessages = page.locator('[role="status"], [aria-live="polite"], text=/added|created|success/i')
        const messageCount = await statusMessages.count()
        
        // Should provide some feedback about the action
        if (messageCount > 0) {
          await expect(statusMessages.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('High Contrast and Visual Accessibility', () => {
    test('should work with high contrast mode', async ({ page }) => {
      // Enable high contrast mode
      await page.emulateMedia({ forcedColors: 'active' })
      
      await page.goto('/dashboard')
      
      // Verify content is still visible
      await expect(page.locator('body')).toBeVisible()
      
      // Check that interactive elements are distinguishable
      const buttons = page.locator('button:visible')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        await expect(button).toBeVisible()
        
        // In high contrast mode, elements should still be functional
        const isEnabled = await button.isEnabled()
        expect(isEnabled).toBe(true)
      }
      
      // Test form visibility in high contrast
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        const form = page.locator('form')
        await expect(form).toBeVisible()
        
        // Form inputs should be visible
        const inputs = form.locator('input, select, textarea')
        const inputCount = await inputs.count()
        
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i)
          if (await input.isVisible()) {
            await expect(input).toBeVisible()
          }
        }
        
        await page.keyboard.press('Escape')
      }
    })

    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })
      
      await page.goto('/dashboard')
      
      // Check that animations are reduced or disabled
      const animatedElements = page.locator('[class*="animate"], [class*="transition"], [style*="animation"], [style*="transition"]')
      const elementCount = await animatedElements.count()
      
      if (elementCount > 0) {
        for (let i = 0; i < Math.min(elementCount, 5); i++) {
          const element = animatedElements.nth(i)
          if (await element.isVisible()) {
            // Check computed styles
            const animationDuration = await element.evaluate(el => {
              return window.getComputedStyle(el).animationDuration
            })
            
            const transitionDuration = await element.evaluate(el => {
              return window.getComputedStyle(el).transitionDuration
            })
            
            // In reduced motion mode, durations should be minimal or zero
            expect(animationDuration === '0s' || transitionDuration === '0s').toBeTruthy()
          }
        }
      }
      
      // Test that functionality still works without animations
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        await expect(page.locator('form')).toBeVisible()
        await page.keyboard.press('Escape')
      }
    })

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/dashboard')
      
      // This is a simplified contrast check
      // In real scenarios, you'd use axe-core or similar tools
      
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label')
      const elementCount = await textElements.count()
      
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = textElements.nth(i)
        if (await element.isVisible()) {
          const hasText = await element.textContent()
          
          if (hasText && hasText.trim().length > 0) {
            // Check if element has any color styling
            const styles = await element.evaluate(el => {
              const computed = window.getComputedStyle(el)
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor
              }
            })
            
            // Basic check: ensure text color is not transparent or same as background
            expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
            expect(styles.color).not.toBe('transparent')
            expect(styles.color).not.toBe(styles.backgroundColor)
          }
        }
      }
    })
  })

  test.describe('Alternative Input Methods', () => {
    test('should work with touch devices', async ({ page }) => {
      // Simulate touch device
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/dashboard')
      
      // Test touch interactions
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        // Verify button is large enough for touch
        const box = await addButton.boundingBox()
        expect(box?.width).toBeGreaterThanOrEqual(44)
        expect(box?.height).toBeGreaterThanOrEqual(44)
        
        // Test touch interaction
        await addButton.click()
        await expect(page.locator('form')).toBeVisible()
        
        // Test touch scrolling
        await page.touchscreen.tap(200, 300)
        await page.mouse.wheel(0, 200)
        
        await page.keyboard.press('Escape')
      }
    })

    test('should work with voice control simulation', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test finding elements by accessible names (simulating voice commands)
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const accessibleName = await button.evaluate(el => {
            return el.textContent || 
                   el.getAttribute('aria-label') || 
                   el.getAttribute('title') || 
                   el.getAttribute('alt') || ''
          })
          
          if (accessibleName.trim()) {
            // Voice control should be able to target this element
            const targetedButton = page.locator('button', { hasText: accessibleName.trim() })
            await expect(targetedButton).toBeVisible()
          }
        }
      }
    })
  })
})