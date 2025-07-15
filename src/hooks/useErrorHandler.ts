import { useCallback } from 'react'
import { errorService, ApiError, DatabaseError, ValidationError } from '../services/errorService'

export interface UseErrorHandlerReturn {
  handleError: (error: Error, context?: Record<string, unknown>) => void
  handleApiError: (error: ApiError, endpoint: string, context?: Record<string, unknown>) => void
  handleDatabaseError: (error: DatabaseError, operation: string, context?: Record<string, unknown>) => void
  handleValidationError: (error: ValidationError, field: string, context?: Record<string, unknown>) => void
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback((error: Error, context?: Record<string, unknown>) => {
    errorService.handleError(error, { context, showNotification: true })
  }, [])

  const handleApiError = useCallback((error: ApiError, endpoint: string, context?: Record<string, unknown>) => {
    errorService.handleApiError(error, endpoint, context)
  }, [])

  const handleDatabaseError = useCallback((error: DatabaseError, operation: string, context?: Record<string, unknown>) => {
    errorService.handleDatabaseError(error, operation, context)
  }, [])

  const handleValidationError = useCallback((error: ValidationError, field: string, context?: Record<string, unknown>) => {
    errorService.handleValidationError(error, field, context)
  }, [])

  return {
    handleError,
    handleApiError,
    handleDatabaseError,
    handleValidationError
  }
}

// React error boundary hook
export const useErrorBoundary = () => {
  const { handleError } = useErrorHandler()
  
  return useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    handleError(error, { errorInfo })
  }, [handleError])
}