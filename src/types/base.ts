/**
 * Base type definitions for the application
 * These types provide common interfaces that can be extended by specific domain types
 */

// Base Chart Data interface
export interface BaseChartData {
  name: string
  value: number
  color: string
}

// Extended Chart Data with additional properties
export interface ChartData extends BaseChartData {
  percentage: number
}

// Base Validation Result interface
export interface BaseValidationResult {
  isValid: boolean
  errors: string[]
}

// Extended Validation Result with warnings
export interface ValidationResult extends BaseValidationResult {
  warnings?: string[]
}

// Action types for trading operations
export type ActionType = 'buy' | 'sell' | 'hold'

// Base Entity interface for database entities
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// User Entity interface
export interface UserEntity extends BaseEntity {
  user_id: string
}

// Base Service Response interface
export interface BaseServiceResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Base List Response interface
export interface BaseListResponse<T> extends BaseServiceResponse<T[]> {
  total?: number
  page?: number
  limit?: number
}

// Base Form Data interface
export interface BaseFormData {
  [key: string]: string | number | boolean | null | undefined
}

// Base Component Props interface
export interface BaseComponentProps {
  className?: string
  testId?: string
}

// Loading State interface
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Async State interface
export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// Color theme interface
export interface ColorTheme {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
}

// Responsive breakpoints
export type BreakpointType = 'mobile' | 'tablet' | 'desktop'

// Sort order
export type SortOrder = 'asc' | 'desc'

// Generic filter interface
export interface BaseFilter {
  field: string
  value: unknown
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in'
}

// Generic sort interface
export interface BaseSort {
  field: string
  order: SortOrder
}

// Generic pagination interface
export interface BasePagination {
  page: number
  limit: number
  total?: number
}

// Generic query interface
export interface BaseQuery {
  filters?: BaseFilter[]
  sort?: BaseSort[]
  pagination?: BasePagination
}

