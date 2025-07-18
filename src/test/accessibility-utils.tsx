import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { expect } from 'vitest'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

interface AccessibilityTestOptions {
  initialEntries?: string[]
  axeOptions?: any
}

/**
 * Render component with accessibility testing setup
 */
export function renderWithAccessibility(
  ui: React.ReactElement,
  options: AccessibilityTestOptions = {}
): Promise<RenderResult & { axeResults: any }> {
  const {
    initialEntries = ['/'],
    axeOptions = {}
  } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  )

  const renderResult = render(ui, { wrapper: Wrapper })
  
  // Run axe accessibility tests
  const axeResults = axe(renderResult.container, axeOptions)
  
  return Promise.resolve({
    ...renderResult,
    axeResults
  })
}

/**
 * Test component for accessibility violations
 */
export async function testAccessibility(
  ui: React.ReactElement,
  options: AccessibilityTestOptions = {}
) {
  const { axeResults } = await renderWithAccessibility(ui, options)
  const results = await axeResults
  expect(results).toHaveNoViolations()
  return results
}

/**
 * Test keyboard navigation
 */
export function testKeyboardNavigation(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>([
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ].join(', '))

  return {
    focusableElements,
    hasTabOrder: focusableElements.length > 0,
    hasProperTabIndex: Array.from(focusableElements).every(el => 
      el.tabIndex >= 0 || el.getAttribute('tabindex') === '0'
    ),
    testTabNavigation: () => {
      const results: Array<{
        element: HTMLElement
        canFocus: boolean
        hasVisibleFocus: boolean
        ariaLabel: string | null
      }> = []

      focusableElements.forEach(element => {
        element.focus()
        const canFocus = document.activeElement === element
        const hasVisibleFocus = element.matches(':focus-visible') || 
                                element.classList.contains('focus-visible')
        const ariaLabel = element.getAttribute('aria-label') || 
                         element.getAttribute('aria-labelledby') ||
                         element.textContent?.trim() || null

        results.push({
          element,
          canFocus,
          hasVisibleFocus,
          ariaLabel
        })
      })

      return results
    }
  }
}

/**
 * Test touch target sizes (minimum 44px)
 */
export function testTouchTargets(container: HTMLElement) {
  const interactiveElements = container.querySelectorAll<HTMLElement>([
    'button',
    'input',
    'select',
    'textarea',
    'a',
    '[role="button"]',
    '[role="link"]',
    '[onclick]',
    '[ontouch]'
  ].join(', '))

  const results: Array<{
    element: HTMLElement
    width: number
    height: number
    meetsTouchTarget: boolean
    tagName: string
    role: string | null
  }> = []

  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(element)
    
    // Get effective touch target size including padding
    const paddingTop = parseFloat(computedStyle.paddingTop)
    const paddingBottom = parseFloat(computedStyle.paddingBottom)
    const paddingLeft = parseFloat(computedStyle.paddingLeft)
    const paddingRight = parseFloat(computedStyle.paddingRight)
    
    const effectiveWidth = rect.width + paddingLeft + paddingRight
    const effectiveHeight = rect.height + paddingTop + paddingBottom
    
    const meetsTouchTarget = effectiveWidth >= 44 && effectiveHeight >= 44

    results.push({
      element,
      width: effectiveWidth,
      height: effectiveHeight,
      meetsTouchTarget,
      tagName: element.tagName,
      role: element.getAttribute('role')
    })
  })

  return {
    results,
    totalElements: results.length,
    compliantElements: results.filter(r => r.meetsTouchTarget).length,
    nonCompliantElements: results.filter(r => !r.meetsTouchTarget),
    complianceRate: results.length > 0 ? 
      (results.filter(r => r.meetsTouchTarget).length / results.length) * 100 : 100
  }
}

/**
 * Test color contrast ratios
 */
export function testColorContrast(container: HTMLElement) {
  const textElements = container.querySelectorAll<HTMLElement>([
    'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'button', 'a', 'label', 'input', 'textarea'
  ].join(', '))

  const results: Array<{
    element: HTMLElement
    textContent: string
    computedStyle: CSSStyleDeclaration
    hasInsufficientContrast: boolean
  }> = []

  textElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element)
    const textContent = element.textContent?.trim() || ''
    
    if (textContent.length > 0) {
      // Basic heuristic for insufficient contrast
      // In a real implementation, you would use a proper contrast ratio calculator
      const color = computedStyle.color
      const backgroundColor = computedStyle.backgroundColor
      const hasInsufficientContrast = 
        (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') ||
        (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(192, 192, 192)')

      results.push({
        element,
        textContent,
        computedStyle,
        hasInsufficientContrast
      })
    }
  })

  return {
    results,
    totalElements: results.length,
    elementsWithInsufficientContrast: results.filter(r => r.hasInsufficientContrast).length
  }
}

/**
 * Test ARIA attributes and labels
 */
export function testAriaCompliance(container: HTMLElement) {
  const elementsWithAria = container.querySelectorAll<HTMLElement>([
    '[aria-label]',
    '[aria-labelledby]',
    '[aria-describedby]',
    '[role]',
    '[aria-expanded]',
    '[aria-selected]',
    '[aria-checked]',
    '[aria-hidden]'
  ].join(', '))

  const formElements = container.querySelectorAll<HTMLElement>([
    'input:not([type="hidden"])',
    'select',
    'textarea',
    'button'
  ].join(', '))

  const results = {
    elementsWithAria: elementsWithAria.length,
    formElements: formElements.length,
    unlabeledFormElements: 0,
    invalidAriaReferences: 0,
    ariaDetails: [] as Array<{
      element: HTMLElement
      ariaLabel: string | null
      ariaLabelledBy: string | null
      ariaDescribedBy: string | null
      role: string | null
      hasValidAria: boolean
    }>
  }

  // Check form elements for proper labeling
  formElements.forEach(element => {
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    const ariaDescribedBy = element.getAttribute('aria-describedby')
    const role = element.getAttribute('role')
    
    const hasLabel = ariaLabel || ariaLabelledBy || 
                    element.tagName === 'BUTTON' ||
                    container.querySelector(`label[for="${element.id}"]`)
    
    const hasValidAria = Boolean(hasLabel)
    
    if (!hasValidAria) {
      results.unlabeledFormElements++
    }

    // Check if aria-labelledby and aria-describedby reference valid elements
    if (ariaLabelledBy) {
      const referencedElement = container.querySelector(`#${ariaLabelledBy}`)
      if (!referencedElement) {
        results.invalidAriaReferences++
      }
    }
    
    if (ariaDescribedBy) {
      const referencedElement = container.querySelector(`#${ariaDescribedBy}`)
      if (!referencedElement) {
        results.invalidAriaReferences++
      }
    }

    results.ariaDetails.push({
      element,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      role,
      hasValidAria
    })
  })

  return results
}

/**
 * Test focus management
 */
export function testFocusManagement(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>([
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', '))

  const results = {
    focusableElements: focusableElements.length,
    elementsWithFocusIndicator: 0,
    elementsWithoutFocusIndicator: 0,
    focusDetails: [] as Array<{
      element: HTMLElement
      hasFocusIndicator: boolean
      hasCustomFocusStyle: boolean
      tabIndex: number
    }>
  }

  focusableElements.forEach(element => {
    // Test focus indicator
    element.focus()
    const hasFocusIndicator = element.matches(':focus') || 
                             element.matches(':focus-visible') ||
                             element.classList.contains('focus-visible')
    
    // Check for custom focus styles
    const computedStyle = window.getComputedStyle(element, ':focus')
    const hasCustomFocusStyle = computedStyle.outline !== 'none' ||
                               computedStyle.boxShadow !== 'none' ||
                               computedStyle.borderColor !== computedStyle.getPropertyValue('border-color')

    if (hasFocusIndicator || hasCustomFocusStyle) {
      results.elementsWithFocusIndicator++
    } else {
      results.elementsWithoutFocusIndicator++
    }

    results.focusDetails.push({
      element,
      hasFocusIndicator,
      hasCustomFocusStyle,
      tabIndex: element.tabIndex
    })
  })

  return results
}

/**
 * Complete accessibility audit
 */
export async function runAccessibilityAudit(
  ui: React.ReactElement,
  options: AccessibilityTestOptions = {}
) {
  const { container } = await renderWithAccessibility(ui, options)
  
  const results = {
    axeResults: await axe(container, options.axeOptions),
    keyboardNavigation: testKeyboardNavigation(container),
    touchTargets: testTouchTargets(container),
    colorContrast: testColorContrast(container),
    ariaCompliance: testAriaCompliance(container),
    focusManagement: testFocusManagement(container)
  }

  return results
}

// Export types for better TypeScript support
export type AccessibilityAuditResults = Awaited<ReturnType<typeof runAccessibilityAudit>>
export type TouchTargetResults = ReturnType<typeof testTouchTargets>
export type KeyboardNavigationResults = ReturnType<typeof testKeyboardNavigation>
export type AriaComplianceResults = ReturnType<typeof testAriaCompliance>
export type FocusManagementResults = ReturnType<typeof testFocusManagement>