/**
 * Accessibility testing utilities for WCAG 2.1 AA compliance
 */

export interface AccessibilityViolation {
  id: string
  description: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  help: string
  helpUrl: string
  nodes: Array<{
    html: string
    target: string[]
    failureSummary: string
  }>
}

export interface AccessibilityReport {
  url: string
  timestamp: number
  violations: AccessibilityViolation[]
  passes: number
  incomplete: number
  inapplicable: number
  summary: {
    totalViolations: number
    criticalViolations: number
    seriousViolations: number
    moderateViolations: number
    minorViolations: number
    complianceScore: number
    wcagLevel: 'AA' | 'A' | 'Failed'
  }
  recommendations: string[]
}

class AccessibilityTester {
  private rules = {
    // WCAG 2.1 AA rules
    'color-contrast': { level: 'AA', impact: 'serious' },
    'keyboard': { level: 'AA', impact: 'serious' },
    'focus-order-semantics': { level: 'AA', impact: 'serious' },
    'aria-labels': { level: 'AA', impact: 'serious' },
    'heading-order': { level: 'AA', impact: 'moderate' },
    'landmark-roles': { level: 'AA', impact: 'moderate' },
    'link-purpose': { level: 'AA', impact: 'serious' },
    'form-labels': { level: 'AA', impact: 'serious' },
    'error-identification': { level: 'AA', impact: 'serious' },
    'resize-content': { level: 'AA', impact: 'serious' },
    'contrast-enhanced': { level: 'AAA', impact: 'moderate' }
  }

  /**
   * Test accessibility of a DOM element
   */
  async testElement(element: Element): Promise<Partial<AccessibilityReport>> {
    if (typeof window === 'undefined') {
      throw new Error('Accessibility testing requires a browser environment')
    }

    // This would typically use axe-core
    // For demonstration, we'll implement basic checks
    const violations: AccessibilityViolation[] = []
    let passes = 0

    // Check color contrast
    const contrastViolations = this.checkColorContrast(element)
    violations.push(...contrastViolations)

    // Check heading structure
    const headingViolations = this.checkHeadingStructure(element)
    violations.push(...headingViolations)

    // Check form labels
    const formViolations = this.checkFormLabels(element)
    violations.push(...formViolations)

    // Check ARIA attributes
    const ariaViolations = this.checkAriaAttributes(element)
    violations.push(...ariaViolations)

    // Check keyboard accessibility
    const keyboardViolations = this.checkKeyboardAccessibility(element)
    violations.push(...keyboardViolations)

    // Count passes (elements that don't have violations)
    passes = this.countAccessibleElements(element) - violations.length

    const summary = this.calculateSummary(violations, passes)

    return {
      timestamp: Date.now(),
      violations,
      passes,
      summary,
      recommendations: this.generateRecommendations(violations)
    }
  }

  /**
   * Check color contrast ratios
   */
  private checkColorContrast(element: Element): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = []
    const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label')

    textElements.forEach((el, index) => {
      const styles = window.getComputedStyle(el)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Simple contrast check (in real implementation, use proper contrast calculation)
      if (this.hasLowContrast(color, backgroundColor)) {
        violations.push({
          id: 'color-contrast',
          description: 'Elements must have sufficient color contrast',
          impact: 'serious',
          help: 'Ensure all text elements have a contrast ratio of at least 4.5:1',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
          nodes: [{
            html: el.outerHTML.substring(0, 100),
            target: [`${el.tagName.toLowerCase()}:nth-child(${index + 1})`],
            failureSummary: 'Element has insufficient color contrast'
          }]
        })
      }
    })

    return violations
  }

  /**
   * Check heading structure
   */
  private checkHeadingStructure(element: Element): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = []
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    let previousLevel = 0
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1))
      
      // Check for skipped heading levels
      if (level > previousLevel + 1) {
        violations.push({
          id: 'heading-order',
          description: 'Heading levels should not be skipped',
          impact: 'moderate',
          help: 'Ensure heading levels are used in sequential order',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
          nodes: [{
            html: heading.outerHTML,
            target: [`h${level}:nth-child(${index + 1})`],
            failureSummary: `Heading level h${level} follows h${previousLevel}, skipping levels`
          }]
        })
      }

      // Check for empty headings
      if (!heading.textContent?.trim()) {
        violations.push({
          id: 'empty-heading',
          description: 'Headings must have meaningful text',
          impact: 'serious',
          help: 'Ensure all headings have descriptive text',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
          nodes: [{
            html: heading.outerHTML,
            target: [`h${level}:nth-child(${index + 1})`],
            failureSummary: 'Heading element is empty'
          }]
        })
      }

      previousLevel = level
    })

    return violations
  }

  /**
   * Check form labels
   */
  private checkFormLabels(element: Element): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = []
    const formControls = element.querySelectorAll('input, select, textarea')

    formControls.forEach((control, index) => {
      const id = control.getAttribute('id')
      const ariaLabel = control.getAttribute('aria-label')
      const ariaLabelledby = control.getAttribute('aria-labelledby')
      const placeholder = control.getAttribute('placeholder')
      const type = control.getAttribute('type')

      // Skip hidden inputs
      if (type === 'hidden') return

      const hasLabel = id ? element.querySelector(`label[for="${id}"]`) : null
      const hasAccessibleName = ariaLabel || ariaLabelledby || hasLabel || placeholder

      if (!hasAccessibleName) {
        violations.push({
          id: 'form-labels',
          description: 'Form controls must have accessible names',
          impact: 'serious',
          help: 'Ensure all form controls have associated labels',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
          nodes: [{
            html: control.outerHTML,
            target: [`${control.tagName.toLowerCase()}:nth-child(${index + 1})`],
            failureSummary: 'Form control lacks accessible name'
          }]
        })
      }
    })

    return violations
  }

  /**
   * Check ARIA attributes
   */
  private checkAriaAttributes(element: Element): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = []
    const elementsWithAria = element.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]')

    elementsWithAria.forEach((el, index) => {
      const role = el.getAttribute('role')
      const ariaLabel = el.getAttribute('aria-label')
      const ariaLabelledby = el.getAttribute('aria-labelledby')
      const ariaDescribedby = el.getAttribute('aria-describedby')

      // Check for empty aria-label
      if (ariaLabel !== null && !ariaLabel.trim()) {
        violations.push({
          id: 'aria-labels',
          description: 'ARIA labels must not be empty',
          impact: 'serious',
          help: 'Ensure aria-label attributes have meaningful text',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
          nodes: [{
            html: el.outerHTML.substring(0, 100),
            target: [`${el.tagName.toLowerCase()}:nth-child(${index + 1})`],
            failureSummary: 'Element has empty aria-label'
          }]
        })
      }

      // Check for invalid ARIA references
      if (ariaLabelledby) {
        const referencedElements = ariaLabelledby.split(' ')
        referencedElements.forEach(refId => {
          if (!element.querySelector(`#${refId}`)) {
            violations.push({
              id: 'aria-labels',
              description: 'ARIA labelledby must reference existing elements',
              impact: 'serious',
              help: 'Ensure aria-labelledby references valid element IDs',
              helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
              nodes: [{
                html: el.outerHTML.substring(0, 100),
                target: [`${el.tagName.toLowerCase()}:nth-child(${index + 1})`],
                failureSummary: `aria-labelledby references non-existent element: ${refId}`
              }]
            })
          }
        })
      }
    })

    return violations
  }

  /**
   * Check keyboard accessibility
   */
  private checkKeyboardAccessibility(element: Element): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = []
    const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [tabindex]')

    interactiveElements.forEach((el, index) => {
      const tabindex = el.getAttribute('tabindex')
      const href = el.getAttribute('href')
      const disabled = el.hasAttribute('disabled')

      // Check for positive tabindex (anti-pattern)
      if (tabindex && parseInt(tabindex) > 0) {
        violations.push({
          id: 'keyboard',
          description: 'Avoid positive tabindex values',
          impact: 'serious',
          help: 'Use tabindex="0" or rely on natural tab order',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
          nodes: [{
            html: el.outerHTML.substring(0, 100),
            target: [`${el.tagName.toLowerCase()}:nth-child(${index + 1})`],
            failureSummary: `Element has positive tabindex: ${tabindex}`
          }]
        })
      }

      // Check for links without href
      if (el.tagName.toLowerCase() === 'a' && !href && !el.hasAttribute('role')) {
        violations.push({
          id: 'keyboard',
          description: 'Links must have valid href or appropriate role',
          impact: 'serious',
          help: 'Ensure links are keyboard accessible',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
          nodes: [{
            html: el.outerHTML.substring(0, 100),
            target: [`a:nth-child(${index + 1})`],
            failureSummary: 'Link element lacks href attribute'
          }]
        })
      }
    })

    return violations
  }

  /**
   * Simple contrast check (simplified implementation)
   */
  private hasLowContrast(color: string, backgroundColor: string): boolean {
    // This is a simplified check
    // In reality, you'd convert colors to RGB and calculate proper contrast ratio
    if (!color || !backgroundColor) return false
    if (color === backgroundColor) return true
    if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return true
    return false
  }

  /**
   * Count accessible elements
   */
  private countAccessibleElements(element: Element): number {
    const allElements = element.querySelectorAll('*')
    return allElements.length
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(violations: AccessibilityViolation[], passes: number) {
    const criticalViolations = violations.filter(v => v.impact === 'critical').length
    const seriousViolations = violations.filter(v => v.impact === 'serious').length
    const moderateViolations = violations.filter(v => v.impact === 'moderate').length
    const minorViolations = violations.filter(v => v.impact === 'minor').length
    const totalViolations = violations.length

    // Calculate compliance score (0-100)
    let complianceScore = 100
    complianceScore -= criticalViolations * 25
    complianceScore -= seriousViolations * 15
    complianceScore -= moderateViolations * 8
    complianceScore -= minorViolations * 3

    complianceScore = Math.max(0, complianceScore)

    // Determine WCAG level
    let wcagLevel: 'AA' | 'A' | 'Failed' = 'Failed'
    if (criticalViolations === 0 && seriousViolations === 0) {
      wcagLevel = 'AA'
    } else if (criticalViolations === 0) {
      wcagLevel = 'A'
    }

    return {
      totalViolations,
      criticalViolations,
      seriousViolations,
      moderateViolations,
      minorViolations,
      complianceScore,
      wcagLevel
    }
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(violations: AccessibilityViolation[]): string[] {
    const recommendations: string[] = []
    const violationTypes = new Set(violations.map(v => v.id))

    if (violationTypes.has('color-contrast')) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text)')
    }

    if (violationTypes.has('heading-order')) {
      recommendations.push('Use heading levels in sequential order (h1, h2, h3, etc.)')
    }

    if (violationTypes.has('form-labels')) {
      recommendations.push('Add proper labels to all form controls using <label> elements or aria-label attributes')
    }

    if (violationTypes.has('aria-labels')) {
      recommendations.push('Ensure all ARIA attributes have valid values and reference existing elements')
    }

    if (violationTypes.has('keyboard')) {
      recommendations.push('Make all interactive elements keyboard accessible and avoid positive tabindex values')
    }

    if (recommendations.length === 0) {
      recommendations.push('Great! No major accessibility issues found. Continue following WCAG 2.1 AA guidelines.')
    }

    return recommendations
  }
}

// Global accessibility tester instance
export const accessibilityTester = new AccessibilityTester()

// Hook for React components
export function useAccessibilityTester() {
  return {
    testElement: accessibilityTester.testElement.bind(accessibilityTester)
  }
}