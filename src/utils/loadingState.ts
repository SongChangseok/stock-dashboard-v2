/**
 * Loading state management utilities
 * Provides consistent loading state handling across the application
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface LoadingStateManager {
  state: LoadingState
  error: string | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  isIdle: boolean
}

/**
 * Create a loading state manager
 */
export const createLoadingState = (initialState: LoadingState = 'idle'): LoadingStateManager => {
  return {
    state: initialState,
    error: null,
    isLoading: initialState === 'loading',
    isError: initialState === 'error',
    isSuccess: initialState === 'success',
    isIdle: initialState === 'idle'
  }
}

/**
 * Update loading state
 */
export const updateLoadingState = (
  _current: LoadingStateManager,
  newState: LoadingState,
  error: string | null = null
): LoadingStateManager => {
  return {
    state: newState,
    error: newState === 'error' ? error : null,
    isLoading: newState === 'loading',
    isError: newState === 'error',
    isSuccess: newState === 'success',
    isIdle: newState === 'idle'
  }
}

/**
 * Loading state hooks for async operations
 */
export class AsyncLoadingManager {
  private states: Map<string, LoadingStateManager> = new Map()
  private listeners: Map<string, Array<(state: LoadingStateManager) => void>> = new Map()

  /**
   * Get loading state for a specific operation
   */
  getState(operationId: string): LoadingStateManager {
    return this.states.get(operationId) || createLoadingState()
  }

  /**
   * Set loading state for a specific operation
   */
  setState(operationId: string, state: LoadingState, error: string | null = null): void {
    const currentState = this.getState(operationId)
    const newState = updateLoadingState(currentState, state, error)
    
    this.states.set(operationId, newState)
    
    // Notify listeners
    const listeners = this.listeners.get(operationId) || []
    listeners.forEach(listener => listener(newState))
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(operationId: string, listener: (state: LoadingStateManager) => void): () => void {
    const listeners = this.listeners.get(operationId) || []
    listeners.push(listener)
    this.listeners.set(operationId, listeners)

    // Return unsubscribe function
    return () => {
      const currentListeners = this.listeners.get(operationId) || []
      const filteredListeners = currentListeners.filter(l => l !== listener)
      this.listeners.set(operationId, filteredListeners)
    }
  }

  /**
   * Execute async operation with loading state management
   */
  async executeWithLoading<T>(
    operationId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      this.setState(operationId, 'loading')
      const result = await operation()
      this.setState(operationId, 'success')
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.setState(operationId, 'error', errorMessage)
      throw error
    }
  }

  /**
   * Clear loading state for an operation
   */
  clearState(operationId: string): void {
    this.states.delete(operationId)
    this.listeners.delete(operationId)
  }

  /**
   * Clear all loading states
   */
  clearAllStates(): void {
    this.states.clear()
    this.listeners.clear()
  }

  /**
   * Get all active loading operations
   */
  getActiveOperations(): string[] {
    return Array.from(this.states.entries())
      .filter(([, state]) => state.isLoading)
      .map(([id]) => id)
  }

  /**
   * Check if any operation is loading
   */
  hasActiveOperations(): boolean {
    return this.getActiveOperations().length > 0
  }
}

// Global loading manager instance
export const globalLoadingManager = new AsyncLoadingManager()

/**
 * Common loading operation IDs
 */
export const LOADING_OPERATIONS = {
  // Portfolio operations
  FETCH_STOCKS: 'fetch_stocks',
  CREATE_STOCK: 'create_stock',
  UPDATE_STOCK: 'update_stock',
  DELETE_STOCK: 'delete_stock',
  
  // Target portfolio operations
  FETCH_TARGET_PORTFOLIOS: 'fetch_target_portfolios',
  CREATE_TARGET_PORTFOLIO: 'create_target_portfolio',
  UPDATE_TARGET_PORTFOLIO: 'update_target_portfolio',
  DELETE_TARGET_PORTFOLIO: 'delete_target_portfolio',
  
  // Auth operations
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  SIGN_OUT: 'sign_out',
  
  // Rebalancing operations
  CALCULATE_REBALANCING: 'calculate_rebalancing',
  EXECUTE_REBALANCING: 'execute_rebalancing',
  
  // Data synchronization
  SYNC_DATA: 'sync_data',
  REALTIME_CONNECTION: 'realtime_connection'
} as const

/**
 * Loading state component helpers
 */
export const getLoadingProps = (state: LoadingStateManager) => ({
  isLoading: state.isLoading,
  isError: state.isError,
  isSuccess: state.isSuccess,
  error: state.error
})

/**
 * Loading state CSS class helpers
 */
export const getLoadingClasses = (state: LoadingStateManager) => ({
  container: state.isLoading ? 'pointer-events-none opacity-75' : '',
  button: state.isLoading ? 'opacity-50 cursor-not-allowed' : '',
  spinner: state.isLoading ? 'animate-spin' : 'hidden'
})

/**
 * Batch loading state manager for multiple operations
 */
export class BatchLoadingManager {
  private operations: Set<string> = new Set()
  private listeners: Array<(isLoading: boolean) => void> = []

  /**
   * Add an operation to the batch
   */
  addOperation(operationId: string): void {
    this.operations.add(operationId)
    this.notifyListeners()
  }

  /**
   * Remove an operation from the batch
   */
  removeOperation(operationId: string): void {
    this.operations.delete(operationId)
    this.notifyListeners()
  }

  /**
   * Check if any operation is active
   */
  isLoading(): boolean {
    return this.operations.size > 0
  }

  /**
   * Subscribe to batch loading state changes
   */
  subscribe(listener: (isLoading: boolean) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const isLoading = this.isLoading()
    this.listeners.forEach(listener => listener(isLoading))
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.operations.clear()
    this.notifyListeners()
  }
}

// Global batch loading manager
export const globalBatchLoadingManager = new BatchLoadingManager()