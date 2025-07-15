import { useState, useEffect } from 'react'
import { globalLoadingManager, type LoadingStateManager } from '../utils/loadingState'

/**
 * Hook to subscribe to loading state for a specific operation
 */
export const useLoadingState = (operationId: string): LoadingStateManager => {
  const [state, setState] = useState<LoadingStateManager>(() => 
    globalLoadingManager.getState(operationId)
  )

  useEffect(() => {
    const unsubscribe = globalLoadingManager.subscribe(operationId, setState)
    return unsubscribe
  }, [operationId])

  return state
}

/**
 * Hook to get loading states for multiple operations
 */
export const useMultipleLoadingStates = (operationIds: string[]): Record<string, LoadingStateManager> => {
  const [states, setStates] = useState<Record<string, LoadingStateManager>>(() => {
    const initialStates: Record<string, LoadingStateManager> = {}
    operationIds.forEach(id => {
      initialStates[id] = globalLoadingManager.getState(id)
    })
    return initialStates
  })

  useEffect(() => {
    const unsubscribers = operationIds.map(id => 
      globalLoadingManager.subscribe(id, (state) => {
        setStates(prev => ({ ...prev, [id]: state }))
      })
    )

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [operationIds])

  return states
}

/**
 * Hook to check if any of the specified operations are loading
 */
export const useAnyLoading = (operationIds: string[]): boolean => {
  const states = useMultipleLoadingStates(operationIds)
  return Object.values(states).some(state => state.isLoading)
}

/**
 * Hook to get aggregated loading state for multiple operations
 */
export const useAggregatedLoadingState = (operationIds: string[]): {
  isLoading: boolean
  hasError: boolean
  errors: string[]
  loadingCount: number
} => {
  const states = useMultipleLoadingStates(operationIds)
  const stateValues = Object.values(states)

  return {
    isLoading: stateValues.some(state => state.isLoading),
    hasError: stateValues.some(state => state.isError),
    errors: stateValues.filter(state => state.error).map(state => state.error!),
    loadingCount: stateValues.filter(state => state.isLoading).length
  }
}