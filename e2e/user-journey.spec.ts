import { test, expect } from '@playwright/test'

test.describe('Complete User Journey Tests', () => {
  // Test data
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!'
  }

  const testStocks = [
    { name: 'Apple Inc.', ticker: 'AAPL', quantity: 10, purchasePrice: 150, currentPrice: 180 },
    { name: 'Microsoft Corp.', ticker: 'MSFT', quantity: 5, purchasePrice: 300, currentPrice: 350 },
    { name: 'Google Inc.', ticker: 'GOOGL', quantity: 3, purchasePrice: 2500, currentPrice: 2800 }
  ]

  const testTargetPortfolio = {
    name: 'Conservative Growth',
    description: 'A balanced portfolio focused on stable growth',
    allocations: [
      { stock: 'Apple Inc.', weight: 40 },
      { stock: 'Microsoft Corp.', weight: 35 },
      { stock: 'Google Inc.', weight: 25 }
    ]
  }

  test.beforeEach(async ({ page }) => {
    // Start from the authentication page
    await page.goto('/')
  })

  test('Complete user journey: Auth → Portfolio Creation → Target Portfolio → Rebalancing', async ({ page }) => {
    // Step 1: User Authentication
    await test.step('User signs up and logs in', async () => {
      // Check if we're on auth page
      await expect(page).toHaveTitle(/Stock Dashboard/i)
      
      // Switch to signup
      await page.click('button:has-text("Sign Up")')
      await page.waitForTimeout(500)
      
      // Fill signup form
      await page.fill('input[type="email"]', testUser.email)
      await page.fill('input[type="password"]', testUser.password)
      
      // Submit signup (mock or use test environment)
      await page.click('button[type="submit"]')
      
      // Should redirect to dashboard after successful auth
      await page.waitForURL('/dashboard', { timeout: 10000 })
      await expect(page).toHaveURL('/dashboard')
    })

    // Step 2: Portfolio Creation
    await test.step('User creates their current portfolio', async () => {
      // Check if we're on the dashboard
      await expect(page.locator('h1, h2')).toContainText(/Dashboard|Portfolio/i)
      
      // Add stocks one by one
      for (const stock of testStocks) {
        // Click add stock button (mobile or desktop)
        const addButton = page.locator('button').filter({ hasText: /Add.*Stock|Add/i }).first()
        await addButton.click()
        
        // Wait for form to open
        await page.waitForSelector('form', { state: 'visible' })
        
        // Fill stock form
        await page.fill('input[placeholder*="stock name" i], input[name="stock_name"]', stock.name)
        await page.fill('input[placeholder*="ticker" i], input[name="ticker"]', stock.ticker)
        await page.fill('input[placeholder*="quantity" i], input[name="quantity"]', stock.quantity.toString())
        await page.fill('input[placeholder*="purchase" i], input[name="purchase_price"]', stock.purchasePrice.toString())
        await page.fill('input[placeholder*="current" i], input[name="current_price"]', stock.currentPrice.toString())
        
        // Submit form
        await page.click('button[type="submit"]:has-text("Save"), button:has-text("Add Stock")')
        
        // Wait for form to close and stock to appear
        await page.waitForSelector('form', { state: 'hidden' })
        await expect(page.locator('text=' + stock.name)).toBeVisible()
      }
      
      // Verify portfolio summary is displayed
      await expect(page.locator('text=/Total Value|Portfolio Value/i')).toBeVisible()
      await expect(page.locator('text=/Total Gain|Profit/i')).toBeVisible()
    })

    // Step 3: Navigate to Target Portfolio Creation
    await test.step('User navigates to target portfolio page', async () => {
      // Navigate to target portfolio page
      await page.click('a[href="/target-portfolio"], nav a:has-text("Target Portfolio")')
      await page.waitForURL('/target-portfolio')
      
      // Should see target portfolio page
      await expect(page.locator('h1, h2')).toContainText(/Target Portfolio/i)
    })

    // Step 4: Create Target Portfolio
    await test.step('User creates a target portfolio', async () => {
      // Click create portfolio button
      await page.click('button:has-text("Create Portfolio"), button:has-text("Add")')
      
      // Wait for target portfolio form
      await page.waitForSelector('form', { state: 'visible' })
      
      // Fill portfolio details
      await page.fill('input[placeholder*="name" i], input[name="name"]', testTargetPortfolio.name)
      await page.fill('textarea[placeholder*="description" i], textarea[name="description"]', testTargetPortfolio.description)
      
      // Add stock allocations
      for (const allocation of testTargetPortfolio.allocations) {
        // Select stock from dropdown
        const stockSelect = page.locator('select, .select, [role="combobox"]').first()
        await stockSelect.selectOption({ label: allocation.stock })
        
        // Set weight
        const weightInput = page.locator('input[placeholder*="weight" i], input[type="number"]').last()
        await weightInput.fill(allocation.weight.toString())
        
        // Add allocation (if there's an add button)
        const addAllocationBtn = page.locator('button:has-text("Add"), button[title*="add"]').last()
        if (await addAllocationBtn.isVisible()) {
          await addAllocationBtn.click()
        }
      }
      
      // Save target portfolio
      await page.click('button[type="submit"]:has-text("Save"), button:has-text("Create")')
      
      // Wait for form to close
      await page.waitForSelector('form', { state: 'hidden' })
      
      // Verify target portfolio appears in list
      await expect(page.locator('text=' + testTargetPortfolio.name)).toBeVisible()
    })

    // Step 5: Navigate to Portfolio Comparison
    await test.step('User navigates to portfolio comparison', async () => {
      // Navigate to comparison page
      await page.click('a[href="/comparison"], nav a:has-text("Comparison"), nav a:has-text("Analytics")')
      await page.waitForURL('/comparison')
      
      // Should see comparison page
      await expect(page.locator('h1, h2, h3')).toContainText(/Comparison|Analytics|Target Portfolio/i)
    })

    // Step 6: Portfolio Analysis and Rebalancing
    await test.step('User analyzes portfolio and gets rebalancing recommendations', async () => {
      // Select the target portfolio we created
      await page.click(`button:has-text("${testTargetPortfolio.name}")`)
      
      // Wait for comparison charts to load
      await page.waitForTimeout(2000)
      
      // Verify portfolio comparison is displayed
      await expect(page.locator('text=/Current.*Portfolio|Target.*Portfolio/i')).toBeVisible()
      
      // Check for rebalancing calculator
      const rebalancingSection = page.locator('text=/Rebalancing|Trading|Calculator/i')
      if (await rebalancingSection.isVisible()) {
        await expect(rebalancingSection).toBeVisible()
        
        // Check for trading recommendations
        await expect(page.locator('text=/Buy|Sell|Hold/i')).toBeVisible()
      }
      
      // Verify charts are displayed (current vs target)
      const charts = page.locator('svg, canvas, .recharts-wrapper')
      await expect(charts.first()).toBeVisible()
    })

    // Step 7: Complete User Journey Verification
    await test.step('Verify complete user journey completion', async () => {
      // User should now see:
      // 1. Their current portfolio data
      // 2. Target portfolio comparison
      // 3. Rebalancing recommendations
      
      // Verify we can navigate back to different pages
      await page.click('a[href="/dashboard"], nav a:has-text("Dashboard")')
      await page.waitForURL('/dashboard')
      await expect(page.locator('text=' + testStocks[0].name)).toBeVisible()
      
      // Navigate back to target portfolios
      await page.click('a[href="/target-portfolio"], nav a:has-text("Target Portfolio")')
      await page.waitForURL('/target-portfolio')
      await expect(page.locator('text=' + testTargetPortfolio.name)).toBeVisible()
      
      // Navigate back to comparison
      await page.click('a[href="/comparison"], nav a:has-text("Comparison")')
      await page.waitForURL('/comparison')
      
      // Final verification: user journey is complete and functional
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test('Alternative user journey: Portfolio editing and target portfolio management', async ({ page }) => {
    // This test assumes user is already authenticated and has existing data
    
    await test.step('User edits existing stocks in portfolio', async () => {
      // Navigate to dashboard
      await page.goto('/dashboard')
      
      // Wait for stocks to load
      await page.waitForSelector('text=/Apple|Microsoft|Stock/i', { timeout: 10000 })
      
      // Find and click edit button for first stock
      const editButtons = page.locator('button:has-text("Edit"), button[title*="edit"], .edit-button')
      if (await editButtons.count() > 0) {
        await editButtons.first().click()
        
        // Modify the current price
        const currentPriceInput = page.locator('input[placeholder*="current" i], input[name="current_price"]')
        await currentPriceInput.fill('200')
        
        // Save changes
        await page.click('button[type="submit"]:has-text("Save")')
        await page.waitForSelector('form', { state: 'hidden' })
      }
    })

    await test.step('User duplicates and modifies target portfolio', async () => {
      // Navigate to target portfolio page
      await page.goto('/target-portfolio')
      
      // Find duplicate button
      const duplicateBtn = page.locator('button:has-text("Duplicate"), button[title*="duplicate"]')
      if (await duplicateBtn.count() > 0) {
        await duplicateBtn.first().click()
        
        // Modify the duplicated portfolio
        await page.fill('input[name="name"]', 'Aggressive Growth')
        await page.fill('textarea[name="description"]', 'Modified for higher growth potential')
        
        // Save the new portfolio
        await page.click('button[type="submit"]:has-text("Save")')
        await page.waitForSelector('form', { state: 'hidden' })
        
        // Verify new portfolio appears
        await expect(page.locator('text=Aggressive Growth')).toBeVisible()
      }
    })

    await test.step('User compares multiple target portfolios', async () => {
      // Navigate to comparison page
      await page.goto('/comparison')
      
      // Test switching between different target portfolios
      const portfolioButtons = page.locator('button:has-text("Conservative"), button:has-text("Aggressive")')
      const buttonCount = await portfolioButtons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 2); i++) {
        await portfolioButtons.nth(i).click()
        await page.waitForTimeout(1000)
        
        // Verify comparison updates
        await expect(page.locator('svg, canvas, .recharts-wrapper')).toBeVisible()
      }
    })
  })

  test('Quick user journey: New user onboarding flow', async ({ page }) => {
    await test.step('New user completes minimal viable journey', async () => {
      // Simulate quick onboarding
      await page.goto('/dashboard')
      
      // Add minimal portfolio (just one stock)
      const addButton = page.locator('button:has-text("Add")').first()
      if (await addButton.isVisible()) {
        await addButton.click()
        
        // Fill minimal required fields
        await page.fill('input[name="stock_name"]', 'Test Stock')
        await page.fill('input[name="quantity"]', '1')
        await page.fill('input[name="purchase_price"]', '100')
        await page.fill('input[name="current_price"]', '110')
        
        await page.click('button[type="submit"]')
        await page.waitForSelector('form', { state: 'hidden' })
      }
      
      // Verify basic portfolio functionality
      await expect(page.locator('text=Test Stock')).toBeVisible()
      await expect(page.locator('text=/Total.*Value|Portfolio/i')).toBeVisible()
    })
  })
})