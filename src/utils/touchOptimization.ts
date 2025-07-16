/**
 * Touch optimization utilities for enhanced mobile experience
 * Provides enhanced touch interactions, gesture handling, and mobile-specific optimizations
 */


export interface TouchConfig {
  minTouchTarget: number
  tapDelay: number
  swipeThreshold: number
  longPressDelay: number
}

export const TOUCH_CONFIG: TouchConfig = {
  minTouchTarget: 44, // iOS Human Interface Guidelines minimum
  tapDelay: 300, // Delay to distinguish tap from double tap
  swipeThreshold: 50, // Minimum distance for swipe detection
  longPressDelay: 500 // Long press activation time
}

/**
 * Touch-optimized button classes for different sizes
 */
export const getTouchButtonClasses = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseClasses = 'select-none touch-manipulation active:scale-95 transition-transform duration-150'
  
  const sizeClasses = {
    sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm',
    md: 'min-h-[44px] min-w-[44px] px-4 py-3 text-base',
    lg: 'min-h-[48px] min-w-[48px] px-6 py-4 text-lg'
  }
  
  return `${baseClasses} ${sizeClasses[size]}`
}

/**
 * Enhanced touch ripple effect for better feedback
 */
export const addTouchRipple = (element: HTMLElement, event: TouchEvent | MouseEvent) => {
  const rect = element.getBoundingClientRect()
  const ripple = document.createElement('span')
  
  // Calculate ripple position
  const x = (event instanceof TouchEvent ? event.touches[0].clientX : event.clientX) - rect.left
  const y = (event instanceof TouchEvent ? event.touches[0].clientY : event.clientY) - rect.top
  
  // Style the ripple
  ripple.className = 'absolute rounded-full bg-white/20 pointer-events-none animate-ping'
  ripple.style.left = `${x - 10}px`
  ripple.style.top = `${y - 10}px`
  ripple.style.width = '20px'
  ripple.style.height = '20px'
  
  // Add to element
  element.style.position = 'relative'
  element.style.overflow = 'hidden'
  element.appendChild(ripple)
  
  // Remove after animation
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple)
    }
  }, 600)
}

/**
 * Touch gesture detection
 */
export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  duration: number
}

export class TouchGestureDetector {
  private startTouch: Touch | null = null
  private startTime: number = 0
  private element: HTMLElement
  private onSwipe?: (direction: SwipeDirection) => void
  private onLongPress?: () => void
  private onTap?: () => void
  
  private longPressTimer: number | null = null
  private isSwiping = false
  private hasMoved = false

  constructor(
    element: HTMLElement,
    options: {
      onSwipe?: (direction: SwipeDirection) => void
      onLongPress?: () => void
      onTap?: () => void
    }
  ) {
    this.element = element
    this.onSwipe = options.onSwipe
    this.onLongPress = options.onLongPress
    this.onTap = options.onTap
    
    this.bindEvents()
  }

  private bindEvents() {
    // Passive listeners for better performance
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })
  }

  private handleTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return
    
    this.startTouch = event.touches[0]
    this.startTime = Date.now()
    this.hasMoved = false
    this.isSwiping = false
    
    // Start long press timer
    if (this.onLongPress) {
      this.longPressTimer = window.setTimeout(() => {
        if (!this.hasMoved && this.onLongPress) {
          this.onLongPress()
          this.clearLongPressTimer()
        }
      }, TOUCH_CONFIG.longPressDelay)
    }
    
    // Add ripple effect
    addTouchRipple(this.element, event)
  }

  private handleTouchMove(event: TouchEvent) {
    if (!this.startTouch || event.touches.length !== 1) return
    
    const touch = event.touches[0]
    const deltaX = touch.clientX - this.startTouch.clientX
    const deltaY = touch.clientY - this.startTouch.clientY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > 10) {
      this.hasMoved = true
      this.clearLongPressTimer()
    }
    
    if (distance > TOUCH_CONFIG.swipeThreshold) {
      this.isSwiping = true
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    if (!this.startTouch) return
    
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - this.startTouch.clientX
    const deltaY = touch.clientY - this.startTouch.clientY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = Date.now() - this.startTime
    
    this.clearLongPressTimer()
    
    if (this.isSwiping && this.onSwipe) {
      // Determine swipe direction
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)
      
      let direction: 'left' | 'right' | 'up' | 'down'
      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }
      
      this.onSwipe({
        direction,
        distance,
        duration
      })
    } else if (!this.hasMoved && this.onTap && duration < TOUCH_CONFIG.tapDelay) {
      // Simple tap
      this.onTap()
    }
    
    this.reset()
  }

  private handleTouchCancel() {
    this.clearLongPressTimer()
    this.reset()
  }

  private clearLongPressTimer() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  private reset() {
    this.startTouch = null
    this.startTime = 0
    this.hasMoved = false
    this.isSwiping = false
  }

  public destroy() {
    this.clearLongPressTimer()
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
  }
}

/**
 * Haptic feedback for supported devices
 */
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
  // Check if haptic feedback is supported
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [40],
      selection: [5]
    }
    
    navigator.vibrate(patterns[type])
  }
  
  // iOS Haptic Feedback (if available)
  if ('hapticEngine' in window) {
    const hapticTypes = {
      light: 'impactOccurred',
      medium: 'impactOccurred',
      heavy: 'impactOccurred', 
      selection: 'selectionChanged'
    }
    
    try {
      // @ts-expect-error - iOS specific API not in standard types
      window.hapticEngine[hapticTypes[type]]?.()
    } catch {
      // Fallback to vibration
      if ('vibrate' in navigator) {
        navigator.vibrate([10])
      }
    }
  }
}

/**
 * Prevent zoom on double tap for better touch experience
 */
export const preventDoubleTabZoom = (element: HTMLElement) => {
  let lastTouchEnd = 0
  
  element.addEventListener('touchend', (event) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, { passive: false })
}

/**
 * Optimize scroll performance for touch devices
 */
export const optimizeScrollPerformance = (element: HTMLElement) => {
  // Add momentum scrolling for iOS
  const style = element.style as CSSStyleDeclaration & { webkitOverflowScrolling?: string }
  style.webkitOverflowScrolling = 'touch'
  element.style.overscrollBehavior = 'contain'
  
  // Add scroll snap for better UX
  if (element.children.length > 0) {
    element.style.scrollSnapType = 'y mandatory'
    Array.from(element.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.scrollSnapAlign = 'start'
      }
    })
  }
}

/**
 * Touch-safe focus management
 */
export const manageTouchFocus = (element: HTMLElement) => {
  let isTouch = false
  
  const handleTouchStart = () => {
    isTouch = true
  }
  
  const handleMouseDown = () => {
    isTouch = false
  }
  
  const handleFocus = () => {
    if (isTouch) {
      element.blur()
    }
  }
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('mousedown', handleMouseDown)
  element.addEventListener('focus', handleFocus)
  
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('mousedown', handleMouseDown)
    element.removeEventListener('focus', handleFocus)
  }
}


export interface UseTouchOptimizedButtonOptions {
  onTap?: () => void
  onLongPress?: () => void
  enableHapticFeedback?: boolean
  preventDoubleTabZoom?: boolean
}

// Note: Actual React integration is in the hooks file