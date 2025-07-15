/**
 * Shared authentication helper functions
 * Provides common authentication patterns used across services
 */

import { supabase } from './supabase'

/**
 * Get current user ID
 * @returns Current user ID
 * @throws Error if user is not authenticated
 */
export const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  return user.id
}