import { useEffect, useRef, useCallback } from 'react'
import { 
  TouchGestureDetector, 
  triggerHapticFeedback, 
  preventDoubleTabZoom, 
  manageTouchFocus,
  optimizeScrollPerformance,
  TOUCH_CONFIG,
  type SwipeDirection
} from '../utils/touchOptimization'

export interface UseTouchOptimizationOptions {
  onTap?: () => void
  onLongPress?: () => void
  onSwipe?: (direction: SwipeDirection) => void
  enableHapticFeedback?: boolean
  preventDoubleTabZoom?: boolean
  optimizeScroll?: boolean
  manageFocus?: boolean
}

/**
 * Hook for optimizing touch interactions on elements
 */
export const useTouchOptimization = <T extends HTMLElement = HTMLElement>(
  options: UseTouchOptimizationOptions = {}
) => {
  const ref = useRef<T>(null)
  const gestureDetectorRef = useRef<TouchGestureDetector | null>(null)
  const focusManagerRef = useRef<(() => void) | null>(null)

  const {
    onTap,
    onLongPress,
    onSwipe,
    enableHapticFeedback = false,
    preventDoubleTabZoom: preventZoom = false,
    optimizeScroll = false,
    manageFocus = true
  } = options

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Clean up previous instances
    gestureDetectorRef.current?.destroy()
    focusManagerRef.current?.()

    // Setup gesture detection
    if (onTap || onLongPress || onSwipe) {
      gestureDetectorRef.current = new TouchGestureDetector(element, {
        onTap: onTap ? () => {
          if (enableHapticFeedback) {
            triggerHapticFeedback('selection')
          }
          onTap()
        } : undefined,
        onLongPress: onLongPress ? () => {
          if (enableHapticFeedback) {
            triggerHapticFeedback('medium')
          }
          onLongPress()
        } : undefined,
        onSwipe: onSwipe ? (direction) => {
          if (enableHapticFeedback) {
            triggerHapticFeedback('light')
          }
          onSwipe(direction)
        } : undefined
      })
    }

    // Setup focus management
    if (manageFocus) {
      focusManagerRef.current = manageTouchFocus(element)
    }

    // Prevent double tap zoom
    if (preventZoom) {
      preventDoubleTabZoom(element)
    }

    // Optimize scroll performance
    if (optimizeScroll) {
      optimizeScrollPerformance(element)
    }

    return () => {
      gestureDetectorRef.current?.destroy()
      focusManagerRef.current?.()
    }
  }, [onTap, onLongPress, onSwipe, enableHapticFeedback, preventZoom, optimizeScroll, manageFocus])

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    if (enableHapticFeedback) {
      triggerHapticFeedback(type)
    }
  }, [enableHapticFeedback])

  return {
    ref,
    triggerHaptic
  }
}

/**
 * Hook for swipe navigation between pages/tabs
 */
export const useSwipeNavigation = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options: { threshold?: number; enableHapticFeedback?: boolean } = {}
) => {
  const { threshold = TOUCH_CONFIG.swipeThreshold, enableHapticFeedback = false } = options

  return useTouchOptimization({
    onSwipe: (direction) => {
      if (direction.direction === 'left' && direction.distance > threshold) {
        onSwipeLeft?.()
      } else if (direction.direction === 'right' && direction.distance > threshold) {
        onSwipeRight?.()
      }
    },
    enableHapticFeedback
  })
}

/**
 * Hook for touch-optimized button interactions
 */
export const useTouchButton = <T extends HTMLButtonElement = HTMLButtonElement>(
  onClick?: () => void,
  options: {
    onLongPress?: () => void
    enableHapticFeedback?: boolean
    preventDoubleTabZoom?: boolean
  } = {}
) => {
  const {
    onLongPress,
    enableHapticFeedback = true,
    preventDoubleTabZoom = true
  } = options

  return useTouchOptimization<T>({
    onTap: onClick,
    onLongPress,
    enableHapticFeedback,
    preventDoubleTabZoom,
    manageFocus: true
  })
}

/**
 * Hook for touch-optimized list/scroll containers
 */
export const useTouchList = <T extends HTMLElement = HTMLDivElement>(
  onItemSwipe?: (direction: SwipeDirection, index: number) => void,
  options: { 
    enableHapticFeedback?: boolean
    optimizeScroll?: boolean 
  } = {}
) => {
  const { 
    enableHapticFeedback = false, 
    optimizeScroll = true 
  } = options

  return useTouchOptimization<T>({
    onSwipe: onItemSwipe ? (direction) => {
      // For list items, we'd need additional logic to determine which item was swiped
      // This is a simplified version
      onItemSwipe(direction, 0)
    } : undefined,
    enableHapticFeedback,
    optimizeScroll
  })
}

/**
 * Hook for detecting device capabilities
 */
export const useDeviceCapabilities = () => {
  const hasTouchScreen = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])

  const hasHapticFeedback = useCallback(() => {
    return 'vibrate' in navigator || 'hapticEngine' in window
  }, [])

  const isIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }, [])

  const isAndroid = useCallback(() => {
    return /Android/.test(navigator.userAgent)
  }, [])

  const isMobile = useCallback(() => {
    return hasTouchScreen() && window.innerWidth < 768
  }, [hasTouchScreen])

  return {
    hasTouchScreen: hasTouchScreen(),
    hasHapticFeedback: hasHapticFeedback(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isMobile: isMobile()
  }
}