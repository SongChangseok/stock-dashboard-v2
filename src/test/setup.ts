import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(matchers)
expect.extend(toHaveNoViolations)

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock getComputedStyle for JSDOM
window.getComputedStyle = (_element: Element, _pseudoElt?: string | null) => {
  // Return a mock style object
  return {
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(0, 0, 0)',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '16px',
    paddingRight: '16px',
    outline: 'none',
    boxShadow: 'none',
    borderColor: 'rgb(255, 255, 255)',
    getPropertyValue: (prop: string) => {
      const defaults: Record<string, string> = {
        'border-color': 'rgb(255, 255, 255)',
        'padding-top': '12px',
        'padding-bottom': '12px',
        'padding-left': '16px',
        'padding-right': '16px',
        'color': 'rgb(255, 255, 255)',
        'background-color': 'rgb(0, 0, 0)'
      }
      return defaults[prop] || ''
    }
  } as CSSStyleDeclaration
}

afterEach(() => {
  cleanup()
})