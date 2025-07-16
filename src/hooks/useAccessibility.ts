import { useEffect, useRef, useCallback, useState } from 'react'
import { 
  KeyboardNavigation, 
  FocusManager, 
  announcer, 
  globalFocusManager,
  AccessibilityPreferences,
  getAriaLabels,
  type A11yConfig,
  DEFAULT_A11Y_CONFIG 
} from '../utils/accessibility'

/**
 * Hook for keyboard navigation in lists or grids
 */
export const useKeyboardNavigation = <T extends HTMLElement>(
  orientation: 'horizontal' | 'vertical' = 'vertical',
  options: { wrap?: boolean; autoFocus?: boolean } = {}
) => {
  const containerRef = useRef<T>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([])

  const { wrap = true, autoFocus = false } = options

  // Update focusable elements when container changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateFocusableElements = () => {
      const elements = FocusManager.getFocusableElements(container)
      setFocusableElements(elements)
      
      if (autoFocus && elements.length > 0 && currentIndex < elements.length) {
        elements[currentIndex]?.focus()
      }
    }

    updateFocusableElements()

    // Create observer for dynamic content
    const observer = new MutationObserver(updateFocusableElements)
    observer.observe(container, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [autoFocus, currentIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (focusableElements.length === 0) return

    const newIndex = KeyboardNavigation.handleArrowNavigation(
      event,
      focusableElements,
      currentIndex,
      { wrap, orientation }
    )

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
  }, [focusableElements, currentIndex, wrap, orientation])

  // Attach keyboard event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    ref: containerRef,
    currentIndex,
    setCurrentIndex,
    focusableElements
  }
}

/**
 * Hook for managing focus traps (modals, dropdowns, etc.)
 */
export const useFocusTrap = <T extends HTMLElement>(isActive: boolean = true) => {
  const ref = useRef<T>(null)
  const focusManager = useRef(new FocusManager())

  useEffect(() => {
    const element = ref.current
    if (!element || !isActive) return

    const manager = focusManager.current
    
    // Save current focus and trap focus in element
    manager.saveFocus()
    manager.trapFocus(element)

    return () => {
      manager.releaseFocusTrap()
      manager.restoreFocus()
    }
  }, [isActive])

  return ref
}

/**
 * Hook for screen reader announcements
 */
export const useAnnouncer = () => {
  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    announcer.announce(message, priority)
  }, [])

  const announceLoading = useCallback((message?: string) => {
    announcer.announceLoading(message)
  }, [])

  const announceComplete = useCallback((message?: string) => {
    announcer.announceComplete(message)
  }, [])

  const announceError = useCallback((message: string) => {
    announcer.announceError(message)
  }, [])

  return {
    announce,
    announceLoading,
    announceComplete,
    announceError
  }
}

/**
 * Hook for accessible button/interactive element
 */
export const useAccessibleButton = <T extends HTMLElement>(
  onClick?: () => void,
  options: {
    ariaLabel?: string
    role?: string
    disabled?: boolean
    announceAction?: string
  } = {}
) => {
  const ref = useRef<T>(null)
  const { announce } = useAnnouncer()
  const { ariaLabel, role = 'button', disabled = false, announceAction } = options

  const handleClick = useCallback(() => {
    if (disabled) return
    
    onClick?.()
    
    if (announceAction) {
      announce(announceAction, 'polite')
    }
  }, [onClick, disabled, announce, announceAction])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    KeyboardNavigation.handleActivation(event, handleClick)
  }, [handleClick])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Set ARIA attributes
    if (ariaLabel) {
      element.setAttribute('aria-label', ariaLabel)
    }
    element.setAttribute('role', role)
    element.setAttribute('tabindex', disabled ? '-1' : '0')
    element.setAttribute('aria-disabled', disabled.toString())

    // Add event listeners
    element.addEventListener('keydown', handleKeyDown)

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [ariaLabel, role, disabled, handleKeyDown])

  return {
    ref,
    handleClick,
    'aria-label': ariaLabel,
    'role': role,
    'tabIndex': disabled ? -1 : 0,
    'aria-disabled': disabled
  }
}

/**
 * Hook for accessible form fields
 */
export const useAccessibleField = (
  fieldId: string,
  options: {
    label?: string
    required?: boolean
    error?: string
    description?: string
  } = {}
) => {
  const { label, required = false, error, description } = options
  const { announce } = useAnnouncer()

  const fieldProps = {
    id: fieldId,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': [
      description ? `${fieldId}-description` : '',
      error ? `${fieldId}-error` : ''
    ].filter(Boolean).join(' ') || undefined
  }

  const labelProps = {
    htmlFor: fieldId,
    children: required ? getAriaLabels.form.required(label || '') : label
  }

  const errorProps = error ? {
    id: `${fieldId}-error`,
    role: 'alert',
    'aria-live': 'polite',
    children: error
  } : {}

  const descriptionProps = description ? {
    id: `${fieldId}-description`,
    children: description
  } : {}

  // Announce errors when they change
  useEffect(() => {
    if (error) {
      announce(getAriaLabels.form.error(label || 'Field', error), 'assertive')
    }
  }, [error, label, announce])

  return {
    fieldProps,
    labelProps,
    errorProps,
    descriptionProps
  }
}

/**
 * Hook for accessible data tables
 */
export const useAccessibleTable = (
  data: unknown[],
  columns: Array<{
    key: string
    label: string
    sortable?: boolean
  }>
) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const { announce } = useAnnouncer()

  const handleSort = useCallback((columnKey: string) => {
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortColumn(columnKey)
    setSortDirection(newDirection)
    
    const column = columns.find(col => col.key === columnKey)
    if (column) {
      announce(`Table sorted by ${column.label}, ${newDirection === 'asc' ? 'ascending' : 'descending'}`)
    }
  }, [sortColumn, sortDirection, columns, announce])

  const getColumnHeaderProps = useCallback((column: { key: string; label: string; sortable?: boolean }): Record<string, unknown> => {
    const isSorted = sortColumn === column.key
    
    return {
      'aria-label': column.sortable 
        ? getAriaLabels.table.sortable(column.label, isSorted ? sortDirection : undefined)
        : column.label,
      'aria-sort': column.sortable && isSorted 
        ? (sortDirection === 'asc' ? 'ascending' : 'descending')
        : undefined,
      tabIndex: column.sortable ? 0 : undefined,
      role: column.sortable ? 'columnheader button' : 'columnheader',
      onClick: column.sortable ? () => handleSort(column.key) : undefined,
      onKeyDown: column.sortable ? (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleSort(column.key)
        }
      } : undefined
    }
  }, [sortColumn, sortDirection, handleSort])

  const getRowProps = useCallback((index: number) => ({
    'aria-label': getAriaLabels.table.row(index, data.length)
  }), [data.length])

  const tableProps = {
    role: 'table',
    'aria-label': data.length === 0 ? getAriaLabels.table.empty() : `Data table with ${data.length} rows`
  }

  return {
    tableProps,
    getColumnHeaderProps,
    getRowProps,
    sortColumn,
    sortDirection
  }
}

/**
 * Hook for accessibility preferences
 */
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: AccessibilityPreferences.prefersReducedMotion(),
    prefersHighContrast: AccessibilityPreferences.prefersHighContrast(),
    prefersDarkTheme: AccessibilityPreferences.prefersDarkTheme()
  })

  useEffect(() => {
    const mediaQueries = [
      { 
        query: '(prefers-reduced-motion: reduce)', 
        key: 'prefersReducedMotion' as const 
      },
      { 
        query: '(prefers-contrast: high)', 
        key: 'prefersHighContrast' as const 
      },
      { 
        query: '(prefers-color-scheme: dark)', 
        key: 'prefersDarkTheme' as const 
      }
    ]

    const listeners = mediaQueries.map(({ query, key }) => {
      const mediaQuery = window.matchMedia(query)
      const handler = (e: MediaQueryListEvent) => {
        setPreferences(prev => ({ ...prev, [key]: e.matches }))
      }
      
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    })

    return () => {
      listeners.forEach(cleanup => cleanup())
    }
  }, [])

  return preferences
}

/**
 * Hook for comprehensive accessibility setup
 */
export const useAccessibility = (config: Partial<A11yConfig> = {}) => {
  const finalConfig = { ...DEFAULT_A11Y_CONFIG, ...config }
  const { announce } = useAnnouncer()
  const preferences = useAccessibilityPreferences()

  // Apply global accessibility styles
  useEffect(() => {
    const root = document.documentElement

    if (preferences.prefersReducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.style.setProperty('--transition-duration', '0.01ms')
    }

    if (preferences.prefersHighContrast) {
      root.classList.add('high-contrast')
    }
  }, [preferences])

  return {
    config: finalConfig,
    preferences,
    announce,
    focusManager: globalFocusManager,
    announcer
  }
}