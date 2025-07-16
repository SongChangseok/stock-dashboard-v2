/**
 * Accessibility utilities for enhanced keyboard navigation and screen reader support
 * Provides ARIA attributes, keyboard navigation helpers, and focus management
 */

export interface A11yConfig {
  announceChanges: boolean
  enableKeyboardNavigation: boolean
  focusManagement: boolean
  highContrastSupport: boolean
}

export const DEFAULT_A11Y_CONFIG: A11yConfig = {
  announceChanges: true,
  enableKeyboardNavigation: true,
  focusManagement: true,
  highContrastSupport: true
}

/**
 * ARIA label helpers for common UI patterns
 */
export const getAriaLabels = {
  // Button labels
  button: {
    add: (item: string) => `Add ${item}`,
    edit: (item: string) => `Edit ${item}`,
    delete: (item: string) => `Delete ${item}`,
    save: () => 'Save changes',
    cancel: () => 'Cancel',
    close: () => 'Close',
    submit: () => 'Submit form',
    loading: () => 'Loading, please wait'
  },
  
  // Form labels
  form: {
    required: (label: string) => `${label} (required)`,
    optional: (label: string) => `${label} (optional)`,
    error: (field: string, error: string) => `${field}: ${error}`,
    success: (message: string) => `Success: ${message}`
  },
  
  // Navigation labels
  navigation: {
    menu: () => 'Main navigation menu',
    breadcrumb: () => 'Breadcrumb navigation',
    pagination: () => 'Pagination navigation',
    tab: (label: string, current: boolean) => current ? `${label} (current page)` : label,
    link: (destination: string) => `Navigate to ${destination}`
  },
  
  // Table labels
  table: {
    sortable: (column: string, direction?: 'asc' | 'desc') => 
      direction ? `${column}, sortable column, currently sorted ${direction === 'asc' ? 'ascending' : 'descending'}` : `${column}, sortable column`,
    row: (index: number, total: number) => `Row ${index + 1} of ${total}`,
    cell: (row: string, column: string) => `${column} for ${row}`,
    empty: () => 'No data available'
  },
  
  // Status labels
  status: {
    loading: () => 'Loading content',
    error: (message: string) => `Error: ${message}`,
    success: (message: string) => `Success: ${message}`,
    warning: (message: string) => `Warning: ${message}`,
    info: (message: string) => `Information: ${message}`
  },
  
  // Portfolio specific labels
  portfolio: {
    stock: (name: string, value: string, change: string) => 
      `${name}, current value ${value}, ${change.includes('-') ? 'down' : 'up'} ${change}`,
    allocation: (stock: string, percentage: string) => `${stock} allocation: ${percentage}`,
    performance: (period: string, returnValue: string) => `${period} return: ${returnValue}`
  }
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardNavigation = {
  // Common key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },
  
  // Navigation handlers
  handleArrowNavigation: (
    event: KeyboardEvent,
    elements: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    options: { wrap?: boolean; orientation?: 'horizontal' | 'vertical' } = {}
  ) => {
    const { wrap = true, orientation = 'vertical' } = options
    const isHorizontal = orientation === 'horizontal'
    
    let nextIndex = currentIndex
    
    switch (event.key) {
      case KeyboardNavigation.keys.ARROW_UP:
        if (!isHorizontal) {
          nextIndex = wrap && currentIndex === 0 ? elements.length - 1 : Math.max(0, currentIndex - 1)
          event.preventDefault()
        }
        break
      case KeyboardNavigation.keys.ARROW_DOWN:
        if (!isHorizontal) {
          nextIndex = wrap && currentIndex === elements.length - 1 ? 0 : Math.min(elements.length - 1, currentIndex + 1)
          event.preventDefault()
        }
        break
      case KeyboardNavigation.keys.ARROW_LEFT:
        if (isHorizontal) {
          nextIndex = wrap && currentIndex === 0 ? elements.length - 1 : Math.max(0, currentIndex - 1)
          event.preventDefault()
        }
        break
      case KeyboardNavigation.keys.ARROW_RIGHT:
        if (isHorizontal) {
          nextIndex = wrap && currentIndex === elements.length - 1 ? 0 : Math.min(elements.length - 1, currentIndex + 1)
          event.preventDefault()
        }
        break
      case KeyboardNavigation.keys.HOME:
        nextIndex = 0
        event.preventDefault()
        break
      case KeyboardNavigation.keys.END:
        nextIndex = elements.length - 1
        event.preventDefault()
        break
    }
    
    if (nextIndex !== currentIndex && elements[nextIndex]) {
      elements[nextIndex].focus()
      return nextIndex
    }
    
    return currentIndex
  },
  
  // Enter/Space activation
  handleActivation: (event: KeyboardEvent, callback: () => void) => {
    if (event.key === KeyboardNavigation.keys.ENTER || event.key === KeyboardNavigation.keys.SPACE) {
      event.preventDefault()
      callback()
    }
  },
  
  // Escape handling
  handleEscape: (event: KeyboardEvent, callback: () => void) => {
    if (event.key === KeyboardNavigation.keys.ESCAPE) {
      event.preventDefault()
      callback()
    }
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private focusStack: HTMLElement[] = []
  private trapElement: HTMLElement | null = null
  private focusableElements: HTMLElement[] = []
  
  // Focusable element selectors
  private static FOCUSABLE_SELECTORS = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')
  
  /**
   * Save current focus and optionally set new focus
   */
  saveFocus(newFocusElement?: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus) {
      this.focusStack.push(currentFocus)
    }
    
    if (newFocusElement) {
      newFocusElement.focus()
    }
  }
  
  /**
   * Restore previously saved focus
   */
  restoreFocus() {
    const previousFocus = this.focusStack.pop()
    if (previousFocus && document.contains(previousFocus)) {
      previousFocus.focus()
    }
  }
  
  /**
   * Trap focus within an element (for modals, dropdowns)
   */
  trapFocus(element: HTMLElement) {
    this.trapElement = element
    this.focusableElements = Array.from(
      element.querySelectorAll(FocusManager.FOCUSABLE_SELECTORS)
    ) as HTMLElement[]
    
    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus()
    }
    
    // Add event listener for tab trapping
    document.addEventListener('keydown', this.handleFocusTrap)
  }
  
  /**
   * Release focus trap
   */
  releaseFocusTrap() {
    document.removeEventListener('keydown', this.handleFocusTrap)
    this.trapElement = null
    this.focusableElements = []
  }
  
  /**
   * Handle focus trap navigation
   */
  private handleFocusTrap = (event: KeyboardEvent): void => {
    if (!this.trapElement || event.key !== KeyboardNavigation.keys.TAB) return
    
    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }
  
  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(FocusManager.FOCUSABLE_SELECTORS)
    ) as HTMLElement[]
  }
  
  /**
   * Check if element is currently visible and focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute('disabled') || element.getAttribute('tabindex') === '-1') {
      return false
    }
    
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
  }
}

/**
 * Screen reader announcement utilities
 */
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer
  private liveRegion: HTMLElement | null = null
  
  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer()
    }
    return ScreenReaderAnnouncer.instance
  }
  
  constructor() {
    this.createLiveRegion()
  }
  
  private createLiveRegion() {
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.setAttribute('aria-relevant', 'text')
    this.liveRegion.style.position = 'absolute'
    this.liveRegion.style.left = '-9999px'
    this.liveRegion.style.width = '1px'
    this.liveRegion.style.height = '1px'
    this.liveRegion.style.overflow = 'hidden'
    
    document.body.appendChild(this.liveRegion)
  }
  
  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return
    
    this.liveRegion.setAttribute('aria-live', priority)
    this.liveRegion.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = ''
      }
    }, 1000)
  }
  
  /**
   * Announce loading state
   */
  announceLoading(message: string = 'Loading') {
    this.announce(`${message}, please wait`, 'polite')
  }
  
  /**
   * Announce completion
   */
  announceComplete(message: string = 'Action completed') {
    this.announce(message, 'polite')
  }
  
  /**
   * Announce error
   */
  announceError(message: string) {
    this.announce(`Error: ${message}`, 'assertive')
  }
}

/**
 * High contrast and reduced motion support
 */
export const AccessibilityPreferences = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  /**
   * Check if user prefers high contrast
   */
  prefersHighContrast: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches
  },
  
  /**
   * Check if user prefers dark theme
   */
  prefersDarkTheme: (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  
  /**
   * Apply accessibility preferences to element
   */
  applyPreferences: (element: HTMLElement) => {
    if (AccessibilityPreferences.prefersReducedMotion()) {
      element.style.animation = 'none'
      element.style.transition = 'none'
    }
    
    if (AccessibilityPreferences.prefersHighContrast()) {
      element.classList.add('high-contrast')
    }
  }
}

/**
 * Global focus manager instance
 */
export const globalFocusManager = new FocusManager()

/**
 * Global screen reader announcer instance
 */
export const announcer = ScreenReaderAnnouncer.getInstance()