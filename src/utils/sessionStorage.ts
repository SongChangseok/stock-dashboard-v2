/**
 * Session storage utilities for temporary data persistence
 */

// Session storage keys
export const SESSION_KEYS = {
  PORTFOLIO_DATA: 'portfolio_data',
  SELECTED_TARGET_PORTFOLIO: 'selected_target_portfolio',
  LAST_REFRESH: 'last_refresh',
  FORM_DRAFTS: 'form_drafts'
} as const

export interface SessionData {
  timestamp: number
  data: unknown
}

/**
 * Save data to session storage with timestamp
 */
export const saveToSession = <T>(key: string, data: T): void => {
  try {
    const sessionData: SessionData = {
      timestamp: Date.now(),
      data
    }
    sessionStorage.setItem(key, JSON.stringify(sessionData))
  } catch (error) {
    console.warn('Failed to save to session storage:', error)
  }
}

/**
 * Load data from session storage
 */
export const loadFromSession = <T>(key: string): T | null => {
  try {
    const stored = sessionStorage.getItem(key)
    if (!stored) return null
    
    const sessionData: SessionData = JSON.parse(stored)
    return sessionData.data as T
  } catch (error) {
    console.warn('Failed to load from session storage:', error)
    return null
  }
}

/**
 * Remove data from session storage
 */
export const removeFromSession = (key: string): void => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to remove from session storage:', error)
  }
}

/**
 * Clear all session storage data
 */
export const clearSession = (): void => {
  try {
    sessionStorage.clear()
  } catch (error) {
    console.warn('Failed to clear session storage:', error)
  }
}

/**
 * Check if session data is expired (older than maxAge in milliseconds)
 */
export const isSessionExpired = (key: string, maxAge: number): boolean => {
  try {
    const stored = sessionStorage.getItem(key)
    if (!stored) return true
    
    const sessionData: SessionData = JSON.parse(stored)
    return Date.now() - sessionData.timestamp > maxAge
  } catch {
    return true
  }
}

/**
 * Save form draft data for recovery
 */
export const saveFormDraft = (formName: string, data: unknown): void => {
  const drafts = loadFromSession<Record<string, unknown>>(SESSION_KEYS.FORM_DRAFTS) || {}
  drafts[formName] = data
  saveToSession(SESSION_KEYS.FORM_DRAFTS, drafts)
}

/**
 * Load form draft data
 */
export const loadFormDraft = <T>(formName: string): T | null => {
  const drafts = loadFromSession<Record<string, unknown>>(SESSION_KEYS.FORM_DRAFTS) || {}
  return (drafts[formName] as T) || null
}

/**
 * Clear form draft data
 */
export const clearFormDraft = (formName: string): void => {
  const drafts = loadFromSession<Record<string, unknown>>(SESSION_KEYS.FORM_DRAFTS) || {}
  delete drafts[formName]
  saveToSession(SESSION_KEYS.FORM_DRAFTS, drafts)
}