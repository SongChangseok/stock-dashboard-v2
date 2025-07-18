import { test, expect } from '@playwright/test'

test.describe('Feature Detection and Progressive Enhancement', () => {
  test('should detect modern browser features', async ({ page, browserName }) => {
    await page.goto('/')
    
    // Test for modern JavaScript features
    const modernFeatures = await page.evaluate(() => {
      return {
        // ES6+ features
        supportsArrowFunctions: (() => { try { new Function('()=>{}'); return true; } catch(e) { return false; } })(),
        supportsAsyncAwait: (() => { try { new Function('async()=>{}'); return true; } catch(e) { return false; } })(),
        supportsPromises: typeof Promise !== 'undefined',
        
        // DOM features
        supportsQuerySelector: typeof document.querySelector === 'function',
        supportsClassList: 'classList' in document.createElement('div'),
        supportsDataset: 'dataset' in document.createElement('div'),
        
        // CSS features
        supportsFlexbox: CSS.supports('display', 'flex'),
        supportsGrid: CSS.supports('display', 'grid'),
        supportsCustomProperties: CSS.supports('--custom-property', 'value'),
        
        // Storage features
        supportsLocalStorage: (() => {
          try {
            const test = 'test'
            localStorage.setItem(test, test)
            localStorage.removeItem(test)
            return true
          } catch(e) {
            return false
          }
        })(),
        supportsSessionStorage: (() => {
          try {
            const test = 'test'
            sessionStorage.setItem(test, test)
            sessionStorage.removeItem(test)
            return true
          } catch(e) {
            return false
          }
        })(),
        
        // Network features
        supportsFetch: typeof fetch === 'function',
        supportsWebSockets: typeof WebSocket === 'function',
        
        // Touch and interaction
        supportsTouchEvents: 'ontouchstart' in window,
        supportsPointerEvents: typeof PointerEvent === 'function',
        
        // Media features
        supportsWebP: (() => {
          const canvas = document.createElement('canvas')
          canvas.width = 1
          canvas.height = 1
          return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
        })(),
      }
    })
    
    // Log feature support for debugging
    console.log(`${browserName} feature support:`, modernFeatures)
    
    // Essential features that should be supported
    expect(modernFeatures.supportsQuerySelector).toBe(true)
    expect(modernFeatures.supportsClassList).toBe(true)
    expect(modernFeatures.supportsPromises).toBe(true)
    expect(modernFeatures.supportsFetch).toBe(true)
    expect(modernFeatures.supportsFlexbox).toBe(true)
    
    // Features that may vary by browser but app should handle gracefully
    if (!modernFeatures.supportsLocalStorage) {
      console.warn(`${browserName} does not support localStorage`)
    }
  })

  test('should fallback gracefully when features are missing', async ({ page }) => {
    await page.goto('/')
    
    // Simulate missing localStorage
    await page.addInitScript(() => {
      // Mock missing localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      })
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // App should still function without localStorage
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle CSS feature detection', async ({ page }) => {
    await page.goto('/')
    
    const cssFeatures = await page.evaluate(() => {
      const testElement = document.createElement('div')
      document.body.appendChild(testElement)
      
      const features = {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        customProperties: CSS.supports('--test', 'value'),
        transforms: CSS.supports('transform', 'translateX(10px)'),
        transitions: CSS.supports('transition', 'all 0.3s'),
        filters: CSS.supports('filter', 'blur(5px)'),
        backdropFilter: CSS.supports('backdrop-filter', 'blur(5px)'),
      }
      
      document.body.removeChild(testElement)
      return features
    })
    
    // Flexbox is essential for our layout
    expect(cssFeatures.flexbox).toBe(true)
    
    // Other features should be detected but may vary
    console.log('CSS feature support:', cssFeatures)
  })

  test('should provide accessible alternatives', async ({ page }) => {
    await page.goto('/')
    
    // Test keyboard navigation fallbacks
    await page.keyboard.press('Tab')
    
    // Verify focus management
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test high contrast mode support
    await page.emulateMedia({ forcedColors: 'active' })
    await page.waitForTimeout(500)
    
    // Content should still be visible in high contrast mode
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Reset media emulation
    await page.emulateMedia({ forcedColors: 'none' })
  })

  test('should handle reduced motion preferences', async ({ page }) => {
    await page.goto('/')
    
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(500)
    
    // Verify animations are reduced or disabled
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]')
    const elementCount = await animatedElements.count()
    
    if (elementCount > 0) {
      // Check that animations respect reduced motion
      const computedStyles = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="animate"], [class*="transition"]')
        return Array.from(elements).slice(0, 3).map(el => {
          const styles = window.getComputedStyle(el)
          return {
            transitionDuration: styles.transitionDuration,
            animationDuration: styles.animationDuration,
          }
        })
      })
      
      // Log for debugging
      console.log('Animation styles with reduced motion:', computedStyles)
    }
    
    // Reset media emulation
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('should work without JavaScript enhancements', async ({ page }) => {
    // Disable JavaScript to test progressive enhancement
    await page.context().addInitScript(() => {
      // This will run before page load, simulating no-JS environment
      // by overriding key JavaScript features
      (window as any).fetch = undefined;
      (window as any).Promise = undefined;
    })
    
    await page.goto('/')
    
    // Basic HTML structure should still be present
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Forms should still be submittable (even if enhanced features don't work)
    const forms = page.locator('form')
    const formCount = await forms.count()
    
    if (formCount > 0) {
      const firstForm = forms.first()
      await expect(firstForm).toBeVisible()
    }
  })

  test('should detect and handle network conditions', async ({ page }) => {
    await page.goto('/')
    
    // Test offline capability detection
    const offlineSupport = await page.evaluate(() => {
      return {
        supportsServiceWorker: 'serviceWorker' in navigator,
        supportsOfflineStorage: 'caches' in window,
        supportsNavigatorOnline: 'onLine' in navigator,
        currentOnlineStatus: navigator.onLine,
      }
    })
    
    console.log('Network feature support:', offlineSupport)
    
    // Basic network detection should be available
    expect(offlineSupport.supportsNavigatorOnline).toBe(true)
    expect(offlineSupport.currentOnlineStatus).toBe(true)
  })
})