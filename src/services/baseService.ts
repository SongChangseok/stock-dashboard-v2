import { supabase } from './supabase'
import { getCurrentUserId } from './authHelpers'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface BaseServiceError {
  message: string
  code?: string
  details?: unknown
}

export interface BaseServiceConfig {
  tableName: string
  userIdField?: string
  requiredFields?: string[]
}

export abstract class BaseService<T extends { id: string }, CreateT, UpdateT> {
  protected client: SupabaseClient
  protected tableName: string
  protected userIdField: string
  protected requiredFields: string[]

  constructor(config: BaseServiceConfig) {
    this.client = supabase
    this.tableName = config.tableName
    this.userIdField = config.userIdField || 'user_id'
    this.requiredFields = config.requiredFields || []
  }

  /**
   * Get all records for the current user
   */
  async getAll(): Promise<T[]> {
    try {
      const userId = await getCurrentUserId()
      
      const query = this.client
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      // Only filter by user_id if userIdField is specified
      if (this.userIdField) {
        query.eq(this.userIdField, userId)
      }

      const { data, error } = await query

      if (error) {
        throw this.createError(`Failed to fetch ${this.tableName}`, error)
      }

      return this.transformFromDatabase(data || [])
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(`Unexpected error fetching ${this.tableName}`, error)
    }
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const userId = await getCurrentUserId()
      
      const query = this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)

      // Only filter by user_id if userIdField is specified
      if (this.userIdField) {
        query.eq(this.userIdField, userId)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw this.createError(`Failed to fetch ${this.tableName}`, error)
      }

      return this.transformFromDatabase([data])[0] || null
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(`Unexpected error fetching ${this.tableName}`, error)
    }
  }

  /**
   * Create a new record
   */
  async create(data: CreateT): Promise<T> {
    try {
      const userId = await getCurrentUserId()
      
      // Validate required fields
      this.validateRequiredFields(data)

      const insertData = this.userIdField 
        ? { ...data, [this.userIdField]: userId }
        : data

      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(this.prepareForDatabase(insertData))
        .select()
        .single()

      if (error) {
        throw this.createError(`Failed to create ${this.tableName}`, error)
      }

      return this.transformFromDatabase([result])[0]
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(`Unexpected error creating ${this.tableName}`, error)
    }
  }

  /**
   * Update an existing record
   */
  async update(data: UpdateT & { id: string }): Promise<T> {
    try {
      const userId = await getCurrentUserId()
      const { id, ...updateFields } = data
      
      let query = this.client
        .from(this.tableName)
        .update(this.prepareForDatabase(updateFields))
        .eq('id', id)

      // Only filter by user_id if userIdField is specified
      if (this.userIdField) {
        query = query.eq(this.userIdField, userId)
      }

      const { data: result, error } = await query.select().single()

      if (error) {
        throw this.createError(`Failed to update ${this.tableName}`, error)
      }

      return this.transformFromDatabase([result])[0]
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(`Unexpected error updating ${this.tableName}`, error)
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const userId = await getCurrentUserId()
      
      const query = this.client
        .from(this.tableName)
        .delete()
        .eq('id', id)

      // Only filter by user_id if userIdField is specified
      if (this.userIdField) {
        query.eq(this.userIdField, userId)
      }

      const { error } = await query

      if (error) {
        throw this.createError(`Failed to delete ${this.tableName}`, error)
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw this.createError(`Unexpected error deleting ${this.tableName}`, error)
    }
  }

  /**
   * Create a standardized error
   */
  protected createError(message: string, originalError?: unknown): Error {
    const error = new Error(message)
    
    if (originalError && typeof originalError === 'object' && originalError !== null) {
      const details = originalError as { message?: string; code?: string; details?: unknown }
      if (details.message) {
        error.message = `${message}: ${details.message}`
      }
      // Attach additional error details
      Object.assign(error, { 
        code: details.code,
        details: details.details,
        originalError
      })
    }
    
    return error
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields(data: unknown): void {
    if (this.requiredFields.length === 0) return

    const record = data as Record<string, unknown>
    const missingFields = this.requiredFields.filter(field => 
      record[field] === undefined || record[field] === null || record[field] === ''
    )

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
  }

  /**
   * Transform database records to domain objects
   * Override this method in subclasses for custom transformations
   */
  protected transformFromDatabase(data: unknown[]): T[] {
    return data as T[]
  }

  /**
   * Prepare data for database insertion/update
   * Override this method in subclasses for custom transformations
   */
  protected prepareForDatabase(data: unknown): unknown {
    return data
  }
}

export default BaseService