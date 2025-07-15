import { ErrorInfo } from 'react'

export interface ErrorReport {
  error: Error
  errorInfo?: ErrorInfo
  timestamp: number
  userAgent: string
  url: string
  userId?: string
  context?: Record<string, unknown>
}

export interface ErrorHandlerOptions {
  logToConsole?: boolean
  logToStorage?: boolean
  showNotification?: boolean
  context?: Record<string, unknown>
}

export interface ApiError {
  message: string
  status?: number
  statusText?: string
  response?: unknown
  stack?: string
}

export interface DatabaseError {
  message: string
  code?: string
  details?: unknown
  stack?: string
}

export interface ValidationError {
  message: string
  field?: string
  stack?: string
}

class ErrorService {
  private errors: ErrorReport[] = []
  private maxErrors = 50 // Keep last 50 errors

  handleError(error: Error, options: ErrorHandlerOptions = {}): void {
    const errorReport: ErrorReport = {
      error,
      errorInfo: options.context?.errorInfo as ErrorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: options.context
    }

    // Add to internal storage
    this.errors.push(errorReport)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log to console if enabled
    if (options.logToConsole !== false) {
      console.error('Error handled by ErrorService:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date(errorReport.timestamp).toISOString(),
        context: options.context
      })
    }

    // Store in localStorage for persistence
    if (options.logToStorage !== false) {
      this.storeError(errorReport)
    }

    // Show user notification if enabled
    if (options.showNotification) {
      this.showErrorNotification(error)
    }
  }

  private storeError(errorReport: ErrorReport): void {
    try {
      const stored = localStorage.getItem('app_errors')
      const errors = stored ? JSON.parse(stored) : []
      errors.push({
        message: errorReport.error.message,
        timestamp: errorReport.timestamp,
        url: errorReport.url,
        context: errorReport.context
      })
      
      // Keep only last 20 errors in storage
      if (errors.length > 20) {
        errors.splice(0, errors.length - 20)
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors))
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e)
    }
  }

  private showErrorNotification(error: Error): void {
    // Create a simple toast notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm'
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <div>
          <div class="font-medium">Error occurred</div>
          <div class="text-sm opacity-90">${error.message}</div>
        </div>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
  }

  getErrors(): ErrorReport[] {
    return [...this.errors]
  }

  clearErrors(): void {
    this.errors = []
    localStorage.removeItem('app_errors')
  }

  getStoredErrors(): Record<string, unknown>[] {
    try {
      const stored = localStorage.getItem('app_errors')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.warn('Failed to retrieve stored errors:', e)
      return []
    }
  }

  // API error handler
  handleApiError(error: ApiError, endpoint: string, context?: Record<string, unknown>): void {
    const apiError = new Error(`API Error: ${endpoint} - ${error.message || 'Unknown error'}`)
    apiError.stack = error.stack
    
    this.handleError(apiError, {
      context: {
        ...context,
        endpoint,
        status: error.status,
        statusText: error.statusText,
        response: error.response
      },
      showNotification: true
    })
  }

  // Database error handler
  handleDatabaseError(error: DatabaseError, operation: string, context?: Record<string, unknown>): void {
    const dbError = new Error(`Database Error: ${operation} - ${error.message || 'Unknown error'}`)
    dbError.stack = error.stack
    
    this.handleError(dbError, {
      context: {
        ...context,
        operation,
        code: error.code,
        details: error.details
      },
      showNotification: true
    })
  }

  // Validation error handler
  handleValidationError(error: ValidationError, field: string, context?: Record<string, unknown>): void {
    const validationError = new Error(`Validation Error: ${field} - ${error.message || 'Invalid input'}`)
    
    this.handleError(validationError, {
      context: {
        ...context,
        field,
        validationType: 'input'
      },
      showNotification: false // Validation errors are usually handled in UI
    })
  }
}

export const errorService = new ErrorService()

// Global error handler
export const setupGlobalErrorHandler = (): void => {
  window.addEventListener('error', (event) => {
    errorService.handleError(event.error, {
      context: {
        type: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    errorService.handleError(error, {
      context: {
        type: 'unhandledRejection',
        reason: event.reason
      }
    })
  })
}