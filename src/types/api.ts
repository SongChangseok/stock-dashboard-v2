// Stock API types
export interface CreateStockData {
  stock_name: string
  ticker?: string
  quantity: number
  purchase_price: number
  current_price: number
}

export interface UpdateStockData extends Partial<CreateStockData> {
  id: string
}

// Generic API response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// Validation types
export type { ValidationResult } from './base'