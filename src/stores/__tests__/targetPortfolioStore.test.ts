import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTargetPortfolioStore } from '../targetPortfolioStore'
import type { TargetPortfolioData, CreateTargetPortfolioData, UpdateTargetPortfolioData, TargetPortfolioAllocations } from '../../types/targetPortfolio'

// Mock dependencies
vi.mock('../../services/targetPortfolioService', () => ({
  targetPortfolioService: {
    getTargetPortfolios: vi.fn(),
    createTargetPortfolio: vi.fn(),
    updateTargetPortfolio: vi.fn(),
    deleteTargetPortfolio: vi.fn()
  }
}))

vi.mock('../../services/realtimeService', () => ({
  realtimeService: {
    subscribeToTargetPortfolios: vi.fn()
  }
}))

vi.mock('../../utils/sessionStorage', () => ({
  saveToSession: vi.fn(),
  loadFromSession: vi.fn(),
  SESSION_KEYS: {
    SELECTED_TARGET_PORTFOLIO: 'selected_target_portfolio'
  }
}))

describe('TargetPortfolioStore', () => {
  const mockAllocations: TargetPortfolioAllocations = {
    description: 'Balanced portfolio',
    stocks: [
      { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 60 },
      { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 40 }
    ],
    total_weight: 100
  }

  const mockTargetPortfolio: TargetPortfolioData = {
    id: 'portfolio-1',
    name: 'My Portfolio',
    allocations: mockAllocations,
    user_id: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset store state
    useTargetPortfolioStore.setState({
      targetPortfolios: [],
      selectedTargetPortfolio: null,
      isLoading: false,
      error: null
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())

      expect(result.current.targetPortfolios).toEqual([])
      expect(result.current.selectedTargetPortfolio).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('fetchTargetPortfolios', () => {
    it('should successfully fetch target portfolios', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.getTargetPortfolios.mockResolvedValue([mockTargetPortfolio])

      const { result } = renderHook(() => useTargetPortfolioStore())

      await act(async () => {
        await result.current.fetchTargetPortfolios()
      })

      expect(result.current.targetPortfolios).toEqual([mockTargetPortfolio])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      const error = new Error('Network error')
      targetPortfolioService.getTargetPortfolios.mockRejectedValue(error)

      const { result } = renderHook(() => useTargetPortfolioStore())

      await act(async () => {
        await result.current.fetchTargetPortfolios()
      })

      expect(result.current.targetPortfolios).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Network error')
    })

    it('should handle non-Error exceptions', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.getTargetPortfolios.mockRejectedValue('String error')

      const { result } = renderHook(() => useTargetPortfolioStore())

      await act(async () => {
        await result.current.fetchTargetPortfolios()
      })

      expect(result.current.error).toBe('Failed to fetch target portfolios')
    })

    it('should set loading states correctly', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.getTargetPortfolios.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([mockTargetPortfolio]), 100)
      }))

      const { result } = renderHook(() => useTargetPortfolioStore())

      const fetchPromise = act(async () => {
        await result.current.fetchTargetPortfolios()
      })

      // Initially loading should be true
      expect(result.current.isLoading).toBe(true)

      await fetchPromise

      // After completion, loading should be false
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('createTargetPortfolio', () => {
    it('should successfully create target portfolio with optimistic update', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.createTargetPortfolio.mockResolvedValue(mockTargetPortfolio)

      const { result } = renderHook(() => useTargetPortfolioStore())

      const createData: CreateTargetPortfolioData = {
        name: 'My Portfolio',
        allocations: mockAllocations
      }

      let createdPortfolio: TargetPortfolioData

      await act(async () => {
        createdPortfolio = await result.current.createTargetPortfolio(createData)
      })

      expect(createdPortfolio!).toEqual(mockTargetPortfolio)
      expect(result.current.targetPortfolios).toEqual([mockTargetPortfolio])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should revert optimistic update on error', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      const error = new Error('Create failed')
      targetPortfolioService.createTargetPortfolio.mockRejectedValue(error)

      const { result } = renderHook(() => useTargetPortfolioStore())

      const createData: CreateTargetPortfolioData = {
        name: 'My Portfolio',
        allocations: mockAllocations
      }

      await act(async () => {
        try {
          await result.current.createTargetPortfolio(createData)
        } catch (err) {
          // Expected to throw
        }
      })

      // Should revert to original state
      expect(result.current.targetPortfolios).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Create failed')
    })

    it('should handle optimistic update correctly', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.createTargetPortfolio.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(mockTargetPortfolio), 100)
      }))

      const { result } = renderHook(() => useTargetPortfolioStore())

      const createData: CreateTargetPortfolioData = {
        name: 'My Portfolio',
        allocations: mockAllocations
      }

      const createPromise = act(async () => {
        await result.current.createTargetPortfolio(createData)
      })

      // Should have optimistic portfolio added immediately
      expect(result.current.targetPortfolios).toHaveLength(1)
      expect(result.current.targetPortfolios[0].name).toBe('My Portfolio')
      expect(result.current.targetPortfolios[0].id).toMatch(/^temp_/)
      expect(result.current.isLoading).toBe(true)

      await createPromise

      // Should have real portfolio after create
      expect(result.current.targetPortfolios).toEqual([mockTargetPortfolio])
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('updateTargetPortfolio', () => {
    it('should successfully update target portfolio with optimistic update', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      const updatedPortfolio = { ...mockTargetPortfolio, name: 'Updated Portfolio' }
      targetPortfolioService.updateTargetPortfolio.mockResolvedValue(updatedPortfolio)

      const { result } = renderHook(() => useTargetPortfolioStore())

      // Set initial portfolios
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      const updateData: UpdateTargetPortfolioData = {
        id: 'portfolio-1',
        name: 'Updated Portfolio'
      }

      let updatedResult: TargetPortfolioData

      await act(async () => {
        updatedResult = await result.current.updateTargetPortfolio(updateData)
      })

      expect(updatedResult!).toEqual(updatedPortfolio)
      expect(result.current.targetPortfolios).toEqual([updatedPortfolio])
      expect(result.current.selectedTargetPortfolio).toEqual(updatedPortfolio)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should revert optimistic update on error', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      const error = new Error('Update failed')
      targetPortfolioService.updateTargetPortfolio.mockRejectedValue(error)

      const { result } = renderHook(() => useTargetPortfolioStore())

      const originalPortfolios = [mockTargetPortfolio]
      const originalSelected = mockTargetPortfolio

      // Set initial portfolios
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: originalPortfolios,
          selectedTargetPortfolio: originalSelected
        })
      })

      const updateData: UpdateTargetPortfolioData = {
        id: 'portfolio-1',
        name: 'Updated Portfolio'
      }

      await act(async () => {
        try {
          await result.current.updateTargetPortfolio(updateData)
        } catch (err) {
          // Expected to throw
        }
      })

      // Should revert to original state
      expect(result.current.targetPortfolios).toEqual(originalPortfolios)
      expect(result.current.selectedTargetPortfolio).toEqual(originalSelected)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Update failed')
    })

    it('should handle optimistic update correctly', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      const updatedPortfolio = { ...mockTargetPortfolio, name: 'Updated Portfolio' }
      targetPortfolioService.updateTargetPortfolio.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(updatedPortfolio), 100)
      }))

      const { result } = renderHook(() => useTargetPortfolioStore())

      // Set initial portfolios
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      const updateData: UpdateTargetPortfolioData = {
        id: 'portfolio-1',
        name: 'Updated Portfolio'
      }

      const updatePromise = act(async () => {
        await result.current.updateTargetPortfolio(updateData)
      })

      // Should have optimistic update immediately
      expect(result.current.targetPortfolios[0].name).toBe('Updated Portfolio')
      expect(result.current.selectedTargetPortfolio?.name).toBe('Updated Portfolio')
      expect(result.current.isLoading).toBe(true)

      await updatePromise

      // Should have real updated portfolio after update
      expect(result.current.targetPortfolios).toEqual([updatedPortfolio])
      expect(result.current.isLoading).toBe(false)
    })

    it('should update selected portfolio when it matches', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      const updatedPortfolio = { ...mockTargetPortfolio, name: 'Updated Portfolio' }
      targetPortfolioService.updateTargetPortfolio.mockResolvedValue(updatedPortfolio)

      const { result } = renderHook(() => useTargetPortfolioStore())

      // Set initial portfolios with selected matching the one being updated
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      const updateData: UpdateTargetPortfolioData = {
        id: 'portfolio-1',
        name: 'Updated Portfolio'
      }

      await act(async () => {
        await result.current.updateTargetPortfolio(updateData)
      })

      expect(result.current.selectedTargetPortfolio).toEqual(updatedPortfolio)
    })
  })

  describe('deleteTargetPortfolio', () => {
    it('should successfully delete target portfolio with optimistic update', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.deleteTargetPortfolio.mockResolvedValue(undefined)

      const { result } = renderHook(() => useTargetPortfolioStore())

      // Set initial portfolios
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      await act(async () => {
        await result.current.deleteTargetPortfolio('portfolio-1')
      })

      expect(result.current.targetPortfolios).toEqual([])
      expect(result.current.selectedTargetPortfolio).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should revert optimistic update on error', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      const error = new Error('Delete failed')
      targetPortfolioService.deleteTargetPortfolio.mockRejectedValue(error)

      const { result } = renderHook(() => useTargetPortfolioStore())

      const originalPortfolios = [mockTargetPortfolio]
      const originalSelected = mockTargetPortfolio

      // Set initial portfolios
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: originalPortfolios,
          selectedTargetPortfolio: originalSelected
        })
      })

      await act(async () => {
        try {
          await result.current.deleteTargetPortfolio('portfolio-1')
        } catch (err) {
          // Expected to throw
        }
      })

      // Should revert to original state
      expect(result.current.targetPortfolios).toEqual(originalPortfolios)
      expect(result.current.selectedTargetPortfolio).toEqual(originalSelected)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Delete failed')
    })

    it('should clear selected portfolio when deleted', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.deleteTargetPortfolio.mockResolvedValue(undefined)

      const { result } = renderHook(() => useTargetPortfolioStore())

      const anotherPortfolio = { ...mockTargetPortfolio, id: 'portfolio-2', name: 'Another Portfolio' }

      // Set initial portfolios with selected being the one to delete
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio, anotherPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      await act(async () => {
        await result.current.deleteTargetPortfolio('portfolio-1')
      })

      expect(result.current.targetPortfolios).toEqual([anotherPortfolio])
      expect(result.current.selectedTargetPortfolio).toBeNull()
    })

    it('should not affect selected portfolio when deleting different portfolio', async () => {
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))
      targetPortfolioService.deleteTargetPortfolio.mockResolvedValue(undefined)

      const { result } = renderHook(() => useTargetPortfolioStore())

      const anotherPortfolio = { ...mockTargetPortfolio, id: 'portfolio-2', name: 'Another Portfolio' }

      // Set initial portfolios with selected being different from the one to delete
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio, anotherPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      await act(async () => {
        await result.current.deleteTargetPortfolio('portfolio-2')
      })

      expect(result.current.targetPortfolios).toEqual([mockTargetPortfolio])
      expect(result.current.selectedTargetPortfolio).toEqual(mockTargetPortfolio)
    })
  })

  describe('Sync Actions', () => {
    it('should set target portfolios', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const portfolios = [mockTargetPortfolio]

      act(() => {
        result.current.setTargetPortfolios(portfolios)
      })

      expect(result.current.targetPortfolios).toEqual(portfolios)
    })

    it('should set selected target portfolio', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())

      act(() => {
        result.current.setSelectedTargetPortfolio(mockTargetPortfolio)
      })

      expect(result.current.selectedTargetPortfolio).toEqual(mockTargetPortfolio)
    })

    it('should set loading state', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should set error state', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())

      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.error).toBe('Test error')
    })

    it('should clear error', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())

      // Set initial error
      act(() => {
        useTargetPortfolioStore.setState({ error: 'Test error' })
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('subscribeToRealtime', () => {
    it('should subscribe to real-time updates', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))
      const mockUnsubscribe = vi.fn()
      realtimeService.subscribeToTargetPortfolios.mockReturnValue(mockUnsubscribe)

      const unsubscribe = result.current.subscribeToRealtime('user-1')

      expect(realtimeService.subscribeToTargetPortfolios).toHaveBeenCalledWith('user-1', expect.any(Function))
      expect(unsubscribe).toBe(mockUnsubscribe)
    })

    it('should handle INSERT events', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))

      let realtimeCallback: any

      realtimeService.subscribeToTargetPortfolios.mockImplementation((userId, callback) => {
        realtimeCallback = callback
        return vi.fn()
      })

      // Subscribe to real-time
      result.current.subscribeToRealtime('user-1')

      // Simulate INSERT event
      act(() => {
        realtimeCallback({
          eventType: 'INSERT',
          new: mockTargetPortfolio,
          old: null
        })
      })

      expect(result.current.targetPortfolios).toEqual([mockTargetPortfolio])
    })

    it('should handle UPDATE events', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))

      let realtimeCallback: any

      realtimeService.subscribeToTargetPortfolios.mockImplementation((userId, callback) => {
        realtimeCallback = callback
        return vi.fn()
      })

      // Set initial portfolios
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      // Subscribe to real-time
      result.current.subscribeToRealtime('user-1')

      const updatedPortfolio = { ...mockTargetPortfolio, name: 'Updated Portfolio' }

      // Simulate UPDATE event
      act(() => {
        realtimeCallback({
          eventType: 'UPDATE',
          new: updatedPortfolio,
          old: mockTargetPortfolio
        })
      })

      expect(result.current.targetPortfolios).toEqual([updatedPortfolio])
      expect(result.current.selectedTargetPortfolio).toEqual(updatedPortfolio)
    })

    it('should handle DELETE events', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))

      let realtimeCallback: any

      realtimeService.subscribeToTargetPortfolios.mockImplementation((userId, callback) => {
        realtimeCallback = callback
        return vi.fn()
      })

      // Set initial portfolios
      act(() => {
        useTargetPortfolioStore.setState({ 
          targetPortfolios: [mockTargetPortfolio],
          selectedTargetPortfolio: mockTargetPortfolio
        })
      })

      // Subscribe to real-time
      result.current.subscribeToRealtime('user-1')

      // Simulate DELETE event
      act(() => {
        realtimeCallback({
          eventType: 'DELETE',
          new: null,
          old: mockTargetPortfolio
        })
      })

      expect(result.current.targetPortfolios).toEqual([])
      expect(result.current.selectedTargetPortfolio).toBeNull()
    })
  })

  describe('Session Storage', () => {
    it('should save selected portfolio to session', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { saveToSession } = vi.mocked(require('../../utils/sessionStorage'))

      // Set selected portfolio
      act(() => {
        useTargetPortfolioStore.setState({ selectedTargetPortfolio: mockTargetPortfolio })
      })

      act(() => {
        result.current.saveSelectedToSession()
      })

      expect(saveToSession).toHaveBeenCalledWith('selected_target_portfolio', mockTargetPortfolio)
    })

    it('should not save when no portfolio selected', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { saveToSession } = vi.mocked(require('../../utils/sessionStorage'))

      act(() => {
        result.current.saveSelectedToSession()
      })

      expect(saveToSession).not.toHaveBeenCalled()
    })

    it('should load selected portfolio from session', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { loadFromSession } = vi.mocked(require('../../utils/sessionStorage'))

      loadFromSession.mockReturnValue(mockTargetPortfolio)

      act(() => {
        result.current.loadSelectedFromSession()
      })

      expect(result.current.selectedTargetPortfolio).toEqual(mockTargetPortfolio)
      expect(loadFromSession).toHaveBeenCalledWith('selected_target_portfolio')
    })

    it('should handle empty session storage', () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { loadFromSession } = vi.mocked(require('../../utils/sessionStorage'))

      loadFromSession.mockReturnValue(null)

      act(() => {
        result.current.loadSelectedFromSession()
      })

      expect(result.current.selectedTargetPortfolio).toBeNull()
    })
  })

  describe('Error States', () => {
    it('should handle async operation errors correctly', async () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))

      // Test different error types
      const operations = [
        { method: 'fetchTargetPortfolios', error: 'Failed to fetch target portfolios' },
        { method: 'createTargetPortfolio', error: 'Failed to create target portfolio' },
        { method: 'updateTargetPortfolio', error: 'Failed to update target portfolio' },
        { method: 'deleteTargetPortfolio', error: 'Failed to delete target portfolio' }
      ]

      for (const { method, error } of operations) {
        // Reset state
        act(() => {
          useTargetPortfolioStore.setState({ error: null })
        })

        if (method === 'fetchTargetPortfolios') {
          targetPortfolioService.getTargetPortfolios.mockRejectedValue(error)
          
          await act(async () => {
            await result.current.fetchTargetPortfolios()
          })
        } else if (method === 'createTargetPortfolio') {
          targetPortfolioService.createTargetPortfolio.mockRejectedValue(error)
          
          await act(async () => {
            try {
              await result.current.createTargetPortfolio({ name: 'Test', allocations: mockAllocations })
            } catch (err) {
              // Expected to throw
            }
          })
        } else if (method === 'updateTargetPortfolio') {
          targetPortfolioService.updateTargetPortfolio.mockRejectedValue(error)
          
          // Set initial portfolio
          act(() => {
            useTargetPortfolioStore.setState({ targetPortfolios: [mockTargetPortfolio] })
          })
          
          await act(async () => {
            try {
              await result.current.updateTargetPortfolio({ id: 'portfolio-1', name: 'Updated' })
            } catch (err) {
              // Expected to throw
            }
          })
        } else if (method === 'deleteTargetPortfolio') {
          targetPortfolioService.deleteTargetPortfolio.mockRejectedValue(error)
          
          // Set initial portfolio
          act(() => {
            useTargetPortfolioStore.setState({ targetPortfolios: [mockTargetPortfolio] })
          })
          
          await act(async () => {
            try {
              await result.current.deleteTargetPortfolio('portfolio-1')
            } catch (err) {
              // Expected to throw
            }
          })
        }

        expect(result.current.error).toBe(error)
      }
    })

    it('should clear error state on successful operations', async () => {
      const { result } = renderHook(() => useTargetPortfolioStore())
      const { targetPortfolioService } = vi.mocked(require('../../services/targetPortfolioService'))

      // Set initial error
      act(() => {
        useTargetPortfolioStore.setState({ error: 'Previous error' })
      })

      // Mock successful fetch
      targetPortfolioService.getTargetPortfolios.mockResolvedValue([mockTargetPortfolio])

      await act(async () => {
        await result.current.fetchTargetPortfolios()
      })

      expect(result.current.error).toBeNull()
    })
  })
})