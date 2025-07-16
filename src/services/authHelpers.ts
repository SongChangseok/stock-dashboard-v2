/**
 * Shared authentication helper functions
 * Provides common authentication patterns used across services
 * @deprecated Use AuthService instead
 */

import { authService } from './authService'

/**
 * Get current user ID
 * @returns Current user ID
 * @throws Error if user is not authenticated
 * @deprecated Use authService.getCurrentUserId() instead
 */
export const getCurrentUserId = async (): Promise<string> => {
  return authService.getCurrentUserId()
}
