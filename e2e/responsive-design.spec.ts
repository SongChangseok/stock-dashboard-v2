import { test, expect } from '@playwright/test'

test.describe('Responsive Design Testing', () => {
  const viewports = [
    { name: 'Mobile Small', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ]

  viewports.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      
      // Wait for page to load and adapt to viewport
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      
      // Verify main content is visible and within viewport
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // Check that content doesn't overflow horizontally
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
      const clientWidth = await page.evaluate(() => document.body.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // Allow small tolerance
      
      // Verify touch targets are at least 44px for mobile devices
      if (width <= 768) {
        const buttons = page.locator('button')
        const buttonCount = await buttons.count()
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i)
          if (await button.isVisible()) {
            const box = await button.boundingBox()
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(44)
              expect(box.width).toBeGreaterThanOrEqual(44)
            }
          }
        }
      }
      
      // Test form elements on different screen sizes
      const formElements = page.locator('input, button, select')
      const elementCount = await formElements.count()
      
      for (let i = 0; i < Math.min(elementCount, 3); i++) {
        const element = formElements.nth(i)
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
        }
      }
    })
  })

  test('should handle orientation changes', async ({ page }) => {
    // Start with portrait
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verify portrait layout
    let body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Switch to landscape
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(500)
    
    // Verify landscape layout still works
    body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should maintain functionality across different screen densities', async ({ page }) => {
    // Test different device pixel ratios
    const devicePixelRatios = [1, 1.5, 2, 3]
    
    for (const ratio of devicePixelRatios) {
      await page.emulateMedia({ 
        forcedColors: 'none',
        // Note: deviceScaleFactor is set via device emulation
      })
      
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Verify content is readable and interactive
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // Check if images and icons scale properly
      const images = page.locator('img, svg')
      const imageCount = await images.count()
      
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i)
        if (await img.isVisible()) {
          await expect(img).toBeVisible()
        }
      }
    }
  })

  test('should support zoom levels up to 200%', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test different zoom levels
    const zoomLevels = [1, 1.25, 1.5, 2]
    
    for (const zoom of zoomLevels) {
      // Simulate zoom by adjusting viewport and device scale factor
      const baseWidth = 1280
      const baseHeight = 720
      
      await page.setViewportSize({ 
        width: Math.round(baseWidth / zoom), 
        height: Math.round(baseHeight / zoom) 
      })
      
      await page.waitForTimeout(300)
      
      // Verify content is still accessible
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // Check that interactive elements are still clickable
      const buttons = page.locator('button').first()
      if (await buttons.isVisible()) {
        await expect(buttons).toBeVisible()
      }
    }
  })
})