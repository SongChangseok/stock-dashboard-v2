import { useMemo } from 'react'
import { useWindowSize } from './useWindowSize'

export interface ResponsiveBreakpoints {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isSmallMobile: boolean
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const { width } = useWindowSize()

  const breakpoints = useMemo(() => ({
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isSmallMobile: width < 375,
  }), [width])

  return breakpoints
}